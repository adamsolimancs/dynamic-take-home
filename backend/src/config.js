import dotenv from "dotenv";

dotenv.config();

const config = {
  app: {
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || "",
    ETH_RPC_URL: process.env.ETH_RPC_URL || "",
  },

//   db: {
//     uri: process.env.DATABASE_URI || "mongodb://localhost:27017/myapp",
//   },

//   auth: {
//     dynamic: {
//       clientId: process.env.DYNAMIC_CLIENT_ID || "",
//       clientSecret: process.env.DYNAMIC_CLIENT_SECRET || "",
//     },
//   },

//   blockchain: {
//     enabled: false, // set true if you later add wallet integration
//     network: process.env.BLOCKCHAIN_NETWORK || "testnet",
//   },
};

export default config;