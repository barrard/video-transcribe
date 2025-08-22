import { useState } from "react";
import VideoUpload from "./components/VideoUpload";
import VideoPlayer from "./components/VideoPlayer";
import "./App.css";

function App() {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoList, setVideoList] = useState([]);

  const handleUploadComplete = (videoData) => {
    setCurrentVideo(videoData);
    // Refresh video list
    fetchVideoList();
  };

  const fetchVideoList = async () => {
    try {
      const response = await fetch("/api/videos");
      const videos = await response.json();
      setVideoList(videos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Video Transcriber</h1>
      </header>

      <main className="app-main">
        <VideoUpload onUploadComplete={handleUploadComplete} />

        <div className="video-selection">
          <h2>Select a Video</h2>
          <div className="video-list">
            {videoList.map((video) => (
              <button
                key={video.filename}
                onClick={() => setCurrentVideo(video)}
                className={currentVideo?.filename === video.filename ? "active" : ""}
              >
                {video.filename}
              </button>
            ))}
          </div>
        </div>

        {currentVideo && (
          <VideoPlayer videoUrl={`/api${currentVideo.videoUrl}`} subtitlesUrl={`/api${currentVideo.subtitlesUrl}`} />
        )}
      </main>
    </div>
  );
}

export default App;
