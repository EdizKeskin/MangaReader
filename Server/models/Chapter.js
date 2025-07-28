const mongoose = require("mongoose");
const slugify = require("slugify");

const chapterSchema = new mongoose.Schema({
  manga: { type: mongoose.Schema.Types.ObjectId, ref: "Manga" },
  chapterNumber: Number,
  title: {
    type: String,
  },
  content: [{ type: String }],
  uploadDate: { type: Date, default: Date.now },
  uploader: String,
  novelContent: Object,
  publishDate: { type: Date, default: Date.now },
  // Yeni özellikler
  isActive: {
    type: Boolean,
    default: true,
  },
  isAdult: {
    type: Boolean,
    default: false,
  },
  chapterType: {
    type: String,
    enum: ["manga", "novel", "webtoon"],
    default: "manga",
  },
  slug: {
    type: String,
    default: function () {
      const titleWithDashes = this.title.replace(/\./g, "-");
      return slugify(titleWithDashes, { lower: true, strict: true });
    },
  },
});

// Pre-save middleware to update slug when title changes
chapterSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    const titleWithDashes = this.title.replace(/\./g, "-");
    this.slug = slugify(titleWithDashes, { lower: true, strict: true });
  }
  next();
});

// Pre-findOneAndUpdate middleware for PATCH requests
chapterSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.title) {
    const titleWithDashes = update.title.replace(/\./g, "-");
    update.slug = slugify(titleWithDashes, { lower: true, strict: true });
  }
  next();
});

// Compound unique index to ensure title is unique per manga
chapterSchema.index({ manga: 1, title: 1 }, { unique: true });

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;
