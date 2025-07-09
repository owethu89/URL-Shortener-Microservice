const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const Url = require("./models/Url");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/urlshortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// === POST ===
app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url;

  // Validate domain
  try {
    const hostname = new URL(url).hostname;

    dns.lookup(hostname, async (err) => {
      if (err) return res.json({ error: "Invalid URL" });

      // Check if already exists
      let found = await Url.findOne({ original_url: url });
      if (found) return res.json(found);

      // Count for short ID
      const count = await Url.countDocuments();
      const newUrl = new Url({ original_url: url,
