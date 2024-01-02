const express = require("express");
const router = express.Router();
const Genre = require("../models/Genre");
const Manga = require("../models/Manga");

router.get("/list", async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const genreId = req.params.id;

    const genre = await Genre.findById(genreId);

    if (!genre) {
      return res.status(404).json({ error: "Tür bulunamadı." });
    }

    res.json(genre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres.length);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:genreId/mangas", async (req, res) => {
  try {
    const genreId = req.params.genreId;

    const mangas = await Manga.find({ genres: genreId });

    if (mangas.length === 0) {
      return res.status(404).json({ error: "Bu türe ait manga bulunamadı." });
    }

    res.json(mangas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const genreId = req.params.id;

    const deletedGenre = await Genre.findByIdAndRemove(genreId);

    if (!deletedGenre) {
      return res.status(404).json({ error: "Kategori bulunamadı." });
    }

    await Manga.updateMany(
      { genres: deletedGenre._id },
      { $pull: { genres: deletedGenre._id } }
    );

    res.json({ message: "Kategori başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const genreId = req.params.id;
    const updateData = req.body;

    const updatedGenre = await Genre.findByIdAndUpdate(genreId, updateData, {
      new: true,
    });

    if (!updatedGenre) {
      return res.status(404).json({ error: "Kategori bulunamadı." });
    }

    res.json({ message: "Kategori başarıyla güncellendi.", updatedGenre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { name } = req.body;

    const existingGenre = await Genre.findOne({ name });

    if (existingGenre) {
      return res.status(400).json({ error: "Bu tür zaten mevcut." });
    }

    const newGenre = new Genre({ name });
    await newGenre.save();

    res.status(201).json({ message: "Tür başarıyla eklendi.", newGenre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
