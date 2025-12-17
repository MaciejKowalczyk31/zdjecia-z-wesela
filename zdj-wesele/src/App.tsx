import React, { useEffect, useState } from "react";
import { Dropbox } from "dropbox";
import backgroundImg from "./assets/02.webp";

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [bgLoaded, setBgLoaded] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImg;
    img.onload = () => setBgLoaded(true);
  }, []);

  useEffect(() => {
    if (files.length > 0) setMessage("");
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Najpierw wybierz pliki.");
      return;
    }

    setUploading(true);
    setMessage("Upload w toku...");

    const dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

    const concurrency = 3;
    const queue = [...files];

    const uploadChunk = async (file: File) => {
      const contents = await file.arrayBuffer();
      return dbx.filesUpload({
        path: "/" + file.name,
        contents,
        mode: { ".tag": "add" },
        autorename: true,
        mute: false,
      });
    };

    const workers: Promise<void>[] = [];

    const runNext = async (): Promise<void> => {
      if (queue.length === 0) return;
      const file = queue.shift()!;
      try {
        await uploadChunk(file);
        await runNext();
      } catch (err) {
        throw err;
      }
    };

    for (let i = 0; i < Math.min(concurrency, files.length); i++) {
      workers.push(runNext());
    }

    try {
      await Promise.all(workers);
      setMessage("");
      setFiles([]);
      setUploaded(true);
    } catch (error: any) {
      console.error(error);
      setMessage("Wystąpił błąd podczas uploadu: " + (error.message || error));
    } finally {
      setUploading(false);
    }
  };

  const handleAddMore = () => {
    setUploaded(false);
    setMessage("");
  };

  if (!bgLoaded) {
    <></>;
  }

  if (uploaded) {
    return (
      <div style={{ height: "100vh", width: "100vw" }}>
        <div
          style={{
            height: "100vh",
            width: "100vw",
            background: `url(${backgroundImg}) `,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Arial",
            padding: 0,
            textAlign: "center",
            backgroundPosition: "center center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <h1 style={{ color: "white", marginBottom: "2rem" }}>Dziękujemy!</h1>
          <button
            onClick={handleAddMore}
            style={{
              padding: "0.75rem 1.5rem",
              marginTop: "1rem",
              fontSize: "1rem",
              borderRadius: "8px",
              backgroundColor: "rgba(204,204,204,0.5)",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Dodaj kolejne zdjęcia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: `url(${backgroundImg}) `,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial",
          padding: 0,
          textAlign: "center",
          backgroundPosition: "center center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <h1 style={{ color: "white", marginBottom: "2rem" }}>
          Stwórz z nami wspomnienia
        </h1>
        {/* Container przycisków w jednym rzędzie */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <label
            htmlFor="fileInput"
            style={{
              padding: "1rem 2rem",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              color: "white",
              fontSize: "1rem",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            Wybierz
          </label>
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              padding: "1rem 2rem",
              fontSize: "1rem",
              borderRadius: "8px",
              backgroundColor: "rgba(204,204,204,0.5)",
              backdropFilter: "blur(10px)",
              color: "white",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            {uploading ? "Wysyłanie..." : "Prześlij"}
          </button>
        </div>
        <div
          style={{
            minHeight: "1.5rem",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          {files.length > 0 && (
            <p style={{ color: "white", margin: 0 }}>
              Wybrano {files.length} {files.length === 1 ? "plik" : "pliki"}
            </p>
          )}
          {message && (
            <p
              style={{
                color: message.includes("Najpierw wybierz") ? "red" : "yellow",
                margin: 0,
                textShadow: message.includes("Najpierw wybierz")
                  ? "1px 1px 0 black, -1px 1px 0 black, 1px -1px 0 black, -1px -1px 0 black"
                  : "none",
              }}
            >
              {message}
            </p>
          )}
        </div>{" "}
      </div>
    </div>
  );
};

export default App;
