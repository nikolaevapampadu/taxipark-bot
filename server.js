require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Таксопарк бот работает 🚕");
});
app.post("/ask", async (req, res) => {
  try {

    const question = req.body.question;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
Ты Астерикс — помощник таксопарка Астерикс.

Помогаешь курьерам Яндекс Еды:
- регистрация
- самозанятость
- установка Яндекс Про
- подключение к парку
- бонусы
- первый слот
- поддержка

Отвечай коротко, понятно и дружелюбно.
Если не уверен в ответе — рекомендуй обратиться к менеджеру.
`
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    res.json({
      answer: completion.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.json({
      answer: "Извините, сейчас не удалось получить ответ."
    });

  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});