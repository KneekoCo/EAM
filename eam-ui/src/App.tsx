import { useEffect, useState } from "react";

type Asset = {
  id: string;
  fleetId: string;
  make?: string | null;
  model?: string | null;
  status: string;
  hasMicroMon: boolean;
  outOfUseStart?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL as string;
    fetch(`${api}/assets`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setAssets)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1 style={{ marginBottom: 8 }}>EAM UI</h1>
      <p style={{ marginTop: 0 }}>
        UI is talking to API at <code>{import.meta.env.VITE_API_URL}</code>
      </p>

      {loading && <p>Loading assets…</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && !error && (
        <table cellPadding={8} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Fleet ID</th>
              <th align="left">Make</th>
              <th align="left">Model</th>
              <th align="left">Status</th>
              <th align="left">MicroMon</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id} style={{ borderTop: "1px solid #ddd" }}>
                <td>{a.fleetId}</td>
                <td>{a.make ?? "—"}</td>
                <td>{a.model ?? "—"}</td>
                <td>{a.status}</td>
                <td>{a.hasMicroMon ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
