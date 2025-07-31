const express = require("express");
const router = express.Router();
const Manga = require("../models/Manga");
const Chapter = require("../models/Chapter");
const slugify = require("slugify");
const { deleteFromR2, parseFileKeyFromURL } = require("../utils/r2-client");

router.get("/list", async (req, res) => {
  try {
    const mangaList = await Manga.find({ isActive: true });
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

    const totalMangaCount = await Manga.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalMangaCount / limit);
    const mangaList = await Manga.find({ isActive: true });
    const mangaListWithLastTwoChapters = await Promise.all(
      mangaList.map(async (manga) => {
        let lastTwoChapters = await Chapter.find({
          manga: manga._id,
          isActive: true, // Sadece aktif bölümler
        })
          .sort({ chapterNumber: -1 })
          .limit(2)
          .select("_id chapterNumber title uploadDate publishDate slug")
          .exec();

        const now = new Date();

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

        return bLastChapter.uploadDate - aLastChapter.uploadDate;
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

    const mangasByAuthor = await Manga.find({ author: author, isActive: true });

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

    const mangasByArtist = await Manga.find({ artist: artist, isActive: true });

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

router.get("/random-chapters", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    
    // Get all active manga IDs
    const activeMangas = await Manga.find({ isActive: true }).select("_id name coverImage slug author artist type summary");
    
    if (activeMangas.length === 0) {
      return res.json([]);
    }
    
    const currentDate = new Date();
    
    // For each manga, get one random published chapter
    const mangaWithRandomChapter = await Promise.all(
      activeMangas.map(async (manga) => {
        // Get one random chapter for this manga
        const chapters = await Chapter.find({
          manga: manga._id,
          isActive: true,
          publishDate: { $lte: currentDate }
        }).select("_id chapterNumber title uploadDate publishDate slug");
        
        if (chapters.length === 0) {
          return null; // No published chapters for this manga
        }
        
        // Select random chapter from this manga
        const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
        
        return {
          _id: randomChapter._id,
          chapterNumber: randomChapter.chapterNumber,
          title: randomChapter.title,
          uploadDate: randomChapter.uploadDate,
          publishDate: randomChapter.publishDate,
          chapterSlug: randomChapter.slug,
          manga: manga,
          // Add manga fields for compatibility with MovingCards
          slug: manga.slug, // Use manga slug for MovingCards link
          name: manga.name,
          coverImage: manga.coverImage,
          author: manga.author,
          artist: manga.artist,
          type: manga.type,
          summary: manga.summary
        };
      })
    );
    
    // Filter out nulls (mangas with no published chapters)
    const validMangaChapters = mangaWithRandomChapter.filter(item => item !== null);
    
    // Randomly shuffle and select the requested number
    const shuffledResults = validMangaChapters.sort(() => 0.5 - Math.random());
    const finalResults = shuffledResults.slice(0, Math.min(limit, shuffledResults.length));
    
    res.json(finalResults);
  } catch (error) {
    console.error("Random chapters error:", error);
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
    const manga = await Manga.findOne({ slug: req.params.slug, isActive: true })
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

    const chapters = await Chapter.find({
      manga: mangaId,
      isActive: true, // Sadece aktif bölümler
    })
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
      isActive: true, // Sadece aktif bölümler
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
    const mangaList = await Manga.find({ isActive: true }).select(
      "name _id type"
    );
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
    const {
      name,
      author,
      genres,
      summary,
      uploader,
      type,
      artist,
      coverImageUrl,
      isActive,
      isAdult,
      status,
      otherNames,
      releaseYear,
    } = req.body;

    const existingManga = await Manga.findById(mangaId);

    if (!existingManga) {
      return res.status(404).json({ message: "Manga bulunamadı." });
    }

    const slug = slugify(name, { lower: true });
    const updatedManga = {
      name,
      author,
      genres: Array.isArray(genres)
        ? genres
        : genres.split(",").map((genre) => genre.trim()),
      summary,
      type,
      uploader,
      artist,
      slug: slug,
    };

    // Handle new fields with proper defaults
    if (isActive !== undefined) updatedManga.isActive = isActive;
    if (isAdult !== undefined) updatedManga.isAdult = isAdult;
    if (status !== undefined) updatedManga.status = status;
    if (otherNames !== undefined)
      updatedManga.otherNames = Array.isArray(otherNames) ? otherNames : [];
    if (releaseYear !== undefined) updatedManga.releaseYear = releaseYear;

    // If new cover image URL is provided and different from existing
    if (coverImageUrl && coverImageUrl !== existingManga.coverImage) {
      // Delete old image from R2
      const oldCoverImageURL = existingManga.coverImage;
      const oldFileKey = parseFileKeyFromURL(oldCoverImageURL);
      if (oldFileKey) {
        await deleteFromR2(oldFileKey).catch((err) =>
          console.error("Error deleting old image:", err)
        );
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
    const {
      name,
      author,
      genres,
      summary,
      uploader,
      type,
      artist,
      coverImageUrl,
      isActive,
      isAdult,
      status,
      otherNames,
      releaseYear,
    } = req.body;

    if (!coverImageUrl) {
      return res.status(400).json({ error: "Cover image is required." });
    }

    const genreNames = Array.isArray(genres)
      ? genres
      : genres.split(",").map((genre) => genre.trim());
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
      isActive: isActive !== undefined ? isActive : true,
      isAdult: isAdult !== undefined ? isAdult : false,
      status: status || "ongoing",
      otherNames: Array.isArray(otherNames) ? otherNames : [],
      releaseYear: releaseYear,
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
    const mangaList = await Manga.find({ isActive: true }).select(
      "name _id coverImage type"
    );
    res.json(mangaList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/list/status/:status", async (req, res) => {
  try {
    const status = req.params.status;
    const validStatuses = ["ongoing", "completed", "dropped", "hiatus", "güncel"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Geçersiz statü. Geçerli statüler: " + validStatuses.join(", ") 
      });
    }

    const mangaList = await Manga.find({ 
      status: status, 
      isActive: true 
    });
    
    const mangaListWithLastTwoChapters = await Promise.all(
      mangaList.map(async (manga) => {
        let lastTwoChapters = await Chapter.find({ 
          manga: manga._id,
          isActive: true 
        })
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

    if (sortedMangaListWithLastTwoChapters.length === 0) {
      return res.json({
        message: `${status} statüsünde manga bulunamadı.`,
        status: 404,
        mangaList: []
      });
    }

    res.json(sortedMangaListWithLastTwoChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
