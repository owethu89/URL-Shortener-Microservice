const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const urls = []; // In-memory storage

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// POST endpoint to shorten a URL
app.post("/api/shorturl", (req, res) => {
  const inputUrl = req.body.url;
  const hostname = urlParser.parse(inputUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    } else {
      const id = urls.length + 1;
      urls.push({ original_url: inputUrl, short_url: id });
      res.json({ original_url: inputUrl, short_url: id });
    }
  });
});

// Redirect using short URL
app.get("/api/shorturl/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const entry = urls.find((item) => item.short_url === id);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
