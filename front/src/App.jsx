import { useEffect, useState } from "react";
import { API_URL } from "./api";

export default function App() {
  const [pong, setPong] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/ping`)
      .then((r) => r.json())
      .then(setPong);
    fetch(`${API_URL}/db`)
      .then((r) => r.json())
      .then(setDb)
      .catch(() => setDb({ error: true }));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Front + Back + DB</h1>
      <pre>/ping → {JSON.stringify(pong)}</pre>
      <pre>/db → {JSON.stringify(db)}</pre>
    </div>
  );
}
