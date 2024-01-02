const express = require("express");
const Announcement = require("../models/Announcement");
const router = express.Router();

router.get("/list/:limit", async (req, res) => {
  const { limit } = req.params;
  try {
    let query = Announcement.find().sort({ uploadDate: -1 });
    const totalLength = await Announcement.countDocuments();

    if (limit && !isNaN(limit) && parseInt(limit) > 0) {
      query = query.limit(parseInt(limit));
    }

    const announcements = await query.exec();

    if (!announcements || announcements.length === 0) {
      return res.status(200).json([]);
    }
    res.json({ announcements: announcements, length: totalLength });
  } catch (error) {
    res.status(500).json({ error: "Duyurular listelenirken bir hata oluştu." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(200).json({ status: 404 });
    }
    res.json(announcement);
  } catch (error) {
    res.status(200).json({ status: 500 });
  }
});

router.post("/add", async (req, res) => {
  const { title, contents, uploader, link } = req.body;
  try {
    const newAnnouncement = new Announcement({
      title,
      contents,
      uploader,
      link,
    });
    await newAnnouncement.save();
    res.json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: "Duyuru oluşturulurken bir hata oluştu." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Announcement.findByIdAndRemove(id);
    res.json({ message: "Duyuru başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ error: "Duyuru silinirken bir hata oluştu." });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, contents, uploader, link } = req.body;

  try {
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ error: "Duyuru bulunamadı." });
    }

    if (title) {
      announcement.title = title;
    }

    if (contents) {
      announcement.contents = contents;
    }

    if (uploader) {
      announcement.uploader = uploader;
    }
    if (link) {
      announcement.link = link;
    }

    await announcement.save();

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Duyuru güncellenirken bir hata oluştu." });
  }
});

module.exports = router;
