require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
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

Правила ответов:
- отвечай дружелюбно;
- отвечай коротко и понятно;
- не придумывай информацию;
- если не уверен в ответе, рекомендуй обратиться к менеджеру;
- используй простой язык без сложных терминов.

Вопрос пользователя:

${question}
`
    });

    res.json({
      answer: response.text
    });

  } catch (error) {
    console.error("Ошибка Gemini:", error);

    res.json({
      answer: "Извините, сейчас не удалось получить ответ."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});