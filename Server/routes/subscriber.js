const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// Abone olma (POST)
router.post("/add", async (req, res) => {
  const { email, userId, day } = req.body;
  const currentDate = new Date();

  const expireAt = new Date(
    currentDate.setDate(currentDate.getDate() + parseInt(day))
  );

  try {
    const newSubscriber = new Subscriber({
      email,
      userId,
      expireAt,
    });
    await newSubscriber.save();
    res.json(newSubscriber);
  } catch (error) {
    res.status(500).json({ error: "Abone olunurken bir hata oluştu." });
  }
});

// abone detayı (GET)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const subscriber = await Subscriber.findOne({ userId });
    if (!subscriber) {
      return res.json(null);
    }
    res.json(subscriber);
  } catch (error) {
    res.status(500).json({ error: "Abone detayı alınırken bir hata oluştu." });
  }
});

router.patch("/update", async (req, res) => {
  const { userId, day } = req.body;
  const currentDate = new Date();

  console.log(day);

  const expireAt = new Date(
    currentDate.setDate(currentDate.getDate() + parseInt(day))
  );

  try {
    const subscriber = await Subscriber.findOneAndUpdate(
      { userId },
      { expireAt },
      { new: true }
    );
    res.json(subscriber);
  } catch (error) {
    res.status(500).json({ error: "Abone güncellenirken bir hata oluştu." });
  }
});

router.delete("/delete/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const subscriber = await Subscriber.findOneAndDelete({ userId });

    res.json(subscriber);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Abonelik iptal edilirken bir hata oluştu." });
  }
});

router.get("/", async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
