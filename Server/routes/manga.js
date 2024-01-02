const express = require("express");
const router = express.Router();
const Manga = require("../models/Manga");
const multer = require("multer");
const admin = require("firebase-admin");
const Chapter = require("../models/Chapter");
const slugify = require("slugify");
const sharp = require("sharp");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bucket = admin.storage().bucket();

router.get("/list", async (req, res) => {
  try {
    const mangaList = await Manga.find();
    const mangaListWithLastTwoChapters = await Promise.all(
      mangaList.map(async (manga) => {
        let lastTwoChapters = await Chapter.find({ manga: manga._id })
          .sort({ chapterNumber: -1 })
          .limit(2)
          .select("_id chapterNumber title uploadDate publishDate slug")
          .exec();

        const now = new Date();
        lastTwoChapters = lastTwoChapters.filter((chapter) => {
          return chapter.publishDate <= now;
        });

        return {
          ...manga._doc,
          lastTwoChapters,
        };
      })
    );

    const sortedMangaListWithLastTwoChapters =
      mangaListWithLastTwoChapters.sort((a, b) => {
        const aLastChapter = a.lastTwoChapters[0];
        const bLastChapter = b.lastTwoChapters[0];
        if (!aLastChapter) {
          return 1;
        }

        if (!bLastChapter) {
          return -1;
        }

        return bLastChapter.publishDate - aLastChapter.publishDate;
      });

    res.json(sortedMangaListWithLastTwoChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/list/home", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 16;

    const totalMangaCount = await Manga.countDocuments();
    const totalPages = Math.ceil(totalMangaCount / limit);
    const mangaList = await Manga.find();
    const mangaListWithLastTwoChapters = await Promise.all(
      mangaList.map(async (manga) => {
        let lastTwoChapters = await Chapter.find({ manga: manga._id })
          .sort({ chapterNumber: -1 })
          .limit(2)
          .select("_id chapterNumber title uploadDate publishDate slug")
          .exec();

        const now = new Date();
        lastTwoChapters = lastTwoChapters.filter((chapter) => {
          return chapter.publishDate <= now;
        });

        return {
          ...manga._doc,
          lastTwoChapters,
        };
      })
    );

    const sortedMangaListWithLastTwoChapters = mangaListWithLastTwoChapters
      .sort((a, b) => {
        const aLastChapter = a.lastTwoChapters[0];
        const bLastChapter = b.lastTwoChapters[0];
        if (!aLastChapter) {
          return 1;
        }

        if (!bLastChapter) {
          return -1;
        }

        return bLastChapter.publishDate - aLastChapter.publishDate;
      })
      .slice((page - 1) * limit, page * limit);
    if (page > totalPages) {
      return res.json({
        message: "No more Pages",
        status: 404,
      });
    }

    res.json({
      mangaList: sortedMangaListWithLastTwoChapters,
      pagination: {
        page,
        totalPages,
        limit,
        totalMangaCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/author", async (req, res) => {
  try {
    const author = req.query.author;

    const mangasByAuthor = await Manga.find({ author: author });

    if (mangasByAuthor.length === 0 || !mangasByAuthor) {
      return res.json({
        message: "Belirtilen yazarın mangaları bulunamadı.",
        status: 404,
      });
    }

    res.json(mangasByAuthor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/list/admin", async (req, res) => {
  try {
    const mangaList = await Manga.find();
    const mangaListWithLastTwoChapters = await Promise.all(
      mangaList.map(async (manga) => {
        const lastTwoChapters = await Chapter.find({ manga: manga._id })
          .sort({ chapterNumber: -1 })
          .limit(2)
          .select("_id, chapterNumber, title , uploadDate, publishDate")
          .exec();

        return {
          ...manga._doc,
          lastTwoChapters,
        };
      })
    );

    const sortedMangaListWithLastTwoChapters =
      mangaListWithLastTwoChapters.sort((a, b) => {
        const aLastChapter = a.lastTwoChapters[0];
        const bLastChapter = b.lastTwoChapters[0];
        if (!aLastChapter) {
          return 1;
        }

        if (!bLastChapter) {
          return -1;
        }

        return bLastChapter.uploadDate - aLastChapter.uploadDate;
      });

    res.json(sortedMangaListWithLastTwoChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const manga = await Manga.find();
    res.json(manga.length);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    res.json(manga);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.slug })
      .select("-content")
      .sort({ chapterNumber: -1 })
      .exec();
    res.json(manga);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/chapters", async (req, res) => {
  try {
    const mangaId = req.params.id;

    const chapters = await Chapter.find({ manga: mangaId })
      .select("-content")
      .sort({ chapterNumber: -1 })
      .exec();

    const mangaName = await Manga.findById(mangaId).select("name").exec();
    const mangaType = await Manga.findById(mangaId).select("type").exec();

    if (!chapters) {
      return res
        .status(404)
        .json({ message: "Manga için hiç bölüm bulunamadı." });
    }

    res.json({ chapters, mangaName, mangaType });
  } catch (error) {
    console.error("Bölümleri alma hatası:", error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
});

router.get("/slug/:slug/chapters", async (req, res) => {
  try {
    const mangaId = await Manga.findOne({ slug: req.params.slug }).select(
      "_id"
    );

    const currentDate = new Date();
    const chapters = await Chapter.find({
      manga: mangaId,
    })
      .select("-content")
      .sort({ chapterNumber: 1 })
      .exec();

    const mangaName = await Manga.findById(mangaId).select("name").exec();
    const mangaType = await Manga.findById(mangaId).select("type").exec();

    if (!chapters) {
      return res
        .status(404)
        .json({ message: "Manga için hiç bölüm bulunamadı." });
    }

    res.json({ chapters, mangaName, mangaType });
  } catch (error) {
    console.error("Bölümleri alma hatası:", error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
});

router.get("/list/name", async (req, res) => {
  try {
    const mangaList = await Manga.find().select("name _id type");
    res.json(mangaList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const mangaId = req.params.id;

    const deletedManga = await Manga.findByIdAndDelete(mangaId);

    if (!deletedManga) {
      return res.status(404).json({ message: "Manga bulunamadı." });
    }

    await Chapter.deleteMany({ manga: mangaId });

    res.json({ message: "Manga başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", upload.single("coverImage"), async (req, res) => {
  try {
    const mangaId = req.params.id;
    const { name, author, genres, summary, uploader, type } = req.body;

    const existingManga = await Manga.findById(mangaId);

    if (!existingManga) {
      return res.status(404).json({ message: "Manga bulunamadı." });
    }

    const oldCoverImageURL = existingManga.coverImage;
    const slug = slugify(name, { lower: true });
    const updatedManga = {
      name,
      author,
      genres: genres.split(",").map((genre) => genre.trim()),
      summary,
      type,
      uploader,
      slug: slug,
    };

    if (req.file) {
      const file = req.file;

      // Use sharp to optimize and convert the image to WebP format
      const optimizedImageBuffer = await sharp(file.buffer)
        .webp({ quality: 80 }) // You can adjust the quality as needed
        .toBuffer();

      const fileName = `${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(`coverImages/${fileName}`);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: "image/webp", // Set the content type to WebP
        },
      });

      blobStream.on("error", (error) => {
        console.error(error);
        res.status(500).json({ error: "Resim yüklenirken bir hata oluştu." });
      });

      blobStream.on("finish", async () => {
        const signedUrl = await bucket
          .file(`coverImages/${fileName}`)
          .getSignedUrl({
            action: "read",
            expires: "03-09-2099",
          });

        // Delete the old cover image
        await bucket
          .file(`coverImages/${parseFileNameFromURL(oldCoverImageURL)}`)
          .delete();

        updatedManga.coverImage = signedUrl[0];

        const updatedMangaDoc = await Manga.findByIdAndUpdate(
          mangaId,
          updatedManga,
          { new: true }
        );

        if (!updatedMangaDoc) {
          return res.status(404).json({ message: "Manga bulunamadı." });
        }

        res.json(updatedMangaDoc);
      });

      // Use the optimized image buffer for uploading
      blobStream.end(optimizedImageBuffer);
    } else {
      const updatedMangaDoc = await Manga.findByIdAndUpdate(
        mangaId,
        updatedManga,
        { new: true }
      );

      if (!updatedMangaDoc) {
        return res.status(404).json({ message: "Manga bulunamadı." });
      }

      res.json(updatedMangaDoc);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
function parseFileNameFromURL(url) {
  const urlParts = url.split("/");
  const fileNameWithQuery = urlParts[urlParts.length - 1];
  const fileNameParts = fileNameWithQuery.split("?")[0];
  return fileNameParts;
}

router.post("/add", upload.single("coverImage"), async (req, res) => {
  try {
    const { name, author, genres, summary, uploader, type } = req.body;

    const file = req.file;

    // Use sharp to optimize and convert the image to WebP format
    const optimizedImageBuffer = await sharp(file.buffer)
      .webp({ quality: 80 }) // You can adjust the quality as needed
      .toBuffer();

    const fileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(`coverImages/${fileName}`);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: "image/webp", // Set the content type to WebP
      },
    });

    blobStream.on("error", (error) => {
      console.error(error);
      res.status(500).json({ error: "Resim yüklenirken bir hata oluştu." });
    });

    blobStream.on("finish", async () => {
      const signedUrl = await bucket
        .file(`coverImages/${fileName}`)
        .getSignedUrl({
          action: "read",
          expires: "03-09-2099",
        });

      const genreNames = genres.split(",").map((genre) => genre.trim());
      const uploadDate = new Date();
      const slug = slugify(name, { lower: true });

      const manga = new Manga({
        name,
        author,
        genres: genreNames,
        summary,
        uploadDate,
        uploader,
        type,
        slug: slug,
        coverImage: signedUrl[0],
      });

      await manga.save();

      res.status(201).json({ message: "Manga başarıyla eklendi!" });
    });

    // Use the optimized image buffer for uploading
    blobStream.end(optimizedImageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/list/search", async (req, res) => {
  try {
    const mangaList = await Manga.find().select("name _id coverImage type");
    res.json(mangaList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
