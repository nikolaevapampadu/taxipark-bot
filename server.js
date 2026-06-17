require("dotenv").config();

const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();

app.use(express.json());

// Загружаем базу знаний
const knowledgeBase = fs.readFileSync(
  "./knowledge/knowledge.txt",
  "utf8"
);

function splitFaq(text) {
  return text
    .split(/FAQ\s+\d+/g)
    .map(item => item.trim())
    .filter(item => item.length > 30);
}

const faqItems = splitFaq(knowledgeBase);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(word => word.length > 2);
}

function findRelevantFaq(question, limit = 5) {
  const questionWords = normalize(question);

  const scored = faqItems.map(item => {
    const itemText = item.toLowerCase();

    let score = 0;

    for (const word of questionWords) {
      if (itemText.includes(word)) {
        score++;
      }
    }

    return {
      item,
      score
    };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.item)
    .join("\n\n---\n\n");
}

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

    console.log("Вопрос:", question);

    const relevantKnowledge = findRelevantFaq(question);

    if (!relevantKnowledge) {
      return res.json({
        answer:
          "Не нашёл точной информации в базе. Напишите менеджеру."
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "qwen/qwen3-32b:free",

        messages: [
          {
            role: "system",
            content: `
Ты Астерикс — помощник таксопарка Астерикс.

Отвечай только на основе найденных фрагментов базы знаний.

Правила:
- отвечай коротко и понятно;
- не придумывай информацию;
- не придумывай суммы, бонусы, сроки и выплаты;
- если ответа нет в базе, скажи:
"Не нашёл точной информации в базе. Напишите менеджеру.";
- не используй информацию вне базы знаний.

НАЙДЕННЫЕ ФРАГМЕНТЫ БАЗЫ:

${relevantKnowledge}
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
          "HTTP-Referer":
            "https://taxipark-bot-3sw2.onrender.com",
          "X-Title": "Asterix Courier Bot"
        }
      }
    );

    const answer =
      response.data.choices?.[0]?.message?.content ||
      "Не удалось получить ответ.";

    res.json({
      answer
    });

  } catch (error) {

    console.error(
      "Ошибка OpenRouter:",
      error.response?.data || error.message
    );

    res.json({
      answer: "Извините, сейчас не удалось получить ответ."
    });

  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});