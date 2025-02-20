const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, index: true },
  email: { type: String, unique: true, required: true, index: true },
  password: String
});

module.exports = mongoose.model("User", UserSchema);
