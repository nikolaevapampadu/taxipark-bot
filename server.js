require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Таксопарк бот работает 🚕");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});