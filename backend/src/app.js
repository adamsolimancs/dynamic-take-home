import express from "express";
import morgan from "morgan";
import cors from "cors";
import walletRoutes from "./routes/walletRoutes.js";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS (frontend -> backend)
app.use(morgan("dev")); // Dev logging


// Routes
app.use("/api/wallets", walletRoutes);


// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

export default app;