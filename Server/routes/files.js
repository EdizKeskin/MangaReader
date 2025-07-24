const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadToR2, getPublicUrl } = require("../utils/r2-client");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const fileName = file.originalname;
    const fileKey = `novelImages/${fileName}`;

    // Upload image to R2
    await uploadToR2(file.buffer, fileKey, file.mimetype);

    // Get public URL
    const publicUrl = getPublicUrl(fileKey);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error("Error uploading image to R2:", error);
    res.status(500).json({ error: error.message });
  }
});

// R2 bağlantı testi için route
router.get("/test-r2", async (req, res) => {
  const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
  try {
    const client = new S3Client({
      endpoint: process.env.R2_ENDPOINT,
      region: "auto",
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: false,
    });
    await client.send(new ListBucketsCommand({}));
    res.json({ success: true, message: "R2 bağlantısı başarılı!" });
  } catch (error) {
    res.json({ success: false, message: error.message, stack: error.stack });
  }
});

module.exports = router;
