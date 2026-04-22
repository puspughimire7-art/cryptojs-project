const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = 5000;
const SECRET_KEY = "mySuperSecretKey123";

app.use(cors());
app.use(express.json());

/* -----------------------------
   BLOCK CLASS
------------------------------ */
class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.data)
      )
      .digest("hex");
  }
}

/* -----------------------------
   BLOCKCHAIN CLASS
------------------------------ */
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(
      0,
      new Date().toISOString(),
      { message: "Genesis Block" },
      "0"
    );
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      this.getLatestBlock().hash
    );

    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

const myBlockchain = new Blockchain();

/* -----------------------------
   ROUTES
------------------------------ */

// Home
app.get("/", (req, res) => {
  res.send("CryptoJS + Blockchain backend is running");
});

// SHA256 Hash
app.post("/hash", (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required." });
    }

    const hash = crypto.createHash("sha256").update(text).digest("hex");

    res.json({
      originalText: text,
      sha256Hash: hash
    });
  } catch (error) {
    res.status(500).json({ error: "Hashing failed." });
  }
});

// HMAC
app.post("/hmac", (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required." });
    }

    const hmac = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(text)
      .digest("hex");

    res.json({
      originalText: text,
      hmacSha256: hmac
    });
  } catch (error) {
    res.status(500).json({ error: "HMAC generation failed." });
  }
});

// Add Block
app.post("/add-block", (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required." });
    }

    const newBlock = myBlockchain.addBlock({ encryptedMessage: text });

    res.json({
      message: "Block added successfully",
      block: newBlock
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add block." });
  }
});

// View Blockchain
app.get("/chain", (req, res) => {
  res.json(myBlockchain.chain);
});

// Validate Blockchain
app.get("/validate", (req, res) => {
  res.json({
    isValid: myBlockchain.isChainValid()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});