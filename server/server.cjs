const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const cmd = require("node-cmd");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "video/mp4") {
      return cb(new Error("Only MP4 files are allowed"));
    }
    cb(null, true);
  },
});

// Create processed directory if it doesn't exist
const processedDir = "processed";
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir);
}

// Routes
app.post("/api/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const inputPath = req.file.path;
  const outputName = path.parse(req.file.filename).name;
  const outputPath = path.join(processedDir, outputName + ".srt");

  // Run stable-ts to generate subtitles
  cmd.run(`stable-ts "${inputPath}" -o "${outputPath}"`, (err, data, stderr) => {
    if (err) {
      console.error("Transcription error:", err);
      return res.status(500).json({ error: "Transcription failed" });
    }

    // Return information about the processed files
    res.json({
      videoUrl: `/video/${outputName}.mp4`,
      subtitlesUrl: `/subtitles/${outputName}.srt`,
      filename: outputName,
    });
  });
});

// Serve processed videos
app.use("/video", express.static("uploads"));
app.use("/subtitles", express.static("processed"));

// Serve uploaded videos
app.get("/videos", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read videos" });
    }

    const videoFiles = files.filter((file) => file.endsWith(".mp4"));
    const videoList = videoFiles.map((file) => {
      const name = path.parse(file).name;
      return {
        filename: name,
        videoUrl: `/video/${file}`,
        subtitlesUrl: `/subtitles/${name}.srt`,
      };
    });

    res.json(videoList);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
