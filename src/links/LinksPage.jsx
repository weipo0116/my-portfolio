import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSiteData, ui } from "../i18n.js";
import { usePrefs } from "../prefs.js";
import PrefsToggles from "../PrefsToggles.jsx";
import avatar from "../assets/images/profile/avatar_480.jpg";
import resumePdf from "../resume/resume.pdf";
import MagicField, { Ambient, castRipple } from "./MagicField.jsx";
import Sprite from "./Sprite.jsx";

const BASE = import.meta.env.BASE_URL; // "/my-portfolio/"
const CAST_MS = 900; // how long the spell plays before we navigate
const SPARKS = [
  [-120, -34],
  [-60, -52],
  [20, -56],
  [110, -40],
  [130, 18],
  [60, 50],
  [-30, 54],
  [-118, 30],
];

const IconGithub = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className="fill"
  >
    <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className="fill"
  >
    <path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96V21H9z" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

// Original wand mark: a stick with a four-point star at its tip.
const Wand = () => (
  <svg className="links-wand" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
    <path className="links-wand-stick" d="M5 23 L16.5 11.5" />
    <path className="links-wand-band" d="M13.2 14.8 L15.2 12.8" />
    <path
      className="links-wand-star"
      d="M20 3.5 Q20.6 7.4 24.5 8 Q20.6 8.6 20 12.5 Q19.4 8.6 15.5 8 Q19.4 7.4 20 3.5 Z"
    />
    <circle className="links-wand-glint" cx="25" cy="14" r="1" />
    <circle className="links-wand-glint is-late" cx="13.5" cy="3.5" r="0.9" />
  </svg>
);

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isModifiedClick = (event) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0;

export default function LinksPage() {
  const { lang, theme, toggleLang, toggleTheme } = usePrefs();
  const siteData = getSiteData(lang);
  const t = ui[lang];
  const L = t.links;
  const spriteRef = useRef(null);
  const castingRef = useRef(false);
  const timersRef = useRef([]);
  const [casting, setCasting] = useState(null);

  const labProjects = useMemo(
    () =>
      siteData.lab.items
        .filter((item) => item.status === "Lit") // only what's live
        .map((item) => ({
          name: item.name.split(" — ")[0],
          // no page of its own yet: open its card on the Lab page
          href: item.link || `${BASE}work/#lab`,
          thumb: item.thumb,
          glyph: item.glyph || "✦",
        })),
    [siteData],
  );

  const links = [
    { key: "portfolio", title: L.portfolio, subtitle: L.portfolioSub, href: BASE },
    { key: "lab", title: L.work, href: `${BASE}work/` },
  ];

  const later = (fn, ms) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const reset = useCallback(() => {
    castingRef.current = false;
    setCasting(null);
    spriteRef.current?.release();
  }, []);

  // Back/forward cache: never come back to a half-cast page.
  useEffect(() => {
    const onPageShow = (event) => {
      if (event.persisted) reset();
    };
    window.addEventListener("pageshow", onPageShow);
    const timers = timersRef.current;
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reset]);

  // key: which word lights up. The sprite lands on the word's wand, or on
  // the Lab project chip that was tapped; then we go to href.
  const cast = async (event, key, href) => {
    if (isModifiedClick(event) || prefersReducedMotion()) return;
    event.preventDefault();
    if (castingRef.current) return;
    castingRef.current = true;

    const target = event.currentTarget;
    const box = target.getBoundingClientRect();
    // Keyboard activation has no pointerdown, so start the ripple here.
    if (event.detail === 0) castRipple(box.left + box.width / 2, box.top + box.height / 2);

    const wand = target.querySelector(".links-wand");
    const tip = wand ? wand.getBoundingClientRect() : box;
    await spriteRef.current?.flyTo(
      wand ? tip.right - 4 : tip.left + tip.width / 2,
      tip.top - 6,
    );
    setCasting(key);
    later(() => window.location.assign(href), CAST_MS);
  };

  return (
    <main className="links-page">
      <MagicField />
      <Ambient />
      <Sprite ref={spriteRef} perchSelector=".links-avatar-wrap" />
      <div className="links-prefs">
        <PrefsToggles
          lang={lang}
          theme={theme}
          onToggleLang={toggleLang}
          onToggleTheme={toggleTheme}
        />
      </div>
      <div className="links-shell">
        <header className="links-header">
          <div className="links-avatar-wrap">
            <svg className="links-ring" viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <path
                  id="links-ring-path"
                  d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0"
                />
              </defs>
              <text>
                <textPath href="#links-ring-path" textLength="538">
                  WEBBER LAI · AI MA · DATA × DESIGN · TAIPEI ·
                </textPath>
              </text>
            </svg>
            <div className="links-avatar">
              <img src={avatar} alt="Webber Lai" width="112" height="112" />
            </div>
          </div>
          <h1 className="links-name">{siteData.name}</h1>
          <p className="links-role">
            {lang === "zh" ? "AI MA（儲備幹部）" : "AI Management Associate"}
            <span className="links-org">
              {lang === "zh"
                ? "第一銀行 · 數位通路處"
                : "First Bank · Digital Banking Division"}
            </span>
          </p>
          <p className="links-bio">
            {/* Degree on its own line, then the one-line pitch */}
            {L.bio.split(/(?<=[A-Za-z]{2}\.)\s+|(?<=。)/).filter(Boolean).map((line) => (
              <span key={line} className="links-bio-line">
                {line}
              </span>
            ))}
          </p>
        </header>

        <nav
          className={`links-words${casting ? " is-casting" : ""}`}
          aria-label={L.mainLinks}
        >
          {links.map((link) => (
            <div
              key={link.key}
              className={`links-word is-${link.key}${casting === link.key ? " is-cast" : ""}`}
            >
              <span className="links-word-core" aria-hidden="true" />
              <span className="links-word-ring" aria-hidden="true" />
              <span className="links-word-ring is-late" aria-hidden="true" />
              {SPARKS.map(([dx, dy]) => (
                <svg
                  key={`${dx},${dy}`}
                  className="links-word-spark"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
                  style={{ "--dx": `${dx}px`, "--dy": `${dy}px` }}
                >
                  <path d="M5 0Q5 5 10 5Q5 5 5 10Q5 5 0 5Q5 5 5 0Z" />
                </svg>
              ))}
              <a
                className="links-word-title"
                href={link.href}
                onClick={(event) => cast(event, link.key, link.href)}
              >
                {link.title}
                <Wand />
              </a>
              {link.key === "portfolio" ? (
                <p className="links-word-sub">
                  {link.subtitle}
                  <span aria-hidden="true"> · </span>
                  <a className="links-inline" href={resumePdf} download="Webber_Lai_Resume.pdf">
                    {L.resume} PDF
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                    </svg>
                  </a>
                </p>
              ) : (
                <div className="links-orbit">
                  <svg className="links-orbit-path" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 50 Q150 -14 296 50" />
                  </svg>
                  <ul className="links-orbs" aria-label={L.work}>
                    {labProjects.map((project, index) => (
                      <li key={project.name} style={{ "--o": index }}>
                        <a
                          className="links-orb"
                          href={project.href}
                          onClick={(event) => cast(event, "lab", project.href)}
                        >
                          <span className="links-orb-face">
                            {project.thumb ? (
                              <img src={project.thumb} alt="" loading="lazy" />
                            ) : (
                              <span className="links-orb-glyph" aria-hidden="true">
                                {project.glyph}
                              </span>
                            )}
                          </span>
                          <span className="links-orb-name">{project.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        <footer className="links-footer">
          <div className="links-social" aria-label={L.contact}>
            <a className="links-circle" href={siteData.contacts.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <IconGithub />
            </a>
            <a className="links-circle" href={siteData.contacts.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <IconLinkedIn />
            </a>
            <a className="links-circle" href={siteData.contacts.email} aria-label="Email">
              <IconMail />
            </a>
          </div>
          <p className="links-location">{siteData.location}</p>
        </footer>
      </div>
    </main>
  );
}
