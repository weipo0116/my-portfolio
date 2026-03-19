// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { siteData } from "./data";
import "./App.css";
import resumePdf from "./resume/resume.pdf";

const MOTION_EASE = [0.22, 1, 0.36, 1];

const createFadeUpVariants = (reducedMotion, distance = 32) => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: MOTION_EASE },
  },
});

const createCardVariants = (reducedMotion) => ({
  hidden: {
    opacity: 0,
    y: reducedMotion ? 0 : 24,
    scale: reducedMotion ? 1 : 0.985,
  },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.56,
      ease: MOTION_EASE,
      delay: reducedMotion ? 0 : index * 0.08,
    },
  }),
});

const createNavVariants = (reducedMotion) => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : -18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: MOTION_EASE,
      delay: reducedMotion ? 0 : 0.12 + index * 0.05,
    },
  }),
});

const createModalBackdropVariants = () => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
});

const createModalPanelVariants = (reducedMotion) => ({
  hidden: {
    opacity: 0,
    y: reducedMotion ? 0 : 28,
    scale: reducedMotion ? 1 : 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.34, ease: MOTION_EASE },
  },
  exit: {
    opacity: 0,
    y: reducedMotion ? 0 : 18,
    scale: reducedMotion ? 1 : 0.98,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
});

const createContentSwapVariants = (reducedMotion) => ({
  enter: () => ({
    opacity: reducedMotion ? 1 : 0.92,
  }),
  center: {
    opacity: 1,
    transition: { duration: reducedMotion ? 0 : 0.14, ease: "easeOut" },
  },
  exit: () => ({
    opacity: reducedMotion ? 1 : 0.92,
    transition: { duration: reducedMotion ? 0 : 0.1, ease: "easeIn" },
  }),
});

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
          fetchpriority={eager ? "high" : "auto"}
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
  const shouldReduceMotion = useReducedMotion();
  const carouselViewportRef = useRef(null);
  const carouselGap = 20;
  const [activeSection, setActiveSection] = useState("home");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPerPage, setCarouselPerPage] = useState(3);
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedOtherExperience, setExpandedOtherExperience] = useState(null);
  const [otherExperienceDirection, setOtherExperienceDirection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const navItems = [
    "home",
    "about",
    "education",
    "experience",
    "projects",
    "others",
  ];
  const isRepoLink = (value) => value?.startsWith("http");
  const isRepoUnreleased = (value) =>
    value?.trim().toLowerCase() === "unreleased";
  const projectHighlights = siteData.heroHighlights || [];
  const heroContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.12, delayChildren: 0.06 },
    },
  };
  const heroItemVariants = createFadeUpVariants(shouldReduceMotion, 30);
  const sectionVariants = createFadeUpVariants(shouldReduceMotion, 34);
  const cardVariants = createCardVariants(shouldReduceMotion);
  const navItemVariants = createNavVariants(shouldReduceMotion);
  const modalBackdropVariants = createModalBackdropVariants();
  const modalPanelVariants = createModalPanelVariants(shouldReduceMotion);
  const otherExperienceSwapVariants =
    createContentSwapVariants(shouldReduceMotion);
  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      y: shouldReduceMotion ? 0 : -10,
    },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            duration: 0.34,
            ease: MOTION_EASE,
            staggerChildren: 0.05,
            delayChildren: 0.04,
          },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: shouldReduceMotion ? 0 : -8,
      transition: { duration: 0.22, ease: "easeInOut" },
    },
  };
  const mobileMenuItemVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -16 },
    visible: (index = 0) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.28,
        ease: MOTION_EASE,
        delay: shouldReduceMotion ? 0 : index * 0.035,
      },
    }),
  };
  const heroBadgeFloat = shouldReduceMotion
    ? {}
    : {
        y: [0, -14, 0, 10, 0],
        rotate: [0, -1.6, 0, 1.6, 0],
        scale: [1, 1.016, 1, 0.996, 1],
        transition: {
          duration: 8.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
      };
  const heroButtonHover = shouldReduceMotion
    ? undefined
    : {
        y: -5,
        scale: 1.04,
        boxShadow: "0 18px 38px rgba(76, 111, 255, 0.28)",
        transition: { duration: 0.22, ease: MOTION_EASE },
      };
  const iconHover = shouldReduceMotion
    ? undefined
    : {
        y: -5,
        scale: 1.08,
        rotate: -4,
        transition: { duration: 0.2, ease: MOTION_EASE },
      };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavSelect = (id, closeMobileMenu = false) => {
    if (closeMobileMenu) {
      setMobileMenuOpen(false);
      window.setTimeout(() => scrollToId(id), 180);
      return;
    }
    scrollToId(id);
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
  const expandedOtherExperienceIndex = otherExperiences.findIndex(
    (item) => item.title === expandedOtherExperience?.title,
  );
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

  const moveOtherExperienceBy = (delta) => {
    if (!otherExperiences.length || expandedOtherExperienceIndex < 0) return;
    const nextIndex = expandedOtherExperienceIndex + delta;
    if (nextIndex < 0 || nextIndex >= otherExperiences.length) return;
    setOtherExperienceDirection(delta);
    setExpandedOtherExperience(otherExperiences[nextIndex]);
  };

  useEffect(() => {
    if (!expandedOtherExperience && !expandedProject) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setExpandedOtherExperience(null);
        setExpandedProject(null);
        return;
      }
      if (expandedOtherExperience && event.key === "ArrowLeft") {
        moveOtherExperienceBy(-1);
      }
      if (expandedOtherExperience && event.key === "ArrowRight") {
        moveOtherExperienceBy(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedOtherExperience, expandedProject, expandedOtherExperienceIndex]);

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

    const updateActiveSection = () => {
      const marker = window.innerHeight * 0.32;
      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= marker && rect.bottom >= marker;
      });

      if (current) {
        setActiveSection(current.id);
        return;
      }

      const fallback = sections
        .map((section) => ({
          id: section.id,
          distance: Math.abs(section.getBoundingClientRect().top - marker),
        }))
        .sort((a, b) => a.distance - b.distance)[0];

      if (fallback) {
        setActiveSection(fallback.id);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setTypedTitle(siteData.title);
  }, []);

  return (
    <div className="page">
      <header className="hero" id="home">
        <nav className="nav">
          <motion.div
            className="brand"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: MOTION_EASE }}
          >
            {siteData.name}
          </motion.div>
          <motion.button
            className={`hamburger ${mobileMenuOpen ? "is-open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            type="button"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: MOTION_EASE, delay: 0.1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          >
            <span />
            <span />
            <span />
          </motion.button>
          <div className="nav-links nav-links-desktop">
            {navItems.map((item, index) => (
              <motion.a
                key={item}
                href={`#${item}`}
                className={activeSection === item ? "is-active" : ""}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavSelect(item);
                }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -2, scale: 1.04, transition: { duration: 0.18 } }
                }
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </motion.a>
            ))}
          </div>
          <AnimatePresence>
            {mobileMenuOpen ? (
              <motion.div
                className="nav-links nav-links-mobile is-open"
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {navItems.map((item, index) => (
                  <motion.button
                    key={item}
                    className={activeSection === item ? "is-active" : ""}
                    onClick={() => {
                      handleNavSelect(item, true);
                    }}
                    custom={index}
                    variants={mobileMenuItemVariants}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { x: 6, transition: { duration: 0.16 } }
                    }
                    type="button"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </motion.button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </nav>

        <motion.div
          className="hero-content"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="hero-kicker hero-kicker-mobile"
            variants={heroItemVariants}
          >
            {siteData.location}
          </motion.p>
          <motion.div className="hero-text" variants={heroItemVariants}>
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
              <motion.button
                className="hero-cta hero-cta-primary"
                type="button"
                onClick={() => scrollToId("projects")}
                whileHover={heroButtonHover}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              >
                View Projects
              </motion.button>
              <motion.a
                className="hero-cta hero-cta-secondary"
                href={resumePdf}
                download="Webber_Lai_Resume.pdf"
                whileHover={heroButtonHover}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Download résumé
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </motion.a>
            </div>

            <div className="contact-row">
              <motion.a
                className="icon-link"
                href={siteData.contacts.github}
                aria-label="GitHub"
                target="_blank"
                rel="noreferrer"
                whileHover={iconHover}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              >
                <IconGithub />
              </motion.a>
              <motion.a
                className="icon-link"
                href={siteData.contacts.linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
                whileHover={iconHover}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              >
                <IconLinkedIn />
              </motion.a>
              <motion.a
                className="icon-link"
                href={siteData.contacts.email}
                aria-label="Email"
                whileHover={iconHover}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              >
                <IconMail />
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={heroItemVariants} animate={heroBadgeFloat}>
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
          </motion.div>
        </motion.div>
      </header>

      <main className="main">
        <motion.section
          className="section about-section"
          id="about"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
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
        </motion.section>

        {siteData.education?.length ? (
          <motion.section
            className="section education-section"
            id="education"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
          >
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
          </motion.section>
        ) : null}

        <motion.section
          className="section"
          id="experience"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.16 }}
          variants={sectionVariants}
        >
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
              <motion.article
                key={`${item.role}-${item.company}`}
                className="info-card experience-card"
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
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
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="section"
          id="projects"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.16 }}
          variants={sectionVariants}
        >
          <div className="section-header">
            <h2>Selected Projects</h2>
            <p>Projects in Class</p>
          </div>
          <div className="project-list">
            {siteData.projects.map((project, index) => (
              <motion.article
                key={project.name}
                className="info-card project-row project-row-preview"
                role="button"
                tabIndex={0}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -10,
                        scale: 1.018,
                        rotateX: -4,
                        rotateY: 2,
                        transition: { duration: 0.24, ease: MOTION_EASE },
                      }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
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
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="section"
          id="others"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.16 }}
          variants={sectionVariants}
        >
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
                        <motion.article
                          key={item.title}
                          className="photo-card photo-card-preview"
                          role="button"
                          tabIndex={0}
                          custom={
                            columnIndex * (useTwoRows ? 2 : 1) + itemIndex
                          }
                          variants={cardVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.2 }}
                          whileHover={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  y: -10,
                                  transition: {
                                    duration: 0.24,
                                    ease: MOTION_EASE,
                                  },
                                }
                          }
                          whileTap={
                            shouldReduceMotion ? undefined : { scale: 0.995 }
                          }
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
                        </motion.article>
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
        </motion.section>
      </main>

      <AnimatePresence>
        {expandedProject ? (
          <motion.div
            className="project-modal-backdrop"
            onClick={() => setExpandedProject(null)}
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.article
              className="info-card project-row-expanded"
              onClick={(event) => event.stopPropagation()}
              variants={modalPanelVariants}
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
                  {expandedProject.description
                    .split("\n")
                    .map((line, index) => (
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
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {expandedOtherExperience ? (
          <motion.div
            className="other-modal-backdrop"
            onClick={() => setExpandedOtherExperience(null)}
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="other-modal-shell"
              onClick={(event) => event.stopPropagation()}
            >
              {otherExperiences.length > 1 ? (
                <>
                  <button
                    className="other-modal-nav other-modal-nav-left"
                    onClick={() => moveOtherExperienceBy(-1)}
                    aria-label="Previous experience"
                    type="button"
                    disabled={expandedOtherExperienceIndex <= 0}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15.5 19 8.5 12l7-7" />
                    </svg>
                  </button>
                  <button
                    className="other-modal-nav other-modal-nav-right"
                    onClick={() => moveOtherExperienceBy(1)}
                    aria-label="Next experience"
                    type="button"
                    disabled={
                      expandedOtherExperienceIndex >=
                      otherExperiences.length - 1
                    }
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.5 5 15.5 12l-7 7" />
                    </svg>
                  </button>
                </>
              ) : null}
              <motion.article
                className="photo-card-expanded"
                variants={modalPanelVariants}
              >
                <button
                  className="other-modal-close"
                  onClick={() => setExpandedOtherExperience(null)}
                  aria-label="Close details"
                  type="button"
                >
                  ×
                </button>
                <AnimatePresence
                  custom={otherExperienceDirection}
                  mode="wait"
                  initial={false}
                >
                  <motion.div
                    key={expandedOtherExperience.title}
                    className="other-modal-stage"
                    custom={otherExperienceDirection}
                    variants={otherExperienceSwapVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div className="photo-media photo-media-expanded">
                      <ProgressiveImage
                        className={`photo photo-expanded ${expandedOtherExperience.photoClass || ""}`}
                        aria-hidden="true"
                        src={expandedOtherExperience.image}
                        alt=""
                        imgClassName="photo-image"
                        eager
                      />
                      {otherExperiences.length > 1 ? (
                        <p className="other-modal-progress">
                          {expandedOtherExperienceIndex + 1} /{" "}
                          {otherExperiences.length}
                        </p>
                      ) : null}
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
                          Related Site
                        </a>
                      ) : null}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.article>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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

      <AnimatePresence>
        {showBackToTop ? (
          <motion.button
            className="back-to-top is-visible"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            type="button"
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 14,
              scale: shouldReduceMotion ? 1 : 0.92,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 10,
              scale: shouldReduceMotion ? 1 : 0.96,
            }}
            transition={{ duration: 0.24, ease: MOTION_EASE }}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    y: -6,
                    scale: 1.08,
                    rotate: -6,
                    transition: { duration: 0.18 },
                  }
            }
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default App;
