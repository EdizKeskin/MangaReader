const mongoose = require("mongoose");
const slugify = require("slugify");

const mangaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  author: String,
  artist: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
  summary: String,
  coverImage: String,
  uploadDate: Date,
  uploader: String,
  type: {
    type: String,
    default: "manga",
  },
  slug: {
    type: String,
    default: function () {
      const nameWithDashes = this.name.replace(/\./g, "-");
      return slugify(nameWithDashes, { lower: true, strict: true });
    },
  },
  // New fields
  isActive: {
    type: Boolean,
    default: true,
  },
  isAdult: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed", "dropped", "hiatus", "güncel"],
    default: "ongoing",
  },
  otherNames: {
    type: [String],
    default: [],
  },
  releaseYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 10,
  },
});

// Pre-save middleware to update slug when name changes
mangaSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    const nameWithDashes = this.name.replace(/\./g, "-");
    this.slug = slugify(nameWithDashes, { lower: true, strict: true });
  }
  next();
});

// Pre-findOneAndUpdate middleware for PATCH requests
mangaSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    const nameWithDashes = update.name.replace(/\./g, "-");
    update.slug = slugify(nameWithDashes, { lower: true, strict: true });
  }
  next();
});

const Manga = mongoose.model("Manga", mangaSchema);

module.exports = Manga;
