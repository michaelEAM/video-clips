import React, { useState, useRef, useEffect } from 'react';

const videoSrc = "https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4";

function App() {
  const videoRef = useRef(null);
  const [clips, setClips] = useState(() => {
    const saved = localStorage.getItem("videoClips");
    return saved
      ? JSON.parse(saved)
      : [{ name: "Video completo", start: 0, end: 52, tags: [] }];
  });

  const [currentClip, setCurrentClip] = useState(clips[0]);
  const [videoUrl, setVideoUrl] = useState(`${videoSrc}#t=${clips[0].start},${clips[0].end}`);
  const [newClip, setNewClip] = useState({ name: "", start: "", end: "", tags: "" });
  const [selectedClipIndex, setSelectedClipIndex] = useState(0);
  const [mode, setMode] = useState("add"); // "add", "edit", "delete"
  const [filterTag, setFilterTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  useEffect(() => {
    localStorage.setItem("videoClips", JSON.stringify(clips));
  }, [clips]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleEnded = () => {
        const currentIndex = clips.findIndex(c => c === currentClip);
        if (currentIndex >= 0 && currentIndex < clips.length - 1) {
          setIsLoadingNext(true);
          setTimeout(() => {
            const nextClip = clips[currentIndex + 1];
            setCurrentClip(nextClip);
            setVideoUrl(`${videoSrc}#t=${nextClip.start},${nextClip.end}`);
            setIsLoadingNext(false);
          }, 3000);
        }
      };

      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration);
      };

      video.addEventListener('ended', handleEnded);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [clips, currentClip]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClip({ ...newClip, [name]: value });
  };

  const parseTags = (tagsString) =>
    tagsString.split(',').map(tag => tag.trim()).filter(Boolean);

  const handleAction = () => {
    const start = parseFloat(newClip.start);
    const end = parseFloat(newClip.end);

    if (
      (mode === "add" || mode === "edit") &&
      (
        !newClip.name || isNaN(start) || isNaN(end) || !newClip.tags ||
        start < 0 || end < 0 || start >= end || end > videoDuration
      )
    ) {
      setErrorMessage("❌ Verifica los campos: no deben estar vacíos, ni tener valores negativos, ni fin mayor al video.");
      return;
    }

    if (mode === "add") {
      const clip = {
        name: newClip.name,
        start,
        end,
        tags: parseTags(newClip.tags || ""),
      };
      setClips([...clips, clip]);
    }

    if (mode === "edit") {
      const updated = [...clips];
      updated[selectedClipIndex] = {
        ...updated[selectedClipIndex],
        name: newClip.name,
        start,
        end,
        tags: parseTags(newClip.tags || ""),
      };
      setClips(updated);
    }

    if (mode === "delete") {
      if (selectedClipIndex === 0) {
        setErrorMessage("❌ No puedes eliminar el clip completo.");
        return;
      }
      const updated = clips.filter((_, i) => i !== selectedClipIndex);
      setClips(updated);
      setSelectedClipIndex(0);
    }

    setNewClip({ name: "", start: "", end: "", tags: "" });
    setErrorMessage("");
  };

  const filteredClips = filterTag
    ? clips.filter(c => c.tags && c.tags.includes(filterTag))
    : clips;

  const handlePlayClip = (clip) => {
    setCurrentClip(clip);
    setVideoUrl(`${videoSrc}#t=${clip.start},${clip.end}`);
    videoRef.current.play();
  };

  useEffect(() => {
    if (mode === "edit") {
      const clip = clips[selectedClipIndex];
      setNewClip({
        name: clip.name,
        start: clip.start,
        end: clip.end,
        tags: clip.tags.join(", "),
      });
    } else {
      setNewClip({ name: "", start: "", end: "", tags: "" });
    }
  }, [mode, selectedClipIndex]);

  return (
    <div style={{
      padding: "20px",
      maxWidth: "800px",
      margin: "0 auto",
      backgroundColor: "#f0f8ff",
      fontFamily: "Arial, sans-serif",
      borderRadius: "16px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ textAlign: "center" }}>🎬 Proyecto de Clips de Video</h1>

      {isLoadingNext && (
        <div style={{ margin: '10px 0', textAlign: 'center', fontWeight: 'bold', color: 'blue' }}>
          Cargando siguiente clip...
        </div>
      )}

      <video
        ref={videoRef}
        key={videoUrl}
        src={videoUrl}
        controls
        width="100%"
        style={{ marginBottom: "16px", borderRadius: "10px" }}
      />

      <div style={{ marginBottom: "10px", fontStyle: "italic", color: "gray" }}>
        Duración total del video: {videoDuration.toFixed(2)} segundos
      </div>

      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {errorMessage}
        </div>
      )}

      <div style={{
        display: "flex", flexDirection: "column", gap: "10px",
        background: "#fff", padding: "16px", borderRadius: "10px", marginBottom: "20px"
      }}>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: "6px" }}>
          <option value="add">Agregar Clip</option>
          <option value="edit">Editar Clip</option>
          <option value="delete">Eliminar Clip</option>
        </select>

        {mode !== "add" && (
          <select value={selectedClipIndex} onChange={(e) => setSelectedClipIndex(Number(e.target.value))} style={{ padding: "6px" }}>
            {clips.map((clip, index) => (
              <option key={index} value={index}>
                {clip.name} ({clip.start}s - {clip.end}s)
              </option>
            ))}
          </select>
        )}

        {mode !== "delete" && (
          <>
            <input type="text" name="name" placeholder="Nombre del clip" value={newClip.name} onChange={handleChange} />
            <input
              type="number"
              name="start"
              placeholder="Inicio"
              value={newClip.start}
              onChange={handleChange}
              style={{ padding: "6px" }}
            />
            <input
              type="number"
              name="end"
              placeholder="Fin"
              value={newClip.end}
              onChange={handleChange}
              style={{ padding: "6px" }}
            />
            <input type="text" name="tags" placeholder="Etiquetas (separadas por comas)" value={newClip.tags} onChange={handleChange} />
          </>
        )}

        <button
          onClick={handleAction}
          style={{
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {mode === "add" ? "Agregar" : mode === "edit" ? "Guardar Cambios" : "Eliminar"}
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Filtrar por etiqueta"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value.trim())}
        />
        <button onClick={() => setFilterTag("")}>Limpiar filtro</button>
      </div>

      <ul style={{ marginTop: "20px" }}>
        {filteredClips.map((clip, index) => (
          <li key={index}>
            <strong>{clip.name}</strong> ({clip.start}s - {clip.end}s)
            {clip.tags?.length > 0 && <span> - Etiquetas: {clip.tags.join(", ")}</span>}
            <button
              onClick={() => handlePlayClip(clip)}
              style={{
                marginLeft: "10px",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid gray",
                backgroundColor: "#eee",
                cursor: "pointer"
              }}
            >
              ▶️ Reproducir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;