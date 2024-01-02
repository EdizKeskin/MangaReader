const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: String,
  contents: Object,
  uploadDate: { type: Date, default: Date.now },
  uploader: String,
  link: String,
  isActive: { type: Boolean, default: true },
});

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
