import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import todoRouter from "./routes/todoRoutes.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is healthy" });
});

app.use("/api/todos", todoRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Connect to MongoDB and start the server

connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
