const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// connect db
connectDB();

// middlewares
const corsOptions = {
  origin: ["http://localhost:5173", "https://headout-assignment-delta.vercel.app", "https://vistagram-application.vercel.app"], // allow local and new production frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if you want to allow cookies/auth
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/albums", require("./routes/albumRoutes"));
app.use("/api/ai", require("./controllers/aiController"));
app.use("/api/follow", require("./routes/followRoutes"));

app.get("/", (req, res) => res.send({ message: "Vistagram backend running" }));

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
