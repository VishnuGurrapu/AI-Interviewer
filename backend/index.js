import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "Server is healthy" });
});

// API routes
app.use("/api", apiRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ai-interviewer")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
