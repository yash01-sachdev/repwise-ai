const DB_NAME = "ai-form-coach";
const DB_VERSION = 1;
const STORE = "sessions";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("exerciseId", "exerciseId", { unique: false });
        store.createIndex("date", "date", { unique: false });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror   = (e) => reject(e.target.error);
  });
}

export async function saveSessionWithVideo(session, videoBlob) {
  // Read blob BEFORE opening transaction — prevents TransactionInactiveError
  let videoBuffer = null;
  let videoType = null;

  if (videoBlob) {
    videoBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(videoBlob);
    });
    videoType = videoBlob.type || "video/webm";
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const request = store.add({
      ...session,
      date: new Date().toISOString(),
      videoBuffer,
      videoType,
    });
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror   = (e) => reject(e.target.error);
  });
}

export async function getAllSessions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result.reverse());
    request.onerror   = (e) => reject(e.target.error);
  });
}

export async function deleteSession(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror   = (e) => reject(e.target.error);
  });
}