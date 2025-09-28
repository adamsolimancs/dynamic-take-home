import dotenv from "dotenv";

dotenv.config();

const config = {
  app: {
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || "",
    ETH_RPC_URL: process.env.ETH_RPC_URL || "",
  },
};

export default config;