const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();
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
app.use(cors());

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
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

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
module.exports = app;
