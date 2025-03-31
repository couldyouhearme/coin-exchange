## Coin Exchange 
#### A Barebone Simple Web Applicaiton.
- user can toggle the exchange amount and unit, and preview the 8hr-guaranteed exchange rate
- user can press the "speak" button to activate the vocal mode
- user can press the "send money" button to trigger the coin transfer flow (UI only, not implemented)

#### Teach stack: 
- React for Frontend
- Node.js for backend (manually insert mock data for stable demo; for real-time data, uncomment/replace with 3rd party EXCHANGE_RATE_API)
- Rate limiter is added to prevent user abuse and protect backend resources 
- Redis cache is implemented to improve response speed and to reduces loads on the server
- Open AI and langchain npm packages are installed, for future AI feature enhancements
  
<img width="666" alt="Screenshot 2025-03-31 at 2 17 56 PM" src="https://github.com/user-attachments/assets/626c962a-24a4-4263-b71b-587c50092358" />
<img width="666" alt="Screenshot 2025-03-31 at 2 18 21 PM" src="https://github.com/user-attachments/assets/5da14716-df94-4707-9559-c26ba70de1e0" />
