import React, { useEffect, useMemo, useState } from "react";

// --- CONFIG ---------------------------------------------------------------
const API_BASE =
  (typeof window !== "undefined" && (window as any).__EAM_API__) ||
  "http://localhost:3001";

// --- TYPES ----------------------------------------------------------------
export type Asset = {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  location: string;
  notes?: string;
  createdAt: string;
};

export type Inspection = {
  id: string;
  assetId: string;
  inspector: string;
  status: "PASS" | "FAIL" | "PENDING";
  dueDate: string; // ISO
};

// --- UI PRIMITIVES (no external libs) ------------------------------------
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
};
function Button({ className = "", variant = "primary", size = "md", ...rest }: ButtonProps) {
  const v =
    variant === "ghost"
      ? "bg-transparent text-neutral-700 hover:bg-neutral-100 border border-neutral-300"
      : "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900";
  const s = size === "sm" ? "px-3 py-1.5 text-sm rounded-xl" : "px-4 py-2 rounded-2xl";
  return <button className={`transition inline-flex items-center justify-center ${v} ${s} ${className}`} {...rest} />;
}

function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`bg-white border border-neutral-200 rounded-2xl shadow-sm ${className}`} {...rest} />;
}
function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="px-4 py-3 border-b border-neutral-100 font-semibold">{props.children}</div>;
}
function CardBody(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="p-4">{props.children}</div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`border border-neutral-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200 ${className}`}
      {...rest}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      className={`border border-neutral-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200`}
      {...rest}
    />
  );
}

type SelectOption = { label: string; value: string };
type SelectProps = { value: string; onChange: (v: string) => void; options: SelectOption[] };
function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      className="border border-neutral-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={`${o.label}-${o.value}`} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

type BadgeProps = { children: React.ReactNode; tone?: "neutral" | "green" | "red" | "amber" };
function Badge({ children, tone = "neutral" }: BadgeProps) {
  const map: Record<string, string> = {
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    green: "bg-green-100 text-green-700 border-green-200",
    red: "bg-red-100 text-red-700 border-red-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
  };
  return <span className={`inline-block px-2 py-1 text-xs rounded-full border ${map[tone]}`}>{children}</span>;
}

type ModalProps = { open: boolean; title: string; children: React.ReactNode; onClose: () => void };
function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-neutral-200">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} aria-label="Close" className="text-neutral-500 hover:text-black">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// --- DATA HELPERS ---------------------------------------------------------
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// --- MAIN APP -------------------------------------------------------------
export default function App() {
  const [tab, setTab] = useState<"dashboard" | "assets" | "inspections" | "settings">("dashboard");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [assetQuery, setAssetQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // add-asset modal state
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    serialNumber: "",
    location: "",
    notes: "",
  });

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [a, i] = await Promise.all([api<Asset[]>("/assets"), api<Inspection[]>("/inspections")]);
      setAssets(a);
      setInspections(i);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // derived
  const counts = useMemo(() => {
    const total = inspections.length;
    const pass = inspections.filter((i) => i.status === "PASS").length;
    const fail = inspections.filter((i) => i.status === "FAIL").length;
    const pending = inspections.filter((i) => i.status === "PENDING").length;
    return { assets: assets.length, total, pass, fail, pending };
  }, [assets, inspections]);

  const filteredAssets = useMemo(() => {
    const q = assetQuery.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      [a.name, a.type, a.serialNumber, a.location, a.notes || ""].some((f) => f.toLowerCase().includes(q)),
    );
  }, [assets, assetQuery]);

  const filteredInspections = useMemo(() => {
    let list = inspections;
    if (statusFilter) list = list.filter((i) => i.status === (statusFilter as Inspection["status"]));
    return list.slice().sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [inspections, statusFilter]);

  async function addAsset(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.name || !payload.type || !payload.serialNumber || !payload.location) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      // optimistic insert
      const temp: Asset = {
        id: `temp_${Date.now()}`,
        name: payload.name,
        type: payload.type,
        serialNumber: payload.serialNumber,
        location: payload.location,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
      };
      setAssets((cur) => [temp, ...cur]);

      const created = await api<Asset>("/assets", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // replace temp with real
      setAssets((cur) => [created, ...cur.filter((a) => a.id !== temp.id)]);
      setShowAdd(false);
      setForm({ name: "", type: "", serialNumber: "", location: "", notes: "" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Create failed: ${msg}`);
      await loadAll(); // rollback
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">EAM • Polished UI</div>
          <div className="text-xs text-neutral-500">
            API: <code>{API_BASE}</code>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6" style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 24 }}>
        {/* Sidebar */}
        <aside>
          <Card>
            <CardHeader>Navigation</CardHeader>
            <CardBody>
              <nav className="flex flex-col gap-2">
                <Button variant={tab === "dashboard" ? "primary" : "ghost"} onClick={() => setTab("dashboard")}>
                  Dashboard
                </Button>
                <Button variant={tab === "assets" ? "primary" : "ghost"} onClick={() => setTab("assets")}>
                  Assets
                </Button>
                <Button variant={tab === "inspections" ? "primary" : "ghost"} onClick={() => setTab("inspections")}>
                  Inspections
                </Button>
                <Button variant={tab === "settings" ? "primary" : "ghost"} onClick={() => setTab("settings")}>
                  Settings
                </Button>
              </nav>
            </CardBody>
          </Card>
        </aside>

        {/* Main content */}
        <main className="flex flex-col gap-6">
          {tab === "dashboard" && (
            <section className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
              <Card>
                <CardHeader>Assets</CardHeader>
                <CardBody>
                  <div className="text-3xl font-semibold">{counts.assets}</div>
                  <div className="text-sm text-neutral-500">Total assets</div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>Inspections</CardHeader>
                <CardBody>
                  <div className="text-3xl font-semibold">{counts.total}</div>
                  <div className="text-sm text-neutral-500">All inspections</div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>Pass</CardHeader>
                <CardBody>
                  <div className="text-3xl font-semibold">{counts.pass}</div>
                  <Badge tone="green">Up to date</Badge>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>Fail/Pending</CardHeader>
                <CardBody>
                  <div className="text-3xl font-semibold">{counts.fail + counts.pending}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge tone="red">Fail {counts.fail}</Badge>
                    <Badge tone="amber">Pending {counts.pending}</Badge>
                  </div>
                </CardBody>
              </Card>

              <Card style={{ gridColumn: "1 / -1" }}>
                <CardHeader>Recent inspections (by due date)</CardHeader>
                <CardBody>
                  <div style={{ overflowX: "auto" }}>
                    <table className="w-full text-sm" style={{ minWidth: 640 }}>
                      <thead>
                        <tr className="text-left text-neutral-500 border-b">
                          <th className="py-2 pr-4">ID</th>
                          <th className="py-2 pr-4">Asset</th>
                          <th className="py-2 pr-4">Inspector</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInspections.slice(0, 6).map((i) => (
                          <tr key={i.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{i.id.slice(0, 8)}…</td>
                            <td className="py-2 pr-4">{i.assetId.slice(0, 8)}…</td>
                            <td className="py-2 pr-4">{i.inspector}</td>
                            <td className="py-2 pr-4">
                              {i.status === "PASS" && <Badge tone="green">PASS</Badge>}
                              {i.status === "FAIL" && <Badge tone="red">FAIL</Badge>}
                              {i.status === "PENDING" && <Badge tone="amber">PENDING</Badge>}
                            </td>
                            <td className="py-2">{new Date(i.dueDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {!filteredInspections.length && (
                          <tr>
                            <td className="py-4 text-neutral-500" colSpan={5}>
                              No inspections.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </section>
          )}

          {tab === "assets" && (
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Search assets… (name, type, serial, location)"
                  value={assetQuery}
                  onChange={(e) => setAssetQuery(e.target.value)}
                  style={{ minWidth: 260 }}
                />
                <Button onClick={() => setShowAdd(true)}>+ Add Asset</Button>
                <Button variant="ghost" onClick={loadAll}>
                  Refresh
                </Button>
                {loading && <span className="text-sm text-neutral-500">Loading…</span>}
                {error && <span className="text-sm text-red-600">{error}</span>}
              </div>

              <Card>
                <CardHeader>Assets</CardHeader>
                <CardBody>
                  <div style={{ overflowX: "auto" }}>
                    <table className="w-full text-sm" style={{ minWidth: 760 }}>
                      <thead>
                        <tr className="text-left text-neutral-500 border-b">
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Serial</th>
                          <th className="py-2 pr-4">Location</th>
                          <th className="py-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssets.map((a) => (
                          <tr key={a.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{a.name}</td>
                            <td className="py-2 pr-4">{a.type}</td>
                            <td className="py-2 pr-4">{a.serialNumber}</td>
                            <td className="py-2 pr-4">{a.location}</td>
                            <td className="py-2">{new Date(a.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {!filteredAssets.length && (
                          <tr>
                            <td className="py-4 text-neutral-500" colSpan={5}>
                              No assets match your filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </section>
          )}

          {tab === "inspections" && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v)}
                  options={[
                    { label: "All statuses", value: "" },
                    { label: "PASS", value: "PASS" },
                    { label: "FAIL", value: "FAIL" },
                    { label: "PENDING", value: "PENDING" },
                  ]}
                />
                <Button variant="ghost" onClick={loadAll}>
                  Refresh
                </Button>
              </div>

              <Card>
                <CardHeader>Inspections</CardHeader>
                <CardBody>
                  <div style={{ overflowX: "auto" }}>
                    <table className="w-full text-sm" style={{ minWidth: 760 }}>
                      <thead>
                        <tr className="text-left text-neutral-500 border-b">
                          <th className="py-2 pr-4">ID</th>
                          <th className="py-2 pr-4">Asset</th>
                          <th className="py-2 pr-4">Inspector</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInspections.map((i) => (
                          <tr key={i.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{i.id.slice(0, 8)}…</td>
                            <td className="py-2 pr-4">{i.assetId.slice(0, 8)}…</td>
                            <td className="py-2 pr-4">{i.inspector}</td>
                            <td className="py-2 pr-4">
                              {i.status === "PASS" && <Badge tone="green">PASS</Badge>}
                              {i.status === "FAIL" && <Badge tone="red">FAIL</Badge>}
                              {i.status === "PENDING" && <Badge tone="amber">PENDING</Badge>}
                            </td>
                            <td className="py-2">{new Date(i.dueDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {!filteredInspections.length && (
                          <tr>
                            <td className="py-4 text-neutral-500" colSpan={5}>
                              No inspections.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </section>
          )}

          {tab === "settings" && (
            <section className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
              <Card>
                <CardHeader>API</CardHeader>
                <CardBody>
                  <div className="text-sm">
                    Base URL: <code>{API_BASE}</code>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" onClick={loadAll}>
                      Test Fetch
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>About</CardHeader>
                <CardBody>
                  <div className="text-sm text-neutral-600">
                    This is a polished UI using plain React + minimal CSS utilities (no extra libraries). It talks to{" "}
                    <code>GET /assets</code>, <code>POST /assets</code>, and <code>GET /inspections</code>.
                  </div>
                </CardBody>
              </Card>
            </section>
          )}
        </main>
      </div>

      {/* tiny utility styles so it looks clean without Tailwind build */}
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body { margin: 0; background: #fafafa; color: #111; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .border { border-width: 1px; }
        .border-b { border-bottom-width: 1px; }
        .border-neutral-100 { border-color: #eee; }
        .border-neutral-200 { border-color: #e5e5e5; }
        .border-neutral-300 { border-color: #d4d4d4; }
        .border-neutral-900 { border-color: #171717; }
        .bg-white { background-color: #fff; }
        .bg-neutral-50 { background-color: #fafafa; }
        .bg-neutral-100 { background-color: #f5f5f5; }
        .bg-neutral-900 { background-color: #171717; }
        .bg-black\\/40 { background-color: rgba(0,0,0,0.4); }
        .text-neutral-500 { color: #737373; }
        .text-neutral-600 { color: #525252; }
        .text-neutral-700 { color: #404040; }
        .text-neutral-900 { color: #111827; }
        .text-white { color: #fff; }
        .text-red-600 { color: #dc2626; }
        .text-amber-800 { color: #92400e; }
        .text-green-700 { color: #047857; }
        .text-xs { font-size: .75rem; }
        .text-sm { font-size: .875rem; }
        .text-3xl { font-size: 1.875rem; }
        .font-semibold { font-weight: 600; }
        .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }
        .hover\\:bg-neutral-100:hover { background: #f5f5f5; }
        .hover\\:bg-neutral-800:hover { background: #262626; }
        .outline-none { outline: none; }
        .focus\\:ring-2:focus { box-shadow: 0 0 0 2px #e5e5e5; }
        .transition { transition: all .15s ease; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
        .py-2 { padding-top: .5rem; padding-bottom: .5rem; }
        .py-3 { padding-top: .75rem; padding-bottom: .75rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .p-4 { padding: 1rem; }
        .p-5 { padding: 1.25rem; }
        .mt-2 { margin-top: .5rem; }
        .mt-3 { margin-top: .75rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: .5rem; }
        .gap-6 { gap: 1.5rem; }
        .min-h-screen { min-height: 100vh; }
        .w-full { width: 100%; }
        .border-b .last\\:border-0:last-child { border-bottom: 0; }
      `}</style>
    </div>
  );
}
