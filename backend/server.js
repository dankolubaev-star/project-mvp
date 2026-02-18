const express = require("express");
const path = require("path");
const { prisma } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Healthcheck (оставляем JSON)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// === API ===
app.get("/messages", async (req, res) => {
  try {
    const take = Math.min(Number(req.query.take || 50), 200);
    const messages = await prisma.message.findMany({
      take,
      orderBy: { createdAt: "desc" },
      include: { sender: true },
    });
    res.json(messages.reverse());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

app.post("/messages", async (req, res) => {
  try {
    const { text, senderId } = req.body;
    if (!text || !senderId) {
      return res.status(400).json({ error: "text and senderId are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: senderId } });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Unknown senderId (user not found)", senderId });
    }

    const msg = await prisma.message.create({
      data: {
        text,
        senderId,
      },
      include: { sender: true },
    });

    res.json(msg);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// === Frontend ===
// Статика
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Корень — отдаём index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
