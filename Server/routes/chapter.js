const express = require("express");
const router = express.Router();
const Chapter = require("../models/Chapter");
const Manga = require("../models/Manga");
const { default: slugify } = require("slugify");
const { deleteMultipleFromR2, parseFileKeyFromURL } = require("../utils/r2-client");

router.get("/count", async (req, res) => {
  try {
    const chapters = await Chapter.find();
    res.json(chapters.length);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/unpublished", async (req, res) => {
  const today = new Date();
  try {
    const chapters = await Chapter.find({
      publishDate: { $gt: today },
    })
      .select("-content")
      .exec();

    const mangaIds = chapters.map((chapter) => chapter.manga);
    const mangas = await Manga.find({ _id: { $in: mangaIds } }).exec();
    const mangaMap = {};
    mangas.forEach((manga) => {
      mangaMap[manga._id] = manga;
    });

    res.json({ mangas, chapters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/list", async (req, res) => {
  try {
    const chapters = await Chapter.find().select("-content").exec();
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    const manga = await Manga.findById(chapter.manga);
    const mangaType = manga.type;
    const mangaName = manga.name;

    res.json({ chapter, mangaType, mangaName });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/slug/:mangaSlug/:chapterSlug", async (req, res) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.mangaSlug });
    const chapter = await Chapter.findOne({
      slug: req.params.chapterSlug,
      manga: manga._id,
    });
    const mangaType = manga.type;

    res.json({ chapter, mangaType });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

function extractIdAndTextFromUrl(url) {
  // Parse the file key from R2 URL
  const fileKey = parseFileKeyFromURL(url);
  const parts = fileKey.split("/");

  let id = null;
  let text = null;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === "chapters" && i + 1 < parts.length) {
      id = parts[i + 1];
      i++;
    } else if (parts[i].endsWith(".zip")) {
      text = parts[i];
    }
  }

  return { id, text };
}

router.patch("/:id", async (req, res) => {
  try {
    const {
      manga,
      chapterNumber,
      title,
      uploader,
      novelContent,
      mangaType,
      publishDate,
      imageUrls, // Now comes as array directly from frontend JSON
    } = req.body;
    
    // No need to JSON.parse since it's already an array from JSON request
    const chapterId = req.params.id;
    const existingChapter = await Chapter.findOne({ manga, title });

    if (existingChapter._id != chapterId) {
      return res
        .status(400)
        .json({ error: "Bu başlık daha önce kullanılmıştır." });
    }
    
    let currentChapterNumber = chapterNumber;
    if (!chapterNumber) {
      const currentChapter = await Chapter.findById(chapterId);
      if (currentChapter) {
        currentChapterNumber = currentChapter.chapterNumber;
      }
    }

    let finalImageUrls = [];
    if (mangaType === "novel") {
      // For novels, no images needed
    } else {
      if (imageUrls && imageUrls.length > 0) {
        // Delete old images from R2 if updating with new images
        const oldChapter = await Chapter.findById(chapterId);
        if (oldChapter && oldChapter.content && oldChapter.content.length > 0) {
          const result = extractIdAndTextFromUrl(oldChapter.content[0]);
          const folderPath = `chapters/${result.id}/${result.text}`;
          
          try {
            await deleteMultipleFromR2(folderPath);
            console.log(`Klasör başarıyla silindi: ${folderPath}`);
          } catch (error) {
            console.error(`Klasör silinirken hata oluştu: ${error}`);
          }
        }
        finalImageUrls = imageUrls;
      } else {
        // Keep existing images if no new images provided
        const currentChapter = await Chapter.findById(chapterId);
        finalImageUrls = currentChapter?.content || [];
      }
    }

    var date = publishDate;
    if (!publishDate) {
      date = new Date();
    } else {
      date = new Date(publishDate);
    }

    const slug = slugify(title, { lower: true });
    const updatedChapter = {
      manga,
      chapterNumber: currentChapterNumber,
      title,
      uploader,
      novelContent,
      slug: slug,
      publishDate: date,
      content: finalImageUrls,
      uploadDate: new Date(),
    };

    await Chapter.findByIdAndUpdate(chapterId, updatedChapter);

    res.json({ message: "Chapter başarıyla güncellendi" });
  } catch (error) {
    console.error("Chapter güncellenirken bir hata oluştu:", error);
    res.status(500).json({ error: "Chapter güncellenirken bir hata oluştu" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const {
      manga,
      chapterNumber,
      title,
      uploader,
      novelContent,
      mangaType,
      publishDate,
      imageUrls, // Now comes as array directly from frontend JSON
    } = req.body;
    
    // No need to JSON.parse since it's already an array from JSON request

    const existingChapter = await Chapter.findOne({ manga, title });

    if (existingChapter) {
      return res
        .status(400)
        .json({ error: "Bu başlık daha önce kullanılmıştır." });
    }

    var number = chapterNumber;
    if (!chapterNumber) {
      const latestChapter = await Chapter.findOne({ manga }).sort({
        chapterNumber: -1,
      });

      if (latestChapter) {
        number = latestChapter.chapterNumber + 1;
      } else {
        number = 1;
      }
    }

    let finalImageUrls = [];
    if (mangaType !== "novel" && imageUrls && imageUrls.length > 0) {
      finalImageUrls = imageUrls;
    }

    if (!publishDate) {
      publishDate = new Date();
    }
    
    const slug = slugify(title, { lower: true });
    const chapter = new Chapter({
      manga,
      chapterNumber: number,
      title,
      uploader,
      novelContent,
      slug: slug,
      content: finalImageUrls.length > 0 ? finalImageUrls : null,
      uploadDate: new Date(),
      publishDate: publishDate,
    });

    await chapter.save();

    res.json({ message: "Chapter başarıyla yüklendi" });
  } catch (error) {
    console.error("Chapter eklenirken bir hata oluştu:", error);
    res.status(500).json({ error: "Chapter eklenirken bir hata oluştu" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const chapterId = req.params.id;

    const oldChapter = await Chapter.findById(chapterId);
    if (oldChapter) {
      const oldImages = oldChapter.content;
      const result = extractIdAndTextFromUrl(oldImages[0]);
      const folderPath = `chapters/${result.id}/${result.text}`;
      
      try {
        await deleteMultipleFromR2(folderPath);
        console.log(`Klasör başarıyla silindi: ${folderPath}`);
      } catch (error) {
        console.error(`Klasör silinirken hata oluştu: ${error}`);
      }

      await Chapter.findByIdAndRemove(chapterId);

      res.json({ message: "Chapter başarıyla silindi" });
    } else {
      res
        .status(404)
        .json({ error: "Belirtilen ID'ye sahip bölüm bulunamadı" });
    }
  } catch (error) {
    console.error("Chapter silinirken bir hata oluştu:", error);
    res.status(500).json({ error: "Chapter silinirken bir hata oluştu" });
  }
});

module.exports = router;
