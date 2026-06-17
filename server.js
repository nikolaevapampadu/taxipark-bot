require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Таксопарк бот работает 🚕");
});

app.post("/ask", async (req, res) => {
  try {
    const question = req.body.question;

    if (!question) {
      return res.json({
        answer: "Пожалуйста, задайте вопрос."
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: `
Ты Астерикс — помощник таксопарка Астерикс.

Помогаешь курьерам Яндекс Еды по вопросам:
- регистрация
- самозанятость
- установка Яндекс Про
- подключение к парку
- бонусы
- первый слот
- выплаты
- поддержка

Правила:
- отвечай коротко, дружелюбно и понятно;
- не придумывай точные ставки, бонусы и правила;
- если не уверен, отправляй к менеджеру;
- не обещай выплаты и условия, если их нет в вопросе или базе.
`
          },
          {
            role: "user",
            content: question
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://taxipark-bot-3sw2.onrender.com",
          "X-OpenRouter-Title": "Asterix Courier Bot"
        }
      }
    );

    res.json({
      answer: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error("Ошибка OpenRouter:", error.response?.data || error.message);

    res.json({
      answer: "Извините, сейчас не удалось получить ответ."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});