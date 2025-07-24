const express = require("express");
const router = express.Router();
const Chapter = require("../models/Chapter");
const Manga = require("../models/Manga");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { default: slugify } = require("slugify");
const { uploadToR2, deleteFromR2, deleteMultipleFromR2, getPublicUrl, parseFileKeyFromURL } = require("../utils/r2-client");

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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const chapterFolder = path.join(__dirname, "..", "uploads", "chapters");
    if (!fs.existsSync(chapterFolder)) {
      fs.mkdirSync(chapterFolder, { recursive: true });
    }
    cb(null, chapterFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
function cleanupDisk() {
  const chapterFolder = path.join(__dirname, "..", "uploads", "chapters");
  fs.readdir(chapterFolder, (err, files) => {
    if (err) {
      console.error("Disk temizleme hatası:", err);
      return;
    }
    for (const file of files) {
      const filePath = path.join(chapterFolder, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Dosya silinirken hata oluştu:", err);
        } else {
          console.log("Dosya başarıyla silindi:", filePath);
        }
      });
    }
  });
}

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

const upload = multer({ storage });
router.patch("/:id", upload.single("folder"), async (req, res) => {
  try {
    const {
      manga,
      chapterNumber,
      title,
      uploader,
      content,
      novelContent,
      mangaType,
      publishDate,
    } = req.body;
    const chapterId = req.params.id;
    const existingChapter = await Chapter.findOne({ manga, title });

    if (existingChapter._id != chapterId) {
      return res
        .status(400)
        .json({ error: "Bu başlık daha önce kullanılmıştır." });
    }
    if (!chapterNumber) {
      const currentChapter = await Chapter.findById(chapterId);
      if (currentChapter) {
        chapterNumber = currentChapter.chapterNumber;
      }
    }

    if (mangaType === "novel") {
    } else {
      if (req.file) {
        const oldChapter = await Chapter.findById(chapterId);
        const folderPath = path.join(
          __dirname,
          "..",
          "uploads",
          "chapters",
          req.file.filename
        );
        const extractedPath = path.join(
          __dirname,
          "..",
          "uploads",
          "chapters",
          req.file.filename.split(".")[0]
        );
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
        }

        const zip = new AdmZip(folderPath);
        zip.extractAllTo(extractedPath, /* overwrite */ true);

        const images = fs.readdirSync(extractedPath);

        var imageUrls = [];
        for (const image of images) {
          const imagePath = path.join(extractedPath, image);

          if (fs.statSync(imagePath).isFile()) {
            const fileKey = `chapters/${manga}/${req.file.filename}/${image}`;
            const fileBuffer = fs.readFileSync(imagePath);

            // Upload image to R2
            await uploadToR2(fileBuffer, fileKey, "image/jpeg");

            // Get public URL
            const publicUrl = getPublicUrl(fileKey);
            imageUrls.push(publicUrl);
          }
        }

        fs.rmSync(extractedPath, { recursive: true });
      } else {
        imageUrls = content;
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
      chapterNumber,
      title,
      uploader,
      novelContent,
      slug: slug,
      publishDate: date,
      content: imageUrls,
      uploadDate: new Date(),
    };

    await Chapter.findByIdAndUpdate(chapterId, updatedChapter);

    res.json({ message: "Chapter başarıyla güncellendi" });
    cleanupDisk();
  } catch (error) {
    console.error("Chapter güncellenirken bir hata oluştu:", error);
    res.status(500).json({ error: "Chapter güncellenirken bir hata oluştu" });
  }
});

router.post("/add", upload.single("folder"), async (req, res) => {
  try {
    const {
      manga,
      chapterNumber,
      title,
      uploader,
      novelContent,
      mangaType,
      publishDate,
    } = req.body;

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

    const imageUrls = [];
    if (mangaType === "novel") {
    } else {
      const folderPath = path.join(
        __dirname,
        "..",
        "uploads",
        "chapters",
        req.file.filename
      );
      const extractedPath = path.join(
        __dirname,
        "..",
        "uploads",
        "chapters",
        req.file.filename.split(".")[0]
      );
      const zip = new AdmZip(folderPath);
      zip.extractAllTo(extractedPath, /* overwrite */ true);

      const images = fs.readdirSync(extractedPath);

      for (const image of images) {
        const imagePath = path.join(extractedPath, image);

        if (fs.statSync(imagePath).isFile()) {
          const fileKey = `chapters/${manga}/${req.file.filename}/${image}`;
          const fileBuffer = fs.readFileSync(imagePath);

          // Upload image to R2
          await uploadToR2(fileBuffer, fileKey, "image/jpeg");

          // Get public URL
          const publicUrl = getPublicUrl(fileKey);
          imageUrls.push(publicUrl);
        }
      }

      fs.rmSync(extractedPath, { recursive: true });
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
      content: imageUrls ? imageUrls : null,
      uploadDate: new Date(),
      publishDate: publishDate,
    });

    await chapter.save();

    res.json({ message: "Chapter başarıyla yüklendi" });
    cleanupDisk();
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
