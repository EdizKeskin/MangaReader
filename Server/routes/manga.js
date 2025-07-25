const express = require("express");
const router = express.Router();
const Manga = require("../models/Manga");
const Chapter = require("../models/Chapter");
const slugify = require("slugify");
const { deleteFromR2, parseFileKeyFromURL } = require("../utils/r2-client");

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

router.get("/artist", async (req, res) => {
  try {
    const artist = req.query.artist;

    const mangasByArtist = await Manga.find({ artist: artist });

    if (mangasByArtist.length === 0 || !mangasByArtist) {
      return res.json({
        message: "Belirtilen yazarın mangaları bulunamadı.",
        status: 404,
      });
    }

    res.json(mangasByArtist);
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

router.patch("/:id", async (req, res) => {
  try {
    const mangaId = req.params.id;
    const { name, author, genres, summary, uploader, type, artist, coverImageUrl } = req.body;

    const existingManga = await Manga.findById(mangaId);

    if (!existingManga) {
      return res.status(404).json({ message: "Manga bulunamadı." });
    }

    const slug = slugify(name, { lower: true });
    const updatedManga = {
      name,
      author,
      genres: Array.isArray(genres) ? genres : genres.split(",").map((genre) => genre.trim()),
      summary,
      type,
      uploader,
      artist,
      slug: slug,
    };

    // If new cover image URL is provided and different from existing
    if (coverImageUrl && coverImageUrl !== existingManga.coverImage) {
      // Delete old image from R2
      const oldCoverImageURL = existingManga.coverImage;
      const oldFileKey = parseFileKeyFromURL(oldCoverImageURL);
      if (oldFileKey) {
        await deleteFromR2(oldFileKey).catch(err => console.error("Error deleting old image:", err));
      }
      
      updatedManga.coverImage = coverImageUrl;
    }

    const updatedMangaDoc = await Manga.findByIdAndUpdate(
      mangaId,
      updatedManga,
      { new: true }
    );

    if (!updatedMangaDoc) {
      return res.status(404).json({ message: "Manga bulunamadı." });
    }

    res.json(updatedMangaDoc);
  } catch (error) {
    console.error("Manga update error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { name, author, genres, summary, uploader, type, artist, coverImageUrl } = req.body;

    if (!coverImageUrl) {
      return res.status(400).json({ error: "Cover image is required." });
    }

    const genreNames = Array.isArray(genres) ? genres : genres.split(",").map((genre) => genre.trim());
    const uploadDate = new Date();
    const slug = slugify(name, { lower: true });

    const manga = new Manga({
      name,
      author,
      artist,
      genres: genreNames,
      summary,
      uploadDate,
      uploader,
      type,
      slug: slug,
      coverImage: coverImageUrl,
    });

    await manga.save();

    res.status(201).json({ message: "Manga başarıyla eklendi!" });
  } catch (error) {
    console.error("Manga add error:", error);
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
