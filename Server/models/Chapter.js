const mongoose = require("mongoose");
const slugify = require("slugify");

const chapterSchema = new mongoose.Schema({
  manga: { type: mongoose.Schema.Types.ObjectId, ref: "Manga" },
  chapterNumber: Number,
  title: {
    type: String,
    unique: true,
  },
  content: [{ type: String }],
  uploadDate: { type: Date, default: Date.now },
  uploader: String,
  novelContent: Object,
  publishDate: { type: Date, default: Date.now },
  slug: {
    type: String,
    default: function () {
      return slugify(this.title, { lower: true });
    },
  },
});

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;
