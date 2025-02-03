const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 400;

const PUBLIC_DIR = path.join(__dirname, "public");
const COMMENTS_FILE = path.join(PUBLIC_DIR, "comments.json");

app.use(express.static(PUBLIC_DIR));
app.use(express.json());

app.get("/comments.json", (req, res) => {
    if (fs.existsSync(COMMENTS_FILE)) {
        res.sendFile(COMMENTS_FILE);
    } else {
        res.status(404).json({ error: "comments.json not found" });
    }
});

app.post("/add-comment", (req, res) => {
    let { productId, name, text } = req.body;
    productId = Number(productId);

    if (!productId || !name || !text) {
        return res.status(400).json({ error: "Invalid request data" });
    }

    try {
        let comments = fs.existsSync(COMMENTS_FILE) ? JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf8")) : {};

        if (!comments[productId]) {
            comments[productId] = [];
        }

        comments[productId].push({ name, text });
        fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), "utf8");

        res.json({ success: true, message: "Comment added successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error saving comment." });
    }
});


const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = { app, server };
