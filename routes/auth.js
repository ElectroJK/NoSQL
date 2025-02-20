const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).send("Email is already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, password: hashedPassword });

  res.redirect("/login.html");
});

router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
      return res.status(404).send("Email not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.send("Password updated successfully");
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid email or password");
  }

  req.session.user = { _id: user._id, username: user.username, email: user.email };
  res.redirect("/index.html");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

router.get("/user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.session.user);
});

module.exports = router;
