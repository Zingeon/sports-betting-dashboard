# Sports Betting Dashboard

A modular microservices-based project for managing sports betting, built using **NestJS**, **PostgreSQL**, and **Google Sheets**.

---

## Microservices

- **Dashboard Service** – Syncs bets and games with Google Sheets  
- **Odds Service** – Handles game odds and result generation  
- **Bets Service** – Manages user bets and bet resolution  

---

## Installation

### 1. Clone the Repository

```bash
git clone git@github.com:Zingeon/sports-betting-dashboard.git
cd sports-betting-dashboard
npm i
```

### 2. Make .env files
In every single module create .env file (copy it from .env.example). In dashboard service provide please Google API credentials. In odds service provide Odds API key. In bets leave it as it is.

### 3. Start the Docker containers:
```bash
npm run db:up
```

### 4. Run All Microservices:
```bash
npm run start:all
```

### 5. Setup Google sheets
- Create a new Google Sheet.
- Share it with your GOOGLE_CLIENT_EMAIL.
- Create the following tabs: `games`, `place_bet` and `user_results`

### 6. Seed Test Bets to Sheet
```bash
npm run seed
```

## Running Tests
```bash
npm run test
```