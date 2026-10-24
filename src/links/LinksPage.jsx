import { siteData } from "../data.js";
import avatar from "../assets/avatar_480.jpg";
import resumePdf from "../resume/resume.pdf";

const BASE = import.meta.env.BASE_URL; // "/my-portfolio/"

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const icons = {
  portfolio: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="14" rx="2.5" />
      <path d="M3 9h18M8 21h8" />
    </svg>
  ),
  lab: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 3h6M10 3v6l-5.5 9.2A1.8 1.8 0 006 21h12a1.8 1.8 0 001.5-2.8L14 9V3" />
      <path d="M7.5 15h9" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  ),
};

const IconGithub = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="fill">
    <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="fill">
    <path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96V21H9z" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export default function LinksPage() {
  const links = [
    {
      key: "portfolio",
      title: "Portfolio",
      subtitle: "Experience & projects",
      href: BASE,
    },
    {
      key: "lab",
      title: "Lab · AI Tools",
      subtitle: "Small AI tools I'm building",
      href: `${BASE}#lab`,
    },
    {
      key: "resume",
      title: "Résumé",
      subtitle: "One-page PDF",
      href: resumePdf,
      download: "Webber_Lai_Resume.pdf",
    },
  ];

  return (
    <main className="links-page">
      <div className="links-shell">
        <header className="links-header">
          <div className="links-avatar">
            <img src={avatar} alt="Webber Lai" width="112" height="112" />
          </div>
          <h1 className="links-name">{siteData.name}</h1>
          <p className="links-role">
            AI Management Associate
            <span className="links-org">First Bank · Digital Banking Division</span>
          </p>
          <p className="links-bio">
            M.S. CS @ NCCU. I turn data and ideas into tools people actually use.
          </p>
        </header>

        <nav className="links-list" aria-label="Main links">
          {links.map((link) => (
            <a
              key={link.key}
              className="links-card"
              href={link.href}
              {...(link.download ? { download: link.download } : {})}
            >
              <span className={`links-card-icon is-${link.key}`}>
                {icons[link.key]}
              </span>
              <span className="links-card-text">
                <span className="links-card-title">{link.title}</span>
                <span className="links-card-subtitle">{link.subtitle}</span>
              </span>
              <span className="links-card-arrow">
                <Arrow />
              </span>
            </a>
          ))}
        </nav>

        <div className="links-social" aria-label="Contact">
          <a
            className="links-pill"
            href={siteData.contacts.github}
            target="_blank"
            rel="noreferrer"
          >
            <IconGithub />
            GitHub
          </a>
          <a
            className="links-pill"
            href={siteData.contacts.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            <IconLinkedIn />
            LinkedIn
          </a>
          <a className="links-pill" href={siteData.contacts.email}>
            <IconMail />
            Email
          </a>
        </div>

        <p className="links-footer">{siteData.location}</p>
      </div>
    </main>
  );
}
