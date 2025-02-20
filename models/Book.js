const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  author: { type: String, required: true, index: true },
  status: { type: String, default: "Want to Read" },
  rating: { type: Number, min: 1, max: 5, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
});

module.exports = mongoose.model("Book", bookSchema);
