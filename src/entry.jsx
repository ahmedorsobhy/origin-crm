import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src_app_deploy.jsx";

// If a page breaks, show what happened (so a screenshot tells us the cause) instead of a blank screen
class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { try { console.error(err, info && info.componentStack); } catch (e) {} }
  render() {
    const e = this.state.err;
    if (!e) return this.props.children;
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "calc(24px + env(safe-area-inset-top)) 20px 24px", maxWidth: 560, margin: "0 auto", color: "#0E1830" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Something went wrong 😕</div>
        <div style={{ fontSize: 14, color: "#5b6478", marginBottom: 14 }}>Take a screenshot of this and send it, then tap Reload.</div>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#F6F4EF", border: "1px solid #E5DFD3", borderRadius: 12, padding: 12, fontSize: 12 }}>{String(e && (e.stack || e.message) || e).slice(0, 1500)}</pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: 14, border: "none", borderRadius: 999, background: "#0E1830", color: "#fff", padding: "10px 20px", fontWeight: 700, fontSize: 14 }}>Reload</button>
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(<Boundary><App /></Boundary>);
