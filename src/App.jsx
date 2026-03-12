// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { siteData } from "./data";
import "./App.css";
import resumePdf from "./resume/resume.pdf";

const IconGithub = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 2C6.48 2 2 6.6 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.86-.01-1.7-2.78.62-3.37-1.39-3.37-1.39-.45-1.2-1.11-1.52-1.11-1.52-.91-.65.07-.64.07-.64 1 .07 1.53 1.07 1.53 1.07.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.64-1.37-2.22-.26-4.56-1.15-4.56-5.1 0-1.12.38-2.03 1.02-2.75-.1-.26-.45-1.32.1-2.76 0 0 .84-.28 2.75 1.05.8-.23 1.66-.35 2.52-.35.86 0 1.72.12 2.52.35 1.9-1.33 2.75-1.05 2.75-1.05.55 1.44.2 2.5.1 2.76.64.72 1.02 1.63 1.02 2.75 0 3.96-2.35 4.83-4.58 5.08.36.32.69.93.69 1.88 0 1.36-.01 2.45-.01 2.79 0 .27.18.6.69.49 3.96-1.35 6.82-5.18 6.82-9.7C22 6.6 17.52 2 12 2z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20.45 20.45h-3.56v-5.6c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.7H9.32V9h3.42v1.56h.05c.48-.9 1.65-1.86 3.4-1.86 3.64 0 4.31 2.4 4.31 5.52v6.23zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v.4l8 5.1 8-5.1V7H4zm16 10V10l-8 5.2L4 10v7h16z" />
  </svg>
);

const getInitials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const joinClasses = (...values) => values.filter(Boolean).join(" ");

const ProgressiveImage = ({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  eager = false,
  objectFit = "cover",
  objectPosition = "center",
  children,
  ...rest
}) => {
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(() => !src);

  useEffect(() => {
    if (!src) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div
      className={joinClasses(
        "progressive-image",
        isLoaded ? "is-loaded" : "is-loading",
        className,
      )}
      {...rest}
    >
      {src ? (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={joinClasses("progressive-image-asset", imgClassName)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          style={{ objectFit, objectPosition }}
        />
      ) : null}
      {children}
    </div>
  );
};

function App() {
  const carouselViewportRef = useRef(null);
  const carouselGap = 20;
  const [activeSection, setActiveSection] = useState("home");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPerPage, setCarouselPerPage] = useState(3);
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedOtherExperience, setExpandedOtherExperience] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const isRepoLink = (value) => value?.startsWith("http");
  const isRepoUnreleased = (value) =>
    value?.trim().toLowerCase() === "unreleased";
  const projectHighlights = siteData.heroHighlights || [];

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getProjectLinks = (project) => {
    const links = project?.links ? { ...project.links } : {};
    if (project?.repo && links.repo == null) links.repo = project.repo;
    return links;
  };

  const renderProjectLink = (label, href) => {
    if (!href) return null;
    if (isRepoUnreleased(href)) {
      return (
        <span className="project-meta-link is-unreleased" key={label}>
          {label}: {href}
        </span>
      );
    }
    if (isRepoLink(href)) {
      return (
        <a
          className="project-meta-link"
          href={href}
          target="_blank"
          rel="noreferrer"
          key={label}
        >
          {label}
        </a>
      );
    }
    return (
      <span className="project-meta-link" key={label}>
        {label}: {href}
      </span>
    );
  };

  useEffect(() => {
    const updatePerPage = () => {
      const width = window.innerWidth;
      if (width < 720) {
        setCarouselPerPage(1);
      } else if (width < 1024) {
        setCarouselPerPage(2);
      } else {
        setCarouselPerPage(3);
      }
    };
    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
  }, []);

  const otherExperiences = siteData.otherExperiences || [];
  const useTwoRows = otherExperiences.length > 6;
  const carouselColumns = useMemo(() => {
    if (!useTwoRows) {
      return otherExperiences.map((item) => [item]);
    }
    const columns = [];
    for (let i = 0; i < otherExperiences.length; i += 2) {
      columns.push(otherExperiences.slice(i, i + 2));
    }
    return columns;
  }, [otherExperiences, useTwoRows]);

  const carouselMaxIndex = Math.max(
    0,
    carouselColumns.length - carouselPerPage,
  );
  const carouselPageCount = carouselMaxIndex + 1;

  useEffect(() => {
    if (carouselIndex > carouselMaxIndex) {
      setCarouselIndex(carouselMaxIndex);
    }
  }, [carouselIndex, carouselMaxIndex]);

  useEffect(() => {
    const viewport = carouselViewportRef.current;
    if (!viewport) return;
    const viewportWidth = viewport.clientWidth;
    const columnWidth =
      (viewportWidth - carouselGap * (carouselPerPage - 1)) / carouselPerPage;
    const step = columnWidth + carouselGap;
    viewport.scrollTo({ left: carouselIndex * step, behavior: "smooth" });
  }, [carouselIndex, carouselPerPage, carouselGap]);

  const moveCarouselBy = (delta) => {
    const nextIndex = Math.min(
      carouselMaxIndex,
      Math.max(0, carouselIndex + delta),
    );
    if (nextIndex !== carouselIndex) {
      setCarouselIndex(nextIndex);
    }
  };

  useEffect(() => {
    if (!expandedOtherExperience && !expandedProject) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setExpandedOtherExperience(null);
        setExpandedProject(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedOtherExperience, expandedProject]);

  useEffect(() => {
    const sectionIds = [
      "home",
      "about",
      "education",
      "experience",
      "projects",
      "others",
    ];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const visibleSections = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target?.id;
          if (!id) return;
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
        });

        let nextActive = null;
        let maxRatio = -1;
        visibleSections.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            nextActive = id;
          }
        });

        if (!nextActive) {
          const marker = window.innerHeight * 0.35;
          const fallback = sections
            .map((section) => ({
              id: section.id,
              distance: Math.abs(section.getBoundingClientRect().top - marker),
            }))
            .sort((a, b) => a.distance - b.distance)[0];
          nextActive = fallback?.id ?? null;
        }

        if (nextActive) {
          setActiveSection(nextActive);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTypedTitle(siteData.title);
  }, []);

  return (
    <div className="page">
      <header className="hero" id="home">
        <nav className="nav">
          <div className="brand">{siteData.name}</div>
          <button
            className={`hamburger ${mobileMenuOpen ? "is-open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <div className={`nav-links ${mobileMenuOpen ? "is-open" : ""}`}>
            <a
              href="#home"
              className={activeSection === "home" ? "is-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#about"
              className={activeSection === "about" ? "is-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#education"
              className={activeSection === "education" ? "is-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Education
            </a>
            <a
              href="#experience"
              className={activeSection === "experience" ? "is-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Experience
            </a>
            <a
              href="#projects"
              className={activeSection === "projects" ? "is-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </a>
            <a
              href="#others"
              className={activeSection === "others" ? "is-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Others
            </a>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-kicker">{siteData.location}</p>
            <h1>
              {siteData.name}
              <span className="hero-title">
                {typedTitle}
                <span className="typewriter-cursor" aria-hidden="true" />
              </span>
            </h1>
            <p className="hero-tagline" style={{ whiteSpace: "pre-line" }}>
              {siteData.tagline}
            </p>

            {projectHighlights.length ? (
              <ul className="hero-highlights">
                {projectHighlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}

            <div className="hero-actions">
              <button
                className="hero-cta hero-cta-primary"
                type="button"
                onClick={() => scrollToId("projects")}
              >
                View Projects
              </button>
              <a
                className="hero-cta hero-cta-secondary"
                href={resumePdf}
                download="Webber_Lai_Resume.pdf"
              >
                Download résumé
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            </div>

            <div className="contact-row">
              <a
                className="icon-link"
                href={siteData.contacts.github}
                aria-label="GitHub"
                target="_blank"
                rel="noreferrer"
              >
                <IconGithub />
              </a>
              <a
                className="icon-link"
                href={siteData.contacts.linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
              >
                <IconLinkedIn />
              </a>
              <a
                className="icon-link"
                href={siteData.contacts.email}
                aria-label="Email"
              >
                <IconMail />
              </a>
            </div>
          </div>

          <ProgressiveImage
            className="hero-avatar"
            role="img"
            aria-label={siteData.avatarAlt}
            src={siteData.avatarImage}
            alt=""
            eager
            imgClassName="hero-avatar-image"
          >
            <div className="avatar-ring" />
            {!siteData.avatarImage && (
              <div className="avatar-initials">
                {getInitials(siteData.name)}
              </div>
            )}
          </ProgressiveImage>
        </div>
      </header>

      <main className="main">
        <section className="section about-section reveal" id="about">
          <div className="section-header about-header">
            <h2>About Me</h2>
          </div>
          <div className="about-layout">
            <ProgressiveImage
              className="about-photo"
              aria-hidden="true"
              src={siteData.aboutImage || siteData.avatarImage}
              alt=""
              imgClassName="about-photo-image"
            />
            <div className="about-content">
              <p className="about-text">{siteData.about.intro}</p>
              <p className="about-status">{siteData.about.status}</p>
              <br />
              <div className="about-inline-skills-gap" />
              <div className="tag-list">
                {siteData.skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {siteData.education?.length ? (
          <section className="section education-section reveal" id="education">
            <div className="section-header">
              <h2>Education</h2>
              <p>Academic background</p>
            </div>
            <div className="education-block education-standalone">
              <div className="education-timeline">
                {siteData.education.map((item) => (
                  <div
                    key={`${item.degree}-${item.school}`}
                    className="education-timeline-item"
                  >
                    <div className="education-timeline-marker" />
                    <div className="education-timeline-content">
                      <div className="education-header-row">
                        <p className="education-degree">{item.degree}</p>
                        <p className="education-period">{item.period}</p>
                      </div>
                      <p className="education-meta">{item.school}</p>
                      {item.note ? (
                        <p className="education-note">
                          {item.note.split("\n").map((line, index) => (
                            <span key={`${item.school}-note-${index}`}>
                              {line}
                              {index < item.note.split("\n").length - 1 ? (
                                <br />
                              ) : null}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="section reveal" id="experience">
          <div className="section-header">
            <div className="experience-heading-block">
              <h2>Experience</h2>
            </div>
            <p>Work history</p>
          </div>
          <p className="resume-link">
            <a
              className="resume-link-anchor"
              href={resumePdf}
              download="Webber_Lai_Resume.pdf"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download my Résumé
            </a>
          </p>
          <br></br>
          <div className="experience-list">
            {siteData.experience.map((item, index) => (
              <article
                key={`${item.role}-${item.company}`}
                className="info-card experience-card reveal-card"
                style={{ "--card-delay": `${index * 90}ms` }}
              >
                <div className="experience-row">
                  <div className="company-logo" aria-hidden="true">
                    {item.logo ? (
                      <ProgressiveImage
                        className="company-logo-shell"
                        src={item.logo}
                        alt=""
                        imgClassName="company-logo-image"
                        objectFit="contain"
                      />
                    ) : (
                      <span className="company-initials">
                        {getInitials(item.company)}
                      </span>
                    )}
                  </div>
                  <div className="experience-body">
                    <div className="card-top">
                      <h3>{item.role}</h3>
                    </div>
                    <p className="card-company">{item.company}</p>
                    <p className="card-period">{item.period}</p>
                    {Array.isArray(item.summary) ? (
                      <ul className="card-summary-list">
                        {item.summary.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="card-summary">{item.summary}</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section reveal" id="projects">
          <div className="section-header">
            <h2>Selected Projects</h2>
            <p>Projects in Class</p>
          </div>
          <div className="project-list">
            {siteData.projects.map((project, index) => (
              <article
                key={project.name}
                className="info-card project-row project-row-preview reveal-card"
                role="button"
                tabIndex={0}
                style={{ "--card-delay": `${index * 100}ms` }}
                onClick={() => setExpandedProject(project)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setExpandedProject(project);
                  }
                }}
              >
                <ProgressiveImage
                  className="project-thumb"
                  src={project.image}
                  alt={project.name}
                  imgClassName="project-thumb-image"
                  objectFit="contain"
                >
                  {project.image ? (
                    <div className="project-thumb-glow" aria-hidden="true" />
                  ) : null}
                </ProgressiveImage>
                <div className="project-body">
                  <h3 className="project-title">{project.name}</h3>
                  {project.role ? (
                    <p className="project-role">{project.role}</p>
                  ) : null}
                  {Array.isArray(project.stack) && project.stack.length ? (
                    <div className="project-stack">
                      {project.stack.slice(0, 6).map((item) => (
                        <span
                          className="project-chip"
                          key={`${project.name}-${item}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {isRepoLink(project.repo) ? (
                    <a
                      className="repo-link project-link"
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Check on GitHub
                    </a>
                  ) : (
                    <span
                      className={`repo-link project-link ${isRepoUnreleased(project.repo) ? "is-unreleased" : ""}`}
                    >
                      {project.repo}
                    </span>
                  )}
                  <p className="card-summary">
                    {project.description.split("\n").map((line, index) => (
                      <span key={`${project.name}-line-${index}`}>
                        {line}
                        {index < project.description.split("\n").length - 1 ? (
                          <br />
                        ) : null}
                      </span>
                    ))}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section reveal" id="others">
          <div className="section-header">
            <h2>Other Experience</h2>
            <p>Some interests and works</p>
          </div>
          <div
            className="carousel"
            style={{
              "--carousel-gap": `${carouselGap}px`,
              "--carousel-columns": carouselPerPage,
            }}
          >
            <div className="carousel-shell">
              {carouselPageCount > 1 ? (
                <button
                  className="carousel-button carousel-button-left"
                  onClick={() => moveCarouselBy(-1)}
                  disabled={carouselIndex === 0}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15.5 19 8.5 12l7-7" />
                  </svg>
                </button>
              ) : null}

              <div className="carousel-viewport" ref={carouselViewportRef}>
                <div className="carousel-track">
                  {carouselColumns.map((columnItems, columnIndex) => (
                    <div
                      key={`column-${columnIndex}`}
                      className={`other-column ${useTwoRows ? "is-two-rows" : "is-one-row"}`}
                    >
                      {columnItems.map((item, itemIndex) => (
                        <article
                          key={item.title}
                          className="photo-card photo-card-preview reveal-card"
                          role="button"
                          tabIndex={0}
                          style={{
                            "--card-delay": `${(columnIndex * (useTwoRows ? 2 : 1) + itemIndex) * 90}ms`,
                          }}
                          onClick={() => setExpandedOtherExperience(item)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setExpandedOtherExperience(item);
                            }
                          }}
                        >
                          <div className="photo-media">
                            <ProgressiveImage
                              className={`photo ${item.photoClass || ""}`}
                              aria-hidden="true"
                              src={item.image}
                              alt=""
                              imgClassName="photo-image"
                            />
                            {item.period ? (
                              <p className="photo-period-overlay">
                                {item.period}
                              </p>
                            ) : null}
                          </div>
                          <div className="photo-info">
                            <div className="photo-header">
                              <h3>
                                {item.title}
                                {item.subtitle ? (
                                  <span className="photo-subtitle">
                                    {item.subtitle}
                                  </span>
                                ) : null}
                              </h3>
                            </div>
                            <div
                              className="photo-expand-hint"
                              aria-hidden="true"
                            >
                              <span>more</span>
                              <svg viewBox="0 0 24 24">
                                <path d="M8 16 16 8" />
                                <path d="M10 8h6v6" />
                              </svg>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {carouselPageCount > 1 ? (
                <button
                  className="carousel-button carousel-button-right"
                  onClick={() => moveCarouselBy(1)}
                  disabled={carouselIndex === carouselMaxIndex}
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.5 5 15.5 12l-7 7" />
                  </svg>
                </button>
              ) : null}
            </div>

            {carouselPageCount > 1 ? (
              <div className="carousel-dots" role="tablist" aria-label="Slides">
                {Array.from({ length: carouselPageCount }).map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    className={`carousel-dot ${index === carouselIndex ? "is-active" : ""}`}
                    onClick={() => setCarouselIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === carouselIndex}
                    role="tab"
                    type="button"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      {expandedProject ? (
        <div
          className="project-modal-backdrop"
          onClick={() => setExpandedProject(null)}
        >
          <article
            className="info-card project-row-expanded"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="project-modal-close"
              onClick={() => setExpandedProject(null)}
              aria-label="Close project preview"
              type="button"
            >
              ×
            </button>
            <ProgressiveImage
              className="project-thumb project-thumb-expanded"
              src={expandedProject.image}
              alt={expandedProject.name}
              imgClassName="project-thumb-image"
              eager
              objectFit="contain"
            >
              {expandedProject.image ? (
                <div className="project-thumb-glow" aria-hidden="true" />
              ) : null}
            </ProgressiveImage>
            <div className="project-modal-content">
              <div className="project-head-expanded">
                <h3 className="project-title">{expandedProject.name}</h3>
                {expandedProject.role ? (
                  <p className="project-role project-role-expanded">
                    {expandedProject.role}
                  </p>
                ) : null}
                {Array.isArray(expandedProject.stack) &&
                expandedProject.stack.length ? (
                  <div className="project-stack project-stack-expanded">
                    {expandedProject.stack.map((item) => (
                      <span
                        className="project-chip"
                        key={`${expandedProject.name}-expanded-${item}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="project-links">
                  {Object.entries(getProjectLinks(expandedProject)).map(
                    ([key, value]) => renderProjectLink(key, value),
                  )}
                </div>
              </div>
              <p className="card-summary project-summary-expanded">
                {expandedProject.description.split("\n").map((line, index) => (
                  <span key={`${expandedProject.name}-line-${index}`}>
                    {line}
                    {index <
                    expandedProject.description.split("\n").length - 1 ? (
                      <br />
                    ) : null}
                  </span>
                ))}
              </p>
            </div>
          </article>
        </div>
      ) : null}

      {expandedOtherExperience ? (
        <div
          className="other-modal-backdrop"
          onClick={() => setExpandedOtherExperience(null)}
        >
          <article
            className="photo-card-expanded"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="other-modal-close"
              onClick={() => setExpandedOtherExperience(null)}
              aria-label="Close details"
              type="button"
            >
              ×
            </button>
            <div className="photo-media photo-media-expanded">
              <ProgressiveImage
                className={`photo photo-expanded ${expandedOtherExperience.photoClass || ""}`}
                aria-hidden="true"
                src={expandedOtherExperience.image}
                alt=""
                imgClassName="photo-image"
                eager
              />
              {expandedOtherExperience.period ? (
                <p className="photo-period-overlay">
                  {expandedOtherExperience.period}
                </p>
              ) : null}
              <h3 className="photo-title-overlay">
                {expandedOtherExperience.title}
                {expandedOtherExperience.subtitle ? (
                  <span className="photo-subtitle-overlay">
                    {expandedOtherExperience.subtitle}
                  </span>
                ) : null}
              </h3>
            </div>
            <div className="photo-info">
              {Array.isArray(expandedOtherExperience.caption) ? (
                <ul className="photo-caption-list">
                  {expandedOtherExperience.caption.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p>{expandedOtherExperience.caption}</p>
              )}
              {expandedOtherExperience.website ? (
                <a
                  className="photo-link"
                  href={expandedOtherExperience.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Official Site
                </a>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}

      <footer className="footer">
        <div className="footer-content">
          <h3 className="footer-heading">Let's Connect</h3>
          <div className="footer-icons">
            <a
              className="footer-icon-link"
              href={siteData.contacts.github}
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer"
            >
              <IconGithub />
            </a>
            <a
              className="footer-icon-link"
              href={siteData.contacts.linkedin}
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
            >
              <IconLinkedIn />
            </a>
            <a
              className="footer-icon-link"
              href={siteData.contacts.email}
              aria-label="Email"
            >
              <IconMail />
            </a>
          </div>
          <p>
            &copy; {new Date().getFullYear()} {siteData.name}. All rights
            reserved.
          </p>
        </div>
      </footer>

      <button
        className={`back-to-top ${showBackToTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}

export default App;
