import { useState } from "react";
import axios from "axios";

const VideoUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    setUploading(true);
    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onUploadComplete(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <h2>Upload Video</h2>
      <input type="file" accept="video/mp4" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Processing video and generating subtitles...</p>}
    </div>
  );
};

export default VideoUpload;
