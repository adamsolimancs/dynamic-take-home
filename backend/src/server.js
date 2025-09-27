import dotenv from "dotenv";
import http from "http";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 4000;


// Create HTTP server
const server = http.createServer(app);


server.listen(PORT, () => {
console.log(`🚀 Server running on http://localhost:${PORT}`);
});
