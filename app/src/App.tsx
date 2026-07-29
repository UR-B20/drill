import { useEffect, useState } from "react";
import { NavLink, Route, Routes, Link, useLocation } from "react-router-dom";
import {
  loadContent,
  loadVideos,
  type CompanionVideo,
  type Content,
} from "./lib/content";
import RosterPage from "./pages/RosterPage";
import DrillPage from "./pages/DrillPage";
import GlossaryPage from "./pages/GlossaryPage";
import { SessionRunner, TrainerHome } from "./pages/TrainerPage";

type ThemePref = "auto" | "light" | "dark";

function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  if (pref === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);
}

export default function App() {
  const [content, setContent] = useState<Content | null>(null);
  const [videos, setVideos] = useState<CompanionVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemePref>(
    () => (localStorage.getItem("themePref") as ThemePref) || "auto",
  );
  const location = useLocation();

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("themePref", theme);
  }, [theme]);

  useEffect(() => {
    loadContent().then(setContent).catch((e) => setError(String(e)));
    loadVideos().then((v) => setVideos(v.videos)).catch(() => {});
  }, []);

  const isTrainer = location.pathname.startsWith("/trainer");

  return (
    <>
      <header className="app-header">
        <Link to="/" className="title">
          SAF Drill Coach
        </Link>
        <button
          className="theme-btn"
          onClick={() =>
            setTheme(theme === "auto" ? "dark" : theme === "dark" ? "light" : "auto")
          }
          aria-label="Cycle color theme"
        >
          theme: {theme}
        </button>
      </header>
      {!isTrainer && (
        <div className="supervision-note">
          Revision &amp; reference aid — execution standards are confirmed by a
          qualified trainer in person.
        </div>
      )}
      <main className="app-main">
        {error && (
          <div className="pending-panel">
            <span className="label">Load error</span>
            {error}
          </div>
        )}
        {!content && !error && <p style={{ color: "var(--muted)" }}>Loading content…</p>}
        {content && (
          <Routes>
            <Route path="/" element={<RosterPage content={content} />} />
            <Route path="/drill/:id" element={<DrillPage content={content} videos={videos} />} />
            <Route path="/glossary" element={<GlossaryPage content={content} />} />
            <Route path="/trainer" element={<TrainerHome content={content} />} />
            <Route path="/trainer/session/:id" element={<SessionRunner content={content} />} />
          </Routes>
        )}
      </main>
      <nav className="tabbar" aria-label="Main">
        <div className="tabbar-inner">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Drills
          </NavLink>
          <NavLink to="/glossary" className={({ isActive }) => (isActive ? "active" : "")}>
            Glossary
          </NavLink>
          <NavLink to="/trainer" className={({ isActive }) => (isActive ? "active" : "")}>
            Trainer
          </NavLink>
        </div>
      </nav>
    </>
  );
}
