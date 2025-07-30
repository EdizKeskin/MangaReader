const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();
const allowedOrigins = [
  "http://localhost:3000",
  "https://monomanga.com.tr",
  "https://www.monomanga.com.tr",
  "https://manga-server-7g7v.onrender.com",
  "https://manga-server-7g7v.onrender.com/",
  "https://manga-3356.vercel.app/",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
const admin = require("firebase-admin");
var favicon = require("serve-favicon");

const key = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(key),
  storageBucket: process.env.STORAGE_BUCKET,
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      maxPoolSize: 10, // Aynı anda açılacak bağlantı sayısı (pool)
      minPoolSize: 5, // Minimum açık bağlantı
      serverSelectionTimeoutMS: 5000, // Timeout süresi
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

app.use(express.json());
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(favicon(__dirname + "/public/favicon.ico"));

const mangaRoutes = require("./routes/manga");
const chapterRoutes = require("./routes/chapter");
const genresRoutes = require("./routes/genres");
const announcementsRoutes = require("./routes/announcements");
const filesRoutes = require("./routes/files");
const subscriberRoutes = require("./routes/subscriber");
app.use(express.static("public"));
app.use("/manga", mangaRoutes);
app.use("/chapter", chapterRoutes);
app.use("/genres", genresRoutes);
app.use("/announcements", announcementsRoutes);
app.use("/files", filesRoutes);
app.use("/subscriber", subscriberRoutes);

app.get("/wakeup", (req, res) => {
  console.log("I'm awake");
  res.send("I'm awake");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
module.exports = app;
