import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import api from "./api";
import { getSocket, disconnectSocket } from "./socket";

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("collabspace_user")); } catch { return null; }
  });
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("collabspace_token");
    localStorage.removeItem("collabspace_user");
    disconnectSocket();
    setUser(null);
    navigate("/login");
  }

  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to={user ? "/" : "/login"}>◈ CollabSpace</Link>
      <span className="topbar-sub">Collaborative academic workspace</span>
      {user && <div className="user-area"><span>{user.name}</span><button className="btn btn-light" onClick={logout}>Log out</button></div>}
    </header>
    <main className="main">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" onAuth={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <AuthPage mode="register" onAuth={setUser} />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/documents/:id" element={user ? <EditorPage /> : <Navigate to="/login" />} />
        <Route path="/dfa" element={user ? <DFAPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </main>
    <footer>CollabSpace · MERN + Socket.IO + DFA academic project</footer>
  </div>;
}

function AuthPage({ mode, onAuth }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const register = mode === "register";

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const { data } = await api.post(`/auth/${register ? "register" : "login"}`, form);
      localStorage.setItem("collabspace_token", data.token);
      localStorage.setItem("collabspace_user", JSON.stringify(data.user));
      onAuth(data.user); navigate("/");
    } catch (err) { setError(err.response?.data?.message || "Could not connect to server"); }
    finally { setBusy(false); }
  }

  return <section className="auth-card">
    <div className="eyebrow">STUDENT COLLABORATION</div>
    <h1>{register ? "Create your account" : "Welcome back"}</h1>
    <p className="muted">Work together on shared academic documents.</p>
    <form onSubmit={submit} className="form">
      {register && <label>Full name<input required minLength="2" maxLength="60" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>}
      <label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
      <label>Password<input required type="password" minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
      {error && <div className="error">{error}</div>}
      <button className="btn btn-primary full" disabled={busy}>{busy ? "Please wait..." : register ? "Create account" : "Log in"}</button>
    </form>
    <p className="muted center">{register ? "Already registered?" : "New to CollabSpace?"} <Link to={register ? "/login" : "/register"}>{register ? "Log in" : "Create an account"}</Link></p>
  </section>;
}

function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function load() {
    try { const {data} = await api.get("/documents"); setDocs(data.documents); }
    catch (e) { setError(e.response?.data?.message || "Could not load documents"); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const {data} = await api.post("/documents", {title});
      setTitle(""); navigate(`/documents/${data.document.id}`);
    } catch (e) { setError(e.response?.data?.message || "Could not create document"); }
    finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this document permanently?")) return;
    try { await api.delete(`/documents/${id}`); load(); }
    catch (e) { setError(e.response?.data?.message || "Delete failed"); }
  }

  return <div className="page">
    <div className="page-heading">
      <div><div className="eyebrow">YOUR WORKSPACE</div><h1>Documents</h1><p className="muted">Create and collaborate on your academic work.</p></div>
      <Link className="btn btn-light" to="/dfa">Explore DFA ↗</Link>
    </div>
    <form className="create-row" onSubmit={create}>
      <input placeholder="New document title (3–100 characters)" value={title} onChange={e=>setTitle(e.target.value)} minLength="3" maxLength="100" required />
      <button className="btn btn-primary" disabled={busy}>{busy ? "Creating..." : "+ New document"}</button>
    </form>
    {error && <div className="error">{error}</div>}
    <div className="section-label">{docs.length} DOCUMENT{docs.length === 1 ? "" : "S"}</div>
    {docs.length === 0 ? <div className="empty"><div className="empty-icon">▤</div><h3>No documents yet</h3><p className="muted">Create your first document above to get started.</p></div> :
      <div className="doc-grid">{docs.map(doc=><article className="doc-card" key={doc.id}>
        <div className="doc-icon">▤</div><div className="doc-state">{doc.state}</div>
        <h3>{doc.title}</h3><p className="muted small">Updated {new Date(doc.updatedAt).toLocaleString()}</p>
        <div className="card-actions"><button className="btn btn-primary" onClick={()=>navigate(`/documents/${doc.id}`)}>Open</button><button className="btn btn-light" onClick={()=>remove(doc.id)}>Delete</button></div>
      </article>)}</div>}
  </div>;
}

function EditorPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Loading document...");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [activities, setActivities] = useState([]);
  const [typing, setTyping] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function load() {
    try {
      const {data} = await api.get(`/documents/${id}`);
      setDoc(data.document); setTitle(data.document.title); setContent(data.document.content);
      setStatus(`Loaded · version ${data.document.version}`);
    } catch (e) { setError(e.response?.data?.message || "Could not load document"); }
  }

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!doc) return;
    const socket = getSocket();
    socket.connect();
    const onConnect = () => { setConnected(true); socket.emit("document:join", {documentId:id}); };
    const onDisconnect = () => setConnected(false);
    const onChanged = ({document, changedBy}) => {
      if (String(document.id) !== String(id)) return;
      setDoc(current => current ? {...current, version:document.version, state:document.state, lockedBy:document.lockedBy} : current);
      setContent(document.content); setTitle(document.title);
      setStatus(`Updated by ${changedBy} · version ${document.version}`);
    };
    const onState = payload => setDoc(current => current ? {...current, state:payload.state, lockedBy:payload.lockedBy} : current);
    const onError = payload => setError(payload.message);
    const onTyping = payload => setTyping(payload.isTyping ? `${payload.user} is typing...` : "");
    socket.on("connect", onConnect); socket.on("disconnect", onDisconnect);
    socket.on("document:changed", onChanged); socket.on("document:state", onState);
    socket.on("document:error", onError); socket.on("document:typing", onTyping);
    if (socket.connected) onConnect();
    return () => {
      socket.off("connect", onConnect); socket.off("disconnect", onDisconnect);
      socket.off("document:changed", onChanged); socket.off("document:state", onState);
      socket.off("document:error", onError); socket.off("document:typing", onTyping);
      socket.disconnect();
    };
  }, [doc?.id, id]);

  async function save() {
    if (!doc) return;
    setBusy(true); setError("");
    try {
      const {data} = await api.put(`/documents/${id}`, {title, content, version:doc.version});
      setDoc(data.document); setStatus(`Saved successfully · version ${data.document.version}`);
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
      if (e.response?.status === 409) setStatus("Version conflict — reload before saving");
    } finally { setBusy(false); }
  }

  async function action(name) {
    setError("");
    try {
      const {data} = await api.post(`/documents/${id}/transition`, {action:name});
      setDoc(current=>({...current,state:data.state,lockedBy:data.lockedBy}));
      setStatus(`DFA accepted ${name}: ${data.state}`);
    } catch(e) { setError(e.response?.data?.message || "DFA rejected operation"); }
  }

  async function share(e) {
    e.preventDefault();
    try { const {data} = await api.post(`/documents/${id}/share`, {email:shareEmail}); setStatus(data.message); setShareEmail(""); load(); }
    catch(e) { setError(e.response?.data?.message || "Sharing failed"); }
  }

  async function showActivities() {
    try { const {data} = await api.get(`/documents/${id}/activities`); setActivities(data.activities); }
    catch(e) { setError(e.response?.data?.message || "Could not load activities"); }
  }

  if (!doc) return <div className="page"><p>{error || status}</p><button className="btn btn-light" onClick={()=>navigate("/")}>Back</button></div>;
  const isLockedByOther = doc.lockedBy && String(doc.lockedBy) !== String(JSON.parse(localStorage.getItem("collabspace_user") || "{}").id);

  return <div className="editor-page">
    <div className="editor-toolbar">
      <button className="btn btn-light" onClick={()=>navigate("/")}>← Workspace</button>
      <input className="title-input" value={title} onChange={e=>setTitle(e.target.value)} aria-label="Document title" />
      <span className={connected ? "connection online" : "connection offline"}>{connected ? "● Live" : "● Offline"}</span>
      <button className="btn btn-primary" onClick={save} disabled={busy || isLockedByOther}>{busy ? "Saving..." : "Save"}</button>
    </div>
    <div className="editor-meta"><span>State: <b>{doc.state}</b></span><span>Version: {doc.version}</span><span>{status}</span></div>
    {error && <div className="error">{error}</div>}
    {typing && <div className="notice">{typing}</div>}
    <textarea className="document-editor" value={content} disabled={Boolean(isLockedByOther)} placeholder="Start writing your shared document..." onChange={e=>{setContent(e.target.value); const s=getSocket(); s.emit("document:typing",{documentId:id,isTyping:true});}} />
    <div className="editor-panels">
      <section className="panel"><h3>Document state / DFA controls</h3><p className="muted small">The server validates each requested transition.</p>
        <div className="button-wrap">
          <button className="btn btn-light" onClick={()=>action("EDIT")}>Edit</button>
          <button className="btn btn-light" onClick={()=>action("LOCK")}>Lock</button>
          <button className="btn btn-light" onClick={()=>action("UNLOCK")}>Unlock</button>
          <button className="btn btn-light" onClick={()=>action("CLOSE")}>Close</button>
          <button className="btn btn-light" onClick={()=>action("CANCEL")}>Cancel</button>
        </div>
      </section>
      <section className="panel"><h3>Share with collaborator</h3><form className="share-row" onSubmit={share}><input type="email" required placeholder="Registered student email" value={shareEmail} onChange={e=>setShareEmail(e.target.value)} /><button className="btn btn-primary">Share</button></form></section>
      <section className="panel"><h3>Activity history</h3><button className="btn btn-light" onClick={showActivities}>Load activities</button>
        {activities.map(a=><p className="small activity" key={a._id}>{a.action} · {a.user?.name || "User"} · {new Date(a.createdAt).toLocaleString()}</p>)}
      </section>
    </div>
  </div>;
}

function DFAPage() {
  const [state, setState] = useState("VIEWING");
  const [history, setHistory] = useState(["VIEWING"]);
  const table = {
    VIEWING:{EDIT:"EDITING",LOCK:"LOCKED"},
    EDITING:{SAVE:"SAVING",LOCK:"LOCKED",CANCEL:"VIEWING"},
    SAVING:{SAVE_SUCCESS:"SAVED",SAVE_FAILURE:"EDITING"},
    SAVED:{EDIT:"EDITING",LOCK:"LOCKED",CLOSE:"VIEWING"},
    LOCKED:{UNLOCK:"SAVED"}
  };
  const actions = ["EDIT","SAVE","SAVE_SUCCESS","SAVE_FAILURE","LOCK","UNLOCK","CLOSE","CANCEL"];
  function run(action) {
    const next = table[state]?.[action];
    if (next) { setState(next); setHistory(h=>[...h, `${state} --${action}--> ${next}`]); }
    else setHistory(h=>[...h, `REJECTED: ${state} --${action}--> undefined`]);
  }
  return <div className="page">
    <Link to="/" className="back-link">← Workspace</Link>
    <div className="eyebrow">FORMAL LANGUAGES & AUTOMATA THEORY</div><h1>DFA Simulator</h1>
    <p className="muted">Interactive illustration of the document lifecycle DFA. The production document actions are validated by the backend automaton.</p>
    <div className="dfa-current"><span className="muted">CURRENT STATE</span><strong>{state}</strong><span>{["VIEWING","SAVED","LOCKED"].includes(state) ? "Stable / accepting state" : "Intermediate operation state"}</span></div>
    <div className="state-grid">{Object.keys(table).map(s=><div className={`state-node ${s===state?"active":""}`} key={s}>{s}</div>)}</div>
    <h3>Input alphabet</h3><div className="button-wrap">{actions.map(a=><button className="btn btn-light" key={a} onClick={()=>run(a)}>{a}</button>)}</div>
    <h3>Transition history</h3><div className="history">{history.map((h,i)=><div key={i}>{i+1}. {h}</div>)}</div>
    <button className="btn btn-primary" onClick={()=>{setState("VIEWING");setHistory(["VIEWING"]);}}>Reset automaton</button>
  </div>;
}

export default App;
