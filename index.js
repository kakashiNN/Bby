const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const DATA_FILE = "./teachings.json";

// Load data
const loadData = () => {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

// Save data
const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

const BOT_NAME = "Nirob";

// Teach new reply
app.post("/teach", (req, res) => {
    const { message, reply, userID } = req.body;
    if (!message || !reply) return res.status(400).send({ error: "Missing message or reply" });

    const data = loadData();
    if (!data[message.toLowerCase()]) data[message.toLowerCase()] = [];
    data[message.toLowerCase()].push({ reply, teacher: userID || "unknown" });
    saveData(data);

    res.send({ message: `✅ Reply added by ${BOT_NAME}!`, data: data[message.toLowerCase()] });
});

// Get a reply
app.get("/reply", (req, res) => {
    const { message } = req.query;
    const data = loadData();
    if (!data[message.toLowerCase()]) return res.send({ reply: `${BOT_NAME} doesn't know that yet!` });

    const replies = data[message.toLowerCase()];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    res.send({ reply: randomReply.reply, teacher: randomReply.teacher });
});

// List all
app.get("/list", (req, res) => {
    const data = loadData();
    res.send({ bot: BOT_NAME, totalMessages: Object.keys(data).length, data });
});

// Remove reply
app.delete("/remove", (req, res) => {
    const { message, index } = req.body;
    const data = loadData();
    if (!data[message.toLowerCase()] || data[message.toLowerCase()].length <= index)
        return res.status(400).send({ error: "Invalid message or index" });

    data[message.toLowerCase()].splice(index, 1);
    saveData(data);
    res.send({ message: `✅ Reply removed by ${BOT_NAME}!`, data: data[message.toLowerCase()] });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`${BOT_NAME} API running on port ${PORT}`));
