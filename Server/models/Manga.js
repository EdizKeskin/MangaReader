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
      return slugify(this.name, { lower: true });
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

const Manga = mongoose.model("Manga", mangaSchema);

module.exports = Manga;
