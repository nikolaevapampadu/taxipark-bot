require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Таксопарк бот работает 🚕");
});
app.post("/ask", async (req, res) => {

  const question = req.body.question;

  console.log("Вопрос:", question);

  res.json({
    answer: "Получил вопрос: " + question
  });

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});