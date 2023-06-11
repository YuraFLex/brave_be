require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2");
const router = require("./src/router/index");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const db = require('./src/config/db')
const sequelize = require('./src/config/sequelize')

const PORT = process.env.PORT || 3020;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use("/api", router);
app.use(errorMiddleware);

// const connection = db

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to database:", err);
//     return;
//   }
//   console.log("Connected to database successfully");
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
