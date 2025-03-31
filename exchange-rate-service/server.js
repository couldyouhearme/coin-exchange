require("dotenv").config();
const express = require("express");
const cors = require('cors');
const axios = require("axios");
const redis = require("redis");
const { exec } = require("child_process");
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'https://your-frontend-domain.com'
];

function startRedis() {
    exec("redis-server --daemonize yes", (err, stdout, stderr) => {
        if (err) {
            console.error("Failed to start Redis:", stderr);
        } else {
            console.log("Redis started.");
        }
    });
}

function stopRedis() {
    exec("redis-cli shutdown", (err, stdout, stderr) => {
        if (err) {
            console.error("Failed to stop Redis:", stderr);
        } else {
            console.log("Redis stopped.");
        }
    });
}

startRedis();

const redisClient = redis.createClient();

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Connected to Redis.");
    } catch (error) {
        console.error("Redis connection error:", error);
    }
}
connectRedis();

redisClient.on("error", (err) => console.error("Redis Error:", err));

// distributed rate limiter (shared across all API instances)
const limiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args).catch(console.error),
    }),
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 10, // allow 10 requests per user per 10 mins
    message: {
        status: 429,
        error: "Too many requests, please try again later."
    },
    standardHeaders: true, // Send X-RateLimit-* headers; Sends rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
});

// apply rate limiter to API routes
app.use("/exchange-rate", limiter);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: false,
}));

app.get("/api", (req, res) => {
    res.send("Welcome to the Exchange Rate API!");
});

app.get("/api/exchange-rate", async (req, res) => {
    try {
        const cacheData = await redisClient.get("exchange_rate");
        if (cacheData) {
            return res.json({ source: "cache", exchangeData: JSON.parse(cacheData) });
        }
        //const response = await axios.get(EXCHANGE_RATE_API);
        // const exchangeRate = response.data.rates.CNY; // Get USD to CNY rate
        // const exchangeData = {
        //     base: "USD",
        //     target: "CNY",
        //     exchangeRate: exchangeRate,
        // };
        const mockExchangeRates = {
            "USD_EUR": 0.926,
            "USD_JPY": 149.5,
            "USD_USDT": 1.0,
            "USD_BTC": 0.000025,

            "EUR_USD": 1.08,
            "EUR_JPY": 161.5,
            "EUR_USDT": 1.08,
            "EUR_BTC": 0.000027,

            "JPY_USD": 0.0067,
            "JPY_EUR": 0.0062,
            "JPY_USDT": 0.0067,
            "JPY_BTC": 0.00000017,

            "USDT_USD": 1.0,
            "USDT_EUR": 0.93,
            "USDT_JPY": 149.0,
            "USDT_BTC": 0.000024,

            "BTC_USD": 40000,
            "BTC_EUR": 37000,
            "BTC_JPY": 6000000,
            "BTC_USDT": 41600
        };
        await redisClient.setEx("exchange_rate", 600, JSON.stringify(mockExchangeRates));
        res.json({ source: "API", exchangeData: mockExchangeRates });
    } catch (error) {
        console.error("Error fetching exchange rate:", error.message);
        res.status(500).json({ error: "Failed to fetch exchange rate" });
    }
});

process.on("SIGINT", async () => {
    console.log("\nShutting down Redis...");
    await redisClient.quit();
    stopRedis();
    process.exit(0);
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
