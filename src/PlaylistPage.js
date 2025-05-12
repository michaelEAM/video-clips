import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const videoSrc = "https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4";

function PlaylistPage() {
  const [clips, setClips] = useState(() => {
    const saved = localStorage.getItem("videoClips");
    return saved ? JSON.parse(saved) : [{ name: "Video completo", start: 0, end: 52 }];
  });
  const [currentClip, setCurrentClip] = useState(clips[0]);
  const [videoUrl, setVideoUrl] = useState(`${videoSrc}#t=${clips[0].start},${clips[0].end}`);
  const navigate = useNavigate(); // Para navegar entre las páginas

  useEffect(() => {
    localStorage.setItem("videoClips", JSON.stringify(clips));
  }, [clips]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🎬 Playlist</h1>

      <video
        src={videoUrl}
        controls
        width="100%"
        style={{ marginBottom: "16px" }}
      />

      {/* Lista de clips */}
      <ul style={{ marginTop: "20px" }}>
        {clips.map((clip, index) => (
          <li key={index}>
            <strong>{clip.name}</strong> ({clip.start}s - {clip.end}s)
            <button onClick={() => {
              setCurrentClip(clip);
              setVideoUrl(`${videoSrc}#t=${clip.start},${clip.end}`);
            }}>Reproducir</button>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate('/')}>Volver al inicio</button>
    </div>
  );
}

export default PlaylistPage;