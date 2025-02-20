const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const books = await Book.find({ userId: req.session.user._id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Error fetching books" });
  }
});

router.get("/search", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Search query is required" });

    const books = await Book.find({
      userId: req.session.user._id,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } }
      ]
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Error searching books" });
  }
});

router.get("/filter", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let { status } = req.query;
    if (!status) return res.status(400).json({ error: "Status is required" });

    status = status.trim().toLowerCase();

    const books = await Book.find({
      userId: req.session.user._id,
      status: { $regex: `^${status}$`, $options: "i" }
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Error filtering books" });
  }
});


router.post("/add", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let { title, author, status, rating } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" });
    }

    const userId = req.session.user._id;

    if (!status) status = "Want to Read";
    if (rating && (isNaN(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    const newBook = new Book({ title, author, status, rating, userId });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.post("/update/:id", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let { status, rating } = req.body;
    const bookId = req.params.id;

    const validStatuses = ["Want to Read", "Reading", "Read"];
    status = validStatuses.find(s => s.toLowerCase() === status?.trim().toLowerCase());

    if (!status) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (rating !== null && (isNaN(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Invalid rating. It must be a number between 1 and 5." });
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, userId: req.session.user._id },
      { status, rating },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const deletedBook = await Book.findOneAndDelete({ _id: req.params.id, userId: req.session.user._id });

    if (!deletedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting book" });
  }
});

module.exports = router;
