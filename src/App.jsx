// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { siteData } from "./data";
import "./App.css";

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

function App() {
  const avatarStyle = siteData.avatarImage
    ? { backgroundImage: `url(${siteData.avatarImage})` }
    : undefined;
  const carouselViewportRef = useRef(null);
  const carouselGap = 20;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPerPage, setCarouselPerPage] = useState(3);

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
  const carouselMaxIndex = useMemo(() => {
    const max = otherExperiences.length - carouselPerPage;
    return max > 0 ? max : 0;
  }, [otherExperiences.length, carouselPerPage]);
  const carouselPageCount = useMemo(
    () => (otherExperiences.length ? carouselMaxIndex + 1 : 0),
    [otherExperiences.length, carouselMaxIndex]
  );

  useEffect(() => {
    if (carouselIndex > carouselMaxIndex) {
      setCarouselIndex(carouselMaxIndex);
    }
  }, [carouselIndex, carouselMaxIndex]);
  useEffect(() => {
    const viewport = carouselViewportRef.current;
    if (!viewport) return;
    const viewportWidth = viewport.clientWidth;
    const cardWidth =
      (viewportWidth - carouselGap * (carouselPerPage - 1)) / carouselPerPage;
    const step = cardWidth + carouselGap;
    viewport.scrollTo({ left: carouselIndex * step, behavior: "smooth" });
  }, [carouselIndex, carouselPerPage, carouselGap]);

  return (
    <div className="page">
      <header className="hero" id="home">
        <nav className="nav">
          <div className="brand">{siteData.name}</div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#projects">Selected Projects</a>
            <a href="#others">Other Experience</a>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-kicker">{siteData.location}</p>
            <h1>
              {siteData.name}
              <span className="hero-title">{siteData.title}</span>
            </h1>
            <p className="hero-tagline">{siteData.tagline}</p>

            <div className="contact-row">
              <a className="icon-link" href={siteData.contacts.github}>
                <IconGithub />
                <span>GitHub</span>
              </a>
              <a className="icon-link" href={siteData.contacts.linkedin}>
                <IconLinkedIn />
                <span>LinkedIn</span>
              </a>
              <a className="icon-link" href={siteData.contacts.email}>
                <IconMail />
                <span>Email</span>
              </a>
            </div>
          </div>

          <div
            className="hero-avatar"
            role="img"
            aria-label={siteData.avatarAlt}
            style={avatarStyle}
          >
            <div className="avatar-ring" />
            {!siteData.avatarImage && (
              <div className="avatar-initials">WL</div>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <section className="section" id="about">
          <div className="section-header">
            <h2>About Me</h2>
            {/* <p>個人簡介與目前狀態</p> */}
          </div>
          <div className="about-grid">
            <div className="about-card">
              <p className="about-text">{siteData.about.intro}</p>
              <p className="about-status">{siteData.about.status}</p>
              <div className="about-spacer" />
              <br></br>
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

        <section className="section" id="experience">
          <div className="section-header">
            <h2>Experience</h2>
            <p>Work history</p>
          </div>
          <div className="card-grid">
            {siteData.experience.map((item) => (
              <article key={`${item.role}-${item.company}`} className="info-card">
                <div className="card-top">
                  <h3>{item.role}</h3>
                  <span className="card-period">{item.period}</span>
                </div>
                <p className="card-company">{item.company}</p>
                <p className="card-summary">{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="projects">
          <div className="section-header">
            <h2>Selected Projects</h2>
            <p>Projects in Class</p>
          </div>
          <div className="card-grid">
            {siteData.projects.map((project) => (
              <article key={project.name} className="info-card project-card">
                <div className="card-top">
                  <h3>{project.name}</h3>
                  <a className="repo-link" href={project.repo}>
                    {project.repo.replace("https://", "")}
                  </a>
                </div>
                <p className="card-summary">{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="others">
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
            {otherExperiences.length > carouselPerPage && (
              <div className="carousel-controls">
                <button
                  className="carousel-button"
                  onClick={() =>
                    setCarouselIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={carouselIndex === 0}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15.5 19 8.5 12l7-7" />
                  </svg>
                </button>
                <button
                  className="carousel-button"
                  onClick={() =>
                    setCarouselIndex((prev) =>
                      Math.min(carouselMaxIndex, prev + 1)
                    )
                  }
                  disabled={carouselIndex === carouselMaxIndex}
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.5 5 15.5 12l-7 7" />
                  </svg>
                </button>
              </div>
            )}
            {carouselPageCount > 1 && (
              <div className="carousel-dots" role="tablist" aria-label="Slides">
                {Array.from({ length: carouselPageCount }).map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    className={`carousel-dot ${
                      index === carouselIndex ? "is-active" : ""
                    }`}
                    onClick={() => setCarouselIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === carouselIndex}
                    role="tab"
                    type="button"
                  />
                ))}
              </div>
            )}
            <div className="carousel-viewport" ref={carouselViewportRef}>
              <div className="carousel-track">
                {otherExperiences.map((item) => (
                  <article key={item.title} className="photo-card">
                    <div
                      className="photo"
                      aria-hidden="true"
                      style={
                        item.image
                          ? { backgroundImage: `url(${item.image})` }
                          : undefined
                      }
                    />
                    <div className="photo-info">
                      <h3>{item.title}</h3>
                      <p>{item.caption}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} {siteData.name}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
