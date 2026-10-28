// src/App.jsx
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSiteData, ui } from "./i18n.js";
import { usePrefs } from "./prefs.js";
import PrefsToggles from "./PrefsToggles.jsx";
import { useRefreshOnChange, useScrollMotion } from "./useScrollMotion.js";
import "./App.css";
import "./system.css";
import resumePdf from "./resume/resume.pdf";

const MOTION_EASE = [0.22, 1, 0.36, 1];

const LAB_ORDER = ["Lit", "Brewing", "Wandering"];
const BASE = import.meta.env.BASE_URL; // "/my-portfolio/"
const PAGE_PATH = { profile: BASE, work: `${BASE}work/` };
// One nav for both pages, so moving between them never changes the menu.
const NAV_ITEMS = [
  { id: "about", page: "profile" },
  { id: "experience", page: "profile" },
  { id: "projects", page: "profile" },
  { id: "lab", page: "work" },
];
// Every section on each page, for the scroll-spy (nav shows only the main four).
const PAGE_SECTIONS = {
  profile: ["home", "about", "education", "experience", "projects"],
  work: ["lab"],
};

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
  enter: (direction = 0) => ({
    opacity: reducedMotion ? 1 : 0.92,
    x: reducedMotion ? 0 : direction > 0 ? 12 : -12,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: reducedMotion ? 0 : 0.14, ease: "easeOut" },
  },
  exit: (direction = 0) => ({
    opacity: reducedMotion ? 1 : 0.92,
    x: reducedMotion ? 0 : direction > 0 ? -12 : 12,
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


// Left/right pager for a row of tiles: no scroll bar, the track glides one
// page at a time. Arrows disappear when every tile already fits.
function WorkCarousel({ label, children, prevLabel, nextLabel, reduceMotion }) {
  const items = React.Children.toArray(children);
  const total = items.length;
  const viewRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const touchX = useRef(null);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const perView = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
  const gap = width >= 700 ? 16 : 12;
  const cardW = width ? (width - gap * (perView - 1)) / perView : 0;
  const maxIndex = Math.max(0, total - perView);
  const at = Math.min(index, maxIndex);
  const go = (next) => setIndex(Math.max(0, Math.min(maxIndex, next)));
  const from = at + 1;
  const to = Math.min(total, at + perView);

  return (
    <div className="work-group">
      <div className="work-head">
        <p className="work-row-label">{label}</p>
        {maxIndex > 0 ? (
          <div className="work-pager">
            <span className="work-count" aria-live="polite">
              {from}–{to} / {total}
            </span>
            <button
              type="button"
              className="work-arrow"
              aria-label={prevLabel}
              disabled={at === 0}
              onClick={() => go(at - perView)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
            </button>
            <button
              type="button"
              className="work-arrow"
              aria-label={nextLabel}
              disabled={at >= maxIndex}
              onClick={() => go(at + perView)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          </div>
        ) : null}
      </div>
      <div
        className="work-view"
        ref={viewRef}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 48) go(at + (dx < 0 ? perView : -perView));
        }}
      >
        <div
          className="work-track"
          style={{
            gap,
            transform: `translateX(${-at * (cardW + gap)}px)`,
            transition: reduceMotion ? "none" : "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {items.map((child, i) => (
            <div
              className="work-slot"
              key={child.key ?? i}
              style={{ width: cardW || undefined }}
              aria-hidden={i < at || i >= at + perView ? "true" : undefined}
              inert={i < at || i >= at + perView ? "" : undefined}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const ProgressiveImage = ({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  eager = false,
  objectFit = "cover",
  objectPosition = "center",
  fallbackSrc,
  children,
  ...rest
}) => {
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(() => !src);
  const [failed, setFailed] = useState(false);
  const currentSrc = failed && fallbackSrc ? fallbackSrc : src;

  useEffect(() => {
    setFailed(false);
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
      {currentSrc ? (
        <img
          ref={imageRef}
          src={currentSrc}
          alt={alt}
          className={joinClasses("progressive-image-asset", imgClassName)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={eager ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            // External logos can disappear or block hotlinking; swap in the bundled copy once.
            if (fallbackSrc && !failed) {
              setFailed(true);
              return;
            }
            setIsLoaded(true);
          }}
          style={{ objectFit, objectPosition }}
        />
      ) : null}
      {children}
    </div>
  );
};

function App({ page = "profile" }) {
  const shouldReduceMotion = useReducedMotion();
  const { lang, theme, toggleLang, toggleTheme } = usePrefs();
  const siteData = getSiteData(lang);
  // Lit (live) first, then Casting (built, not live), then Decoding (ideas)
  const labItems = (siteData.lab?.items ?? []).filter((item) => !item.unlisted).sort(
    (a, b) => LAB_ORDER.indexOf(a.status) - LAB_ORDER.indexOf(b.status),
  );
  const t = ui[lang];
  const isWork = page === "work";
  const pageRef = useRef(null);
  useScrollMotion(pageRef, [page]);
  useRefreshOnChange(lang);

  // Switching language changes text length above the reader; keep whatever
  // card/section they were looking at pinned to the same spot on screen.
  const langAnchorRef = useRef(null);
  const handleToggleLang = () => {
    const probe = document.elementFromPoint(
      window.innerWidth / 2,
      Math.min(window.innerHeight * 0.4, 360),
    );
    // Inside a pinned section the element itself is fixed on screen, so its
    // position says nothing about scroll; anchor to the in-flow spacer instead.
    const anchor =
      probe?.closest?.(".pin-spacer") ||
      probe?.closest?.("article, section, header");
    langAnchorRef.current = anchor
      ? { el: anchor, top: anchor.getBoundingClientRect().top }
      : null;
    toggleLang();
  };
  useLayoutEffect(() => {
    const saved = langAnchorRef.current;
    if (!saved?.el?.isConnected) return;
    const drift = saved.el.getBoundingClientRect().top - saved.top;
    if (Math.abs(drift) > 1) window.scrollBy(0, drift);
    langAnchorRef.current = null;
  }, [lang]);
  const othersScrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState(
    isWork ? "lab" : "home",
  );
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedOtherExperience, setExpandedOtherExperience] = useState(null);
  const [otherExperienceDirection, setOtherExperienceDirection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const navItems = NAV_ITEMS;
  const pageSectionIds = PAGE_SECTIONS[page];
  const navHref = (item) =>
    item.page === page
      ? `#${item.id}`
      : `${PAGE_PATH[item.page]}${item.id === "home" ? "" : `#${item.id}`}`;
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
  // Hover/press feedback is deliberately small: colour + a 2px lift at most.
  const heroButtonHover = undefined;
  const iconHover = shouldReduceMotion
    ? undefined
    : { y: -2, transition: { duration: 0.2, ease: MOTION_EASE } };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Sections only exist after React renders, so the browser's native jump to
  // a URL hash (e.g. /my-portfolio/#lab from the Links page) finds nothing.
  useEffect(() => {
    const jumpToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: "start" });
    };
    // Fonts and ScrollTrigger pin spacers change the layout after first
    // paint, so re-aim a few times while the page settles — but stop as soon
    // as the reader scrolls on their own.
    let userMoved = false;
    const stopAiming = () => {
      userMoved = true;
    };
    const aim = () => {
      if (!userMoved) jumpToHash();
    };
    const timer = window.setTimeout(aim, 120);
    const settle = window.setTimeout(stopAiming, 2500);
    document.fonts?.ready.then(() => requestAnimationFrame(aim));
    ScrollTrigger.addEventListener("refresh", aim);
    window.addEventListener("load", aim);
    window.addEventListener("hashchange", jumpToHash);
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((type) =>
      window.addEventListener(type, stopAiming, { passive: true, once: true }),
    );
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(settle);
      ScrollTrigger.removeEventListener("refresh", aim);
      window.removeEventListener("load", aim);
      window.removeEventListener("hashchange", jumpToHash);
      ["wheel", "touchstart", "keydown", "pointerdown"].forEach((type) =>
        window.removeEventListener(type, stopAiming),
      );
    };
  }, []);

  const handleNavSelect = (item, closeMobileMenu = false) => {
    if (item.page !== page) {
      window.location.href = navHref(item);
      return;
    }
    if (closeMobileMenu) {
      setMobileMenuOpen(false);
      window.setTimeout(() => scrollToId(item.id), 180);
      return;
    }
    scrollToId(item.id);
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
          {label === "repo" ? t.unreleased : `${label}: ${href}`}
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
          {label === "repo" ? t.checkOnGithub : label}
        </a>
      );
    }
    return (
      <span className="project-meta-link" key={label}>
        {label}: {href}
      </span>
    );
  };

  const otherExperiences = siteData.otherExperiences || [];
  const expandedOtherExperienceIndex = otherExperiences.findIndex(
    (item) => item.title === expandedOtherExperience?.title,
  );
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

  // Lock page scroll behind an open modal so the wheel/touch stays inside it.
  const isModalOpen = Boolean(expandedOtherExperience || expandedProject);
  useEffect(() => {
    if (!isModalOpen) return undefined;
    // html, body both set overflow-x: hidden, so the window scrolls on <html>;
    // lock both elements.
    const root = document.documentElement;
    const previousRoot = root.style.overflow;
    const previousBody = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousRoot;
      document.body.style.overflow = previousBody;
    };
  }, [isModalOpen]);

  // Mobile menu: close on Escape, outside tap, or page scroll.
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const close = () => setMobileMenuOpen(false);
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event) => {
      if (!event.target.closest?.(".nav")) close();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", close);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const sections = pageSectionIds
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setTypedTitle(siteData.title);
  }, [siteData.title]);

  return (
    <div
      ref={pageRef}
      className={`page ${isWork ? "page-work" : "page-profile"}`}
    >
      <div className="scroll-progress" aria-hidden="true" />
      <nav className="nav" aria-label={t.navAria}>
        <motion.div
          className="brand"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: MOTION_EASE }}
        >
          <a href={PAGE_PATH.profile}>{siteData.name}</a>
        </motion.div>
        <div className="nav-end">
          <motion.button
            className={`hamburger ${mobileMenuOpen ? "is-open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t.menuToggle}
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
                key={item.id}
                href={navHref(item)}
                className={
                  item.page === page && activeSection === item.id
                    ? "is-active"
                    : ""
                }
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
                {t.nav[item.id]}
              </motion.a>
            ))}
          </div>
          <PrefsToggles
            lang={lang}
            theme={theme}
            onToggleLang={handleToggleLang}
            onToggleTheme={toggleTheme}
          />
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
                  key={item.id}
                  className={
                    item.page === page && activeSection === item.id
                      ? "is-active"
                      : ""
                  }
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
                  {t.nav[item.id]}
                </motion.button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>

      {!isWork ? (
        <header className="hero" id="home">
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
              <div className="hero-text-inner">
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
                    {t.viewWork}
                  </motion.button>
                  <motion.a
                    className="hero-cta hero-cta-secondary"
                    href={resumePdf}
                    download="Webber_Lai_Resume.pdf"
                    whileHover={heroButtonHover}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  >
                    {t.downloadResume}
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
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
              </div>
            </motion.div>

            <motion.div className="hero-visual" variants={heroItemVariants}>
              <div className="hero-visual-inner">
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
            </motion.div>
          </motion.div>
        </header>
      ) : (
        <header className="work-hero" id="projects-top">
          <motion.div
            className="work-hero-inner"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: MOTION_EASE }}
          >
            <p className="work-kicker">{t.work.kicker}</p>
            <h1 className="work-hero-title">{t.work.title}</h1>
            <p className="work-hero-intro">{t.work.intro}</p>
          </motion.div>
        </header>
      )}

      <main className="main">
        {!isWork ? (
          <>
            <motion.section
              className="section about-section"
              id="about"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionVariants}
            >
              <div className="section-header about-header">
                <h2>{t.sections.about}</h2>
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
                  {siteData.about.status ? (
                    <p className="about-status">{siteData.about.status}</p>
                  ) : null}
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
                  <h2>{t.sections.education}</h2>
                </div>
                <div
                  className={`education-layout ${siteData.educationImage ? "has-photo" : ""}`}
                >
                <div className="education-block education-standalone">
                  <div className="education-timeline">
                    {siteData.education.map((item, eduIndex) => (
                      <div
                        key={`edu-${eduIndex}`}
                        className="education-timeline-item"
                      >
                        <div className="education-timeline-marker" />
                        <div className="education-timeline-content">
                          <div className="education-header-row">
                            <p className="education-degree">{item.school}</p>
                            <p className="education-period">{item.period}</p>
                          </div>
                          <p className="education-meta">{item.degree}</p>
                          {item.note ? (
                            <p className="education-note">
                              {item.note.split("\n").map((line, index) => (
                                <span key={`edu-${eduIndex}-note-${index}`}>
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
                {siteData.educationImage ? (
                  <figure className="education-photo">
                    <img
                      src={siteData.educationImage}
                      alt={t.educationPhotoAlt}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                ) : null}
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
                  <h2>{t.sections.experience}</h2>
                </div>
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
                  {t.downloadMyResume}
                </a>
              </p>
              <div className="experience-list">
                {siteData.experience.map((item, index) => (
                  <motion.article
                    key={`exp-${index}`}
                    className="info-card experience-card"
                    style={
                      item.brand
                        ? {
                            "--brand": item.brand,
                            ...(item.backdrop
                              ? { "--card-photo": `url("${item.backdrop}")` }
                              : {}),
                          }
                        : undefined
                    }
                    data-photo={item.backdrop ? "" : undefined}
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
                            fallbackSrc={item.logoFallback}
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
          </>
        ) : null}

        {isWork ? (
          <>
            {labItems.length ? (
              <motion.section
                className="section"
                id="lab"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.16 }}
                variants={sectionVariants}
              >
                <div className="lab-grid">
                  {labItems.map((item, index) => (
                    <motion.article
                      key={`lab-${index}`}
                      className="info-card lab-card"
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                              y: -6,
                              transition: { duration: 0.45, ease: MOTION_EASE },
                            }
                      }
                    >
                      <div className="lab-card-top">
                        <span
                          className={`lab-status ${item.status === "Lit" ? "is-live" : ""}`}
                        >
                          {t.labStatus[item.status] ?? item.status}
                        </span>
                      </div>
                      <h3 className="lab-title">{item.name}</h3>
                      <dl className="lab-detail">
                        <dt>{t.lab.problem}</dt>
                        <dd>{item.problem}</dd>
                        <dt>{t.lab.approach}</dt>
                        <dd>{item.approach}</dd>
                      </dl>
                      <div className="project-stack lab-stack">
                        {item.stack.map((tag) => (
                          <span
                            className="project-chip"
                            key={`lab-${index}-${tag}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {item.link ? (
                        <a
                          className="repo-link project-link"
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t.lab.tryIt}
                        </a>
                      ) : null}
                    </motion.article>
                  ))}
                </div>
              </motion.section>
            ) : null}
          </>
        ) : null}

        {!isWork ? (
          <section className="section" id="projects">
            <div className="works-wrap">
              <div className="section-header">
                <h2>{t.sections.projects}</h2>
              </div>
              <div className="work-rows" ref={othersScrollRef}>
                {labItems.length ? (
                  <WorkCarousel
                    label={t.rows.lab}
                    prevLabel={t.prev}
                    nextLabel={t.next}
                    reduceMotion={shouldReduceMotion}
                  >
                    {labItems.map((item, index) => (
                      <motion.a
                        key={`lab-thumb-${index}`}
                        className="photo-card photo-card-preview work-tile lab-thumb"
                        href={item.link || PAGE_PATH.work}
                        draggable={false}
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : { y: -4, transition: { duration: 0.4, ease: MOTION_EASE } }
                        }
                      >
                        <div className="photo-media">
                          {item.thumb ? (
                            <ProgressiveImage
                              className="photo work-thumb"
                              aria-hidden="true"
                              src={item.thumb}
                              alt=""
                              imgClassName="photo-image"
                            />
                          ) : (
                            <div
                              className={`photo lab-art lab-art-${item.art || "spark"}`}
                              aria-hidden="true"
                            >
                              <span>{item.glyph}</span>
                            </div>
                          )}
                        </div>
                        <div className="tile-info">
                          <h3 className="tile-title">{item.name}</h3>
                          <p className="tile-sub">
                            <span
                              className={`lab-status lab-status-mini ${item.status === "Lit" ? "is-live" : ""}`}
                            >
                              {t.labStatus[item.status] ?? item.status}
                            </span>
                          </p>
                        </div>
                      </motion.a>
                    ))}
                  </WorkCarousel>
                ) : null}
                <WorkCarousel
                  label={t.rows.projects}
                  prevLabel={t.prev}
                  nextLabel={t.next}
                  reduceMotion={shouldReduceMotion}
                >
                  {siteData.projects.map((project, index) => (
                    <motion.article
                      key={`work-${index}`}
                      className="photo-card photo-card-preview work-tile work-card"
                      role="button"
                      tabIndex={0}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : { y: -4, transition: { duration: 0.4, ease: MOTION_EASE } }
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
                      <div className="photo-media">
                        <ProgressiveImage
                          className="photo work-thumb"
                          aria-hidden="true"
                          src={project.image}
                          alt=""
                          imgClassName="photo-image"
                          objectFit="contain"
                        />
                      </div>
                      <div className="tile-info">
                        <h3 className="tile-title">{project.name}</h3>
                        <p className="tile-sub">{project.role}</p>
                      </div>
                    </motion.article>
                  ))}
                </WorkCarousel>
                <WorkCarousel
                  label={t.rows.activities}
                  prevLabel={t.prev}
                  nextLabel={t.next}
                  reduceMotion={shouldReduceMotion}
                >
                  {otherExperiences.map((item, index) => (
                    <motion.article
                      key={`other-${index}`}
                      className="photo-card photo-card-preview work-tile"
                      role="button"
                      tabIndex={0}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : { y: -4, transition: { duration: 0.4, ease: MOTION_EASE } }
                      }
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
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
                          <p className="photo-period-overlay">{item.period}</p>
                        ) : null}
                      </div>
                      <div className="tile-info">
                        <h3 className="tile-title">{item.title}</h3>
                        <p className="tile-sub">{item.subtitle}</p>
                      </div>
                    </motion.article>
                  ))}
                </WorkCarousel>
              </div>
            </div>
          </section>
        ) : null}
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
                aria-label={t.closeProject}
                type="button"
              >
                ×
              </button>
              <ProgressiveImage
                className={`project-thumb project-thumb-expanded ${expandedProject.poster ? "is-poster" : ""}`}
                src={expandedProject.poster || expandedProject.image}
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
                    {expandedProject.poster ? (
                      <a
                        className="project-meta-link"
                        href={expandedProject.poster}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.viewPoster}
                      </a>
                    ) : null}
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
                    aria-label={t.prevExperience}
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
                    aria-label={t.nextExperience}
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
                  aria-label={t.closeDetails}
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
                          {t.relatedSite}
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
          <h3 className="footer-heading">{t.letsConnect}</h3>
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
            &copy; {new Date().getFullYear()} {siteData.name}. {t.rights}
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {showBackToTop && !mobileMenuOpen ? (
          <motion.button
            className="back-to-top is-visible"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t.backToTop}
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
                    y: -2,
                    transition: { duration: 0.2, ease: MOTION_EASE },
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
