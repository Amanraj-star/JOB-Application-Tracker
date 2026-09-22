const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Application = require("../models/Application");
const { STAGES } = require("../models/Application");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return false;
  }
  return true;
}

// GET /api/applications  -> all of the current user's applications, grouped by stage order
router.get("/", async (req, res, next) => {
  try {
    const apps = await Application.find({ user: req.user._id }).sort({ stage: 1, order: 1, createdAt: -1 });
    res.json({ applications: apps, stages: STAGES });
  } catch (err) {
    next(err);
  }
});

// GET /api/applications/stats -> quick counts per stage, for a dashboard header
router.get("/stats", async (req, res, next) => {
  try {
    const counts = await Application.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);
    const stats = Object.fromEntries(STAGES.map((s) => [s, 0]));
    counts.forEach(({ _id, count }) => {
      stats[_id] = count;
    });
    res.json({ stats, total: Object.values(stats).reduce((a, b) => a + b, 0) });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  [
    body("company").trim().notEmpty().withMessage("Company is required."),
    body("role").trim().notEmpty().withMessage("Role is required."),
    body("stage").optional().isIn(STAGES).withMessage("Invalid stage."),
  ],
  async (req, res, next) => {
    if (!checkValidation(req, res)) return;
    try {
      const { company, role, location, stage, ctcOrStipend, jobUrl, appliedOn, nextActionAt, notes } = req.body;

      const lastInStage = await Application.findOne({ user: req.user._id, stage: stage || "Applied" }).sort("-order");
      const order = lastInStage ? lastInStage.order + 1 : 0;

      const app = await Application.create({
        user: req.user._id,
        company,
        role,
        location,
        stage: stage || "Applied",
        ctcOrStipend,
        jobUrl,
        appliedOn,
        nextActionAt,
        notes,
        order,
      });

      res.status(201).json({ application: app });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", param("id").isMongoId(), async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ message: "Application not found." });
    res.json({ application: app });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("company").optional().trim().notEmpty(),
    body("role").optional().trim().notEmpty(),
    body("stage").optional().isIn(STAGES).withMessage("Invalid stage."),
  ],
  async (req, res, next) => {
    if (!checkValidation(req, res)) return;
    try {
      const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
      if (!app) return res.status(404).json({ message: "Application not found." });

      const editable = [
        "company",
        "role",
        "location",
        "stage",
        "ctcOrStipend",
        "jobUrl",
        "appliedOn",
        "nextActionAt",
        "notes",
      ];
      editable.forEach((field) => {
        if (req.body[field] !== undefined) app[field] = req.body[field];
      });

      await app.save();
      res.json({ application: app });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/applications/:id/move -> used by the kanban board on drag-and-drop
router.patch(
  "/:id/move",
  [
    param("id").isMongoId(),
    body("stage").isIn(STAGES).withMessage("Invalid stage."),
    body("order").isInt({ min: 0 }).withMessage("Order must be a non-negative integer."),
  ],
  async (req, res, next) => {
    if (!checkValidation(req, res)) return;
    try {
      const { stage, order } = req.body;
      const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
      if (!app) return res.status(404).json({ message: "Application not found." });

      // Make room in the destination column, then drop the card into place.
      await Application.updateMany(
        { user: req.user._id, stage, order: { $gte: order }, _id: { $ne: app._id } },
        { $inc: { order: 1 } }
      );

      app.stage = stage;
      app.order = order;
      await app.save();

      res.json({ application: app });
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", param("id").isMongoId(), async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ message: "Application not found." });
    res.json({ message: "Application deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
