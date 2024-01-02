const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const multer = require("multer");
const bucket = admin.storage().bucket();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const fileName = file.originalname;
    const fileUpload = bucket.file(`novelImages/${fileName}`);
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      res.status(500).json({ error: error.message });
    });

    blobStream.on("finish", async () => {
      const signedUrl = await bucket
        .file(`novelImages/${fileName}`)
        .getSignedUrl({
          action: "read",
          expires: "03-09-2099",
        });
      console.log(signedUrl[0]);
      res.json({ url: signedUrl[0] });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
