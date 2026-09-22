const mongoose = require("mongoose");

const STAGES = ["Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected"];

const timelineEntrySchema = new mongoose.Schema(
  {
    stage: { type: String, enum: STAGES, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 120, default: "" },
    stage: { type: String, enum: STAGES, default: "Applied" },
    ctcOrStipend: { type: String, trim: true, maxlength: 60, default: "" },
    jobUrl: { type: String, trim: true, maxlength: 500, default: "" },
    appliedOn: { type: Date, default: Date.now },
    nextActionAt: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 4000, default: "" },
    order: { type: Number, default: 0 },
    timeline: { type: [timelineEntrySchema], default: () => [{ stage: "Applied" }] },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, stage: 1, order: 1 });

applicationSchema.pre("save", function trackStageChange(next) {
  if (this.isModified("stage")) {
    this.timeline.push({ stage: this.stage, at: new Date() });
  }
  next();
});

module.exports = mongoose.model("Application", applicationSchema);
module.exports.STAGES = STAGES;
