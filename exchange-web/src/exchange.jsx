import React, { useState, useEffect } from "react";

const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "USDT", name: "Tether" },
    { code: "BTC", name: "Bitcoin" }
];

export default function CurrencyConverter() {
    const [amount, setAmount] = useState(100);
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("USDT");
    const [exchangeRates, setExchangeRates] = useState({});

    useEffect(() => {
        async function fetchRates() {
            try {
                const response = await fetch("http://localhost:3000/api/exchange-rate");
                const data = await response.json();
                setExchangeRates(data?.exchangeData);
            } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
            }
        }
        fetchRates();
    }, []);

    const getExchangeRate = (from, to) => {
        const key = `${from}_${to}`;
        return exchangeRates[key] ?? 1;
    };

    const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
    const converted = (amount * exchangeRate).toFixed(4);
    const formattedAmount = parseFloat(amount).toFixed(2);

    const handleVoice = () => {
        const message = `${formattedAmount} ${fromCurrency} equals ${converted} ${toCurrency}`;
        const utterance = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utterance);
    };

    const handleMockAI = () => {
        alert("Mock AI activated!");
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="flex shadow-xl rounded-2xl overflow-hidden">
                {/* <button
                    onClick={handleMockAI}
                    className="bg-green-600 hover:bg-green-700 text-white text-lg font-bold px-5 py-8"
                >
                    Chat with AI
                </button> */}

                <button
                    onClick={handleVoice}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-5 py-8"
                >
                    🔊 Speak
                </button>

                <div className="bg-white p-8 max-w-md w-full border-l space-y-6">
                    <div className="text-center text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Rate guaranteed (8h)
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2 text-sm">Amount</label>
                        <div className="flex items-center border rounded-xl p-3">
                            <input
                                type="number"
                                className="w-full text-xl font-semibold focus:outline-none"
                                value={formattedAmount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <select
                                className="ml-4 text-base bg-white font-medium focus:outline-none"
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2 text-sm">Converted to</label>
                        <div className="flex items-center border rounded-xl p-3 bg-gray-50">
                            <span className="w-full text-xl font-semibold">{converted}</span>
                            <select
                                className="ml-4 text-base bg-white font-medium focus:outline-none"
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        {`${formattedAmount} ${fromCurrency} = ${converted} ${toCurrency}`}
                    </div>

                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-black text-lg font-semibold py-3 px-6 rounded-xl">
                        Send money
                    </button>
                </div>
            </div>
        </div>
    );
}
