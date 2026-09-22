const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "That email is already registered." });
      }

      const user = await User.create({ name, email, password });
      const token = signToken(user);
      res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Incorrect email or password." });
      }

      const token = signToken(user);
      res.json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
