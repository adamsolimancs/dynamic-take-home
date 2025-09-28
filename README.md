# VenCura – Custodial Wallet API

This is my implementation of the **Dynamic take-home backend assignment**.
The goal was to build a minimal custodial wallet service ("VenCura") with a backend API and a simple frontend to showcase functionality.

---

## Project Structure

```
/project-root
  /backend       # Express.js server with wallet APIs
  /frontend      # Vite + React UI for interacting with the API
```

---

## Features

* **User & Wallet Management**

  * Authenticated user can create one or more wallets.
* **API Endpoints** (beginning with /api/wallets)

  * `POST /create` → Create a wallet (returns address + id)
  * `GET /:id/balance` → Get wallet balance
  * `POST /:id/signMessage` → Sign a message with wallet
  * `POST /:id/sendTransaction` → Send a transaction
* **Frontend**

  * Minimal React UI to demo wallet creation and interactions
* **Blockchain**

  * Uses [ethers.js](https://docs.ethers.org/) (Sepolia testnet) for wallet and transaction handling

---

## Tech Stack

* **Frontend**: React (Vite)
* **Backend**: Node.js, Express, ethers.js
* **Authentication**: Dynamic.xyz authentication SDK
* **Database**: Mocked with an in-memory store
* **Deployment**: Vercel (frontend) + Heroku/Render (backend)

---

## Security Considerations

* 🔒 Private keys are stored **in plaintext** for demo purposes.

  * In production: keys should be encrypted or managed via an HSM / key vault.
* Authentication is simplified; a full OAuth/JWT solution would be needed in production.
* No rate limiting or DDOS protection included.

---

## Local Setup Instructions

### Prerequisites

* Node.js 18+
* npm or yarn

### 1. Backend

```bash
cd backend
npm install
node src/server.js
```

The backend will start on `http://localhost:4000`

Set the RPC endpoint you want to use in `backend/.env`:

```bash
ETH_RPC_URL="https://sepolia.infura.io/v3/<your-key>"
```

> Any Ethereum-compatible JSON-RPC URL works (Alchemy, Infura, Anvil, Hardhat, etc.).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## API Reference

### Create Wallet

```http
POST /api/wallets/create
```

**Response**

```json
{
  "id": "1",
  "address": "0x123..."
}
```

### Get Balance

```http
GET /api/wallets/:id/balance
```

**Response**

```json
{
  "balance": "0.05"
}
```

### Sign Message

```http
POST /api/wallets/:id/signMessage
{
  "message": "hello world"
}
```

**Response**

```json
{
  "signedMessage": "0xabcd..."
}
```

### Send Transaction

```http
POST /api/wallets/:id/sendTransaction
{
  "to": "0xabc...",
  "amount": 0.01
}
```

**Response**

```json
{
  "transactionHash": "0xdef..."
}
```

---

## Deployment

* **Backend**: Render
* **Frontend**: Vercel

---

## Future Improvements

* Encrypt private keys before storage
* Add multi-account per user
* For simplicity, wallets are stored in memory. In production, I would use a database (Postgres/SQLite) with encryption for private keys.
* Shared wallets with access control
* Transaction history (on/off-chain)
* Comprehensive test coverage

