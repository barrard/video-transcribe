import { useRef, useState, useEffect } from "react";

const VideoPlayer = ({ videoUrl, subtitlesUrl }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitles, setSubtitles] = useState([]);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (subtitlesUrl) {
      fetch(subtitlesUrl)
        .then((response) => response.text())
        .then(parseSubtitles)
        .then(setSubtitles);
    }
  }, [subtitlesUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [videoUrl]);

  const parseSubtitles = (srtData) => {
    const lines = srtData.trim().split("\n\n");
    return lines.map((block) => {
      const [index, time, ...textLines] = block.split("\n");
      const [start, end] = time.split(" --> ");
      return {
        index: parseInt(index),
        start: parseTime(start),
        end: parseTime(end),
        text: textLines.join(" "),
      };
    });
  };

  const parseTime = (timeStr) => {
    const [hours, minutes, secondsMs] = timeStr.split(":");
    const [seconds, milliseconds] = secondsMs.split(",");
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
  };

  const seekToTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSubtitles = subtitles.filter((sub) => currentTime >= sub.start && currentTime <= sub.end);

  return (
    <div className="video-player">
      <div className="video-container">
        <video ref={videoRef} controls src={videoUrl} className="video-element">
          {subtitlesUrl && <track kind="subtitles" srcLang="en" src={subtitlesUrl} default />}
        </video>
      </div>

      <div className="transcript-panel">
        <h3>Transcript</h3>
        <div className="transcript-list">
          {subtitles.map((subtitle, index) => (
            <div
              key={index}
              className={`transcript-item ${
                currentTime >= subtitle.start && currentTime <= subtitle.end ? "active" : ""
              }`}
              onClick={() => seekToTime(subtitle.start)}
            >
              <span className="timestamp">{formatTime(subtitle.start)}</span>
              <span className="text">{subtitle.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
