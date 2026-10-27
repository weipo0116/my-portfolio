// src/data.js
import selfImage from "./assets/opt/self.webp";
import selfImage2 from "./assets/opt/mit_me.webp";
import samplePhoto from "./assets/opt/raccoon.webp";
import thesisTeaser from "./assets/opt/thesis_teaser.webp";
import vangoph_teaser from "./assets/opt/vangoph_teaser.webp";
import HCI_teaser from "./assets/opt/hci_teaser.webp";
import ds_poster from "./assets/opt/ds_poster.webp";
import PR_img from "./assets/opt/pr_img.webp";
import chros_img from "./assets/opt/chorus.webp";
import pg_img from "./assets/opt/pg.webp";
import nccu_img from "./assets/opt/nccu.webp";
import firstbankLogo from "./assets/firstbank_logo.svg";
import lineLogoLocal from "./assets/opt/line_icon.webp";
import aatLogoLocal from "./assets/opt/aat_icon.webp";

export const siteData = {
  name: "Webber Lai",
  title: "AI Management Associate",
  tagline:
    "It's easy to be different, but difficult to be better. \n 無法想像的畫面，就無法靠魔力實現 -《葬送的芙莉蓮》",
  location: "Taipei, Taiwan",
  avatarAlt: "Webber Lai portrait",
  avatarImage: selfImage,
  aboutImage: selfImage2,
  heroHighlights: [
    "AI Management Associate, Digital Banking Division @ First Bank.",
    "M.S. CS @ NCCU — Computer Graphics & Data Visualization.",
    "Built interactive visual/data experiences (React, D3.js, Power BI) end‑to‑end.",
  ],
  contacts: {
    github: "https://github.com/weipo0116",
    linkedin: "https://www.linkedin.com/in/weipo-lai-webber/",
    // Assembled at runtime so the plain address isn't sitting in the source for scrapers.
    email: `mailto:${["weipo900116", "gmail.com"].join(String.fromCharCode(64))}`,
  },
  about: {
    intro:
      "Hi, I'm Webber Lai. I completed my M.S. in Computer Science at NCCU (Jan 2026), and joined First Bank as an AI Management Associate in the Digital Banking Division in Aug 2026.",
  },
  skills: [
    "Python",
    "JavaScript",
    "R",
    "React",
    "D3.js",
    "Flask API",
    "Figma",
    "Docker",
    "Power BI",
  ],
  education: [
    {
      degree: "M.S. in Computer Science",
      school: "National Chengchi University (NCCU)",
      period: "Sep 2023 - Jan 2026",
      note: "Thesis: Interactive semantic segmentation for large-scale aerial Gaussian splatting.\n Advisor: Ming-Te Chi.",
    },
    {
      degree: "B.S. in Big Data Management (Data Science)",
      school: "Soochow University (SCU)",
      period: "Sep 2019 - Jun 2023",
      note: "",
    },
    {
      degree: "Exchange Program, School of Data Science",
      school: "Fudan University",
      period: "Sep 2021 - Jan 2022",
      note: "",
    },
  ],
  experience: [
    {
      role: "AI Management Associate | Digital Banking Division",
      company: "First Commercial Bank (First Bank)",
      logo: firstbankLogo,
      period: "Aug 2026 - Present",
      summary: [
        "Joined the AI Management Associate program on Aug 10, 2026, rotating within the Digital Banking Division.",
        "Building a monthly Power BI report on fraud-alert (警示) accounts, with Python preprocessing, so management can track trends and quickly pinpoint where increases come from.",
        "Benchmarked digital account-opening journeys across multiple Taiwanese banks — UI flow, identity verification, and document resubmission — and presented key findings to leadership in Figma.",
        "Turned customer-journey observations into concrete recommendations to reduce onboarding drop-off.",
      ],
    },
    {
      role: "Business Development Intern | Social Content BD Team",
      company: "LINE Taiwan Limited",
      logo: "https://vos.line-scdn.net/landpress-content-v2-tqq6mwxs5qlx5cg0nutma2bg/1c7f9ad5a0d2415cab739ae6e9f71e35-large.png?updatedAt=1752734110000",
      logoFallback: lineLogoLocal,
      period: "Oct 2022 - Aug 2023",
      summary: [
        "Supported business development and performance growth for social content; owned monthly performance and overall traffic reporting, turning data into actionable insights for management.",
        "Increased LINE VOOM first-screen VTR by approximately 100% through content and placement optimization.",
        "Tracked performance and execution across 5+ major BD initiatives, including UBA, The Rappers 2, P. LEAGUE+, MAMA, and the LINE VOOM Creators Contest.",
        "Consolidated multiple reports with the data team into a centralized dashboard, saving approximately 1 hour of manual work per day.",
        "Evaluated creator proposals and provided tailored performance recommendations for 10+ partner creators.",
      ],
    },
    {
      role: "Data Science Consulting Intern",
      company: "Advant Analytics Tactics Ltd., AAT",
      logo: "https://system.netsuite.com/core/media/media.nl?id=14523301&c=835472&h=IG4EQfcTtnBchNGzUxALv1tVswtgqcyE8vTxEwOoFw9ekkQs",
      logoFallback: aatLogoLocal,
      period: "Apr 2022 - Sep 2022",
      summary: [
        "Researched and documented front-end development workflows in KNIME, covering HTML, CSS, JavaScript, Bootstrap, and reusable web nodes.",
        "Tested interactive web capabilities in KNIME, including jQuery UI, DataTables, carousel, and lightbox integrations.",
        "Built dashboard-style web templates and workflows for finance and semiconductor use cases, turning data outputs into interactive visual presentations.",
        "Created internal reference materials and demos to help streamline future KNIME web development and experimentation.",
      ],
    },
  ],
  otherExperiences: [
    {
      title: "NCCU Dormitory Resident Assistant (RA)",
      photoClass: "photo-nccu",
      expandIcon: "more-circle",
      caption: [
        "Handled night shifts for daily dormitory operations, including key desk support, visitor check-in, and parcel processing.",
        "Performed routine facility checks for water heaters, electricity usage, and shared-space equipment.",
        "Supported residents with issue clarification and coordinated with related units for follow-up actions.",
      ],
      period: "2024/06 - 2025/03",
      image: nccu_img,
    },
    {
      title: "Pacific Graphics Conference",
      subtitle: "Technical Team Lead",
      expandIcon: "more-circle",
      website: "https://pg2025.nccu.edu.tw/",
      caption: [
        "Led the online livestream for hybrid sessions, connecting on-site and remote speakers/audience through Microsoft Teams.",
        "Handled pre-event preparation, including organizing speaker participation modes and collecting presentation files.",
        "Oversaw on-site equipment operations and staff allocation to keep sessions and transitions running smoothly.",
      ],
      period: "2025/10/14 - 17",
      image: pg_img,
    },
    {
      title: "NCCU Chen Sheng Chorus",
      subtitle: "Tenor",
      expandIcon: "more-circle",
      caption: [
        "Participated as a tenor during master's studies at NCCU.",
        "Performed in a public concert at Eslite Performance Hall (誠品廳).",
      ],
      period: "2024 - 2025",
      image: chros_img,
    },
    {
      title: "Portfolio Website",
      subtitle: "(this page)",
      photoClass: "photo-portfolio",
      expandIcon: "more-circle",
      website: "https://weipo0116.github.io/my-portfolio/",
      caption: [
        "Built an interactive one-page portfolio with custom section navigation.",
        "Implemented responsive layout, carousel interactions, and data-driven content rendering.",
      ],
      image: samplePhoto,
    },
  ],
  lab: {
    intro:
      "Small AI tools I build for my own workflow — from systems I use every day to early experiments.",
    items: [
      {
        name: "SI — AI Project Workspace",
        status: "Cooking",
        problem:
          "Ideas pile up faster than I can act on them, and switching between AI tools loses context.",
        approach:
          "A Notion idea inbox that AI turns into tasks, works on, and reports back with a 3-line summary. Each task is routed to cloud AI, a local browser, or a local coding agent.",
        stack: ["Claude", "Notion", "Agent workflow"],
      },
      {
        name: "Screen Recording → Step Extractor",
        status: "Exploring",
        problem:
          "Comparing app flows from screen recordings means scrubbing video by hand.",
        approach:
          "Detect key frames and turn a recording into an ordered list of annotated steps — designed to run fully on-device.",
        stack: ["Python", "Computer vision", "Local-first"],
      },
      {
        name: "Resume & Portfolio Sync",
        status: "Exploring",
        problem:
          "Updating my resume and this site separately keeps them drifting apart.",
        approach:
          "One source of truth that regenerates both the PDF resume and the site content.",
        stack: ["Markdown", "React", "Automation"],
      },
      {
        name: "Astra Dies — Daily Astrology",
        status: "Cooking",
        problem:
          "Daily horoscopes are vague; I wanted planet positions I can verify, explained in plain language.",
        approach:
          "Computes real planetary longitudes, aspects and moon phase in the browser, then renders a Roman armillary-style chart with a short reading.",
        stack: ["astronomy-engine", "SVG", "Motion"],
        link: `${import.meta.env.BASE_URL}lab/astro/`,
      },
      {
        name: "Cinq Éléments — Five-Element Outfit",
        status: "Cooking",
        problem:
          "Deciding what to wear means juggling weather, occasion and colour with no fixed logic.",
        approach:
          "Derives the day's Five Element from the lunar calendar, reads Taipei weather, and builds three bold, runway-style looks per occasion.",
        stack: ["lunar-javascript", "Open-Meteo", "Editorial design"],
        link: `${import.meta.env.BASE_URL}lab/outfit/`,
      },
    ],
  },
  projects: [
    {
      name: "Interactive Semantic Segmentation for Large-Scale Aerial 3D Gaussian Splatting",
      description:
        "Post-hoc semantic 3DGS editing for large-scale aerial scenes without retraining. Enables interactive labeling and open-vocabulary queries with real-time rendering.",
      role: "Research (thesis)",
      stack: ["3D Gaussian Splatting", "SAM", "CLIP", "DearPy GUI"],
      links: {
        repo: "Unreleased",
      },
      repo: "Unreleased",
      image: thesisTeaser,
    },
    {
      name: "VanGoph Visualization",
      description:
        "An interactive visualization project on Vincent van Gogh artworks that uses image feature dimensionality reduction to cluster paintings and help users discover visually similar works.",
      role: "Full-stack (data processing + interactive visualization)",
      stack: ["D3.js", "Flask", "Dimensionality reduction"],
      links: {
        repo: "https://github.com/weipo0116/VanGoph_Visualization",
      },
      repo: "https://github.com/weipo0116/VanGoph_Visualization",
      image: vangoph_teaser,
    },
    {
      name: "DS Prediction of Ecommerce Transaction Fraud",
      description:
        "Machine learning project for ecommerce fraud detection, using customer and transaction data to flag high-risk activities.",
      role: "Data science (modeling + evaluation)",
      stack: ["Python", "Machine learning"],
      links: {
        repo: "https://github.com/112-2-dataScience/finalproject-group6",
      },
      repo: "https://github.com/112-2-dataScience/finalproject-group6",
      image: ds_poster,
    },
    {
      name: "PR Garbage Detection",
      description:
        "Computer vision project for garbage detection, with trained models, evaluation, and a ready-to-use inference pipeline.",
      role: "Computer vision (finetuning + evaluation)",
      stack: ["Python", "Computer vision", "PR"],
      links: {
        repo: "https://github.com/weipo0116/PR_Garbage-Detection",
      },
      repo: "https://github.com/weipo0116/PR_Garbage-Detection",
      image: PR_img,
    },
    {
      name: "HCI Webgazer Shop",
      description:
        "An HCI-focused web shopping experience using gaze interaction concepts to explore attention-aware interface design.",
      role: "Backend / HCI prototyping",
      stack: ["WebGazer.js", "Web interaction", "HCI"],
      links: {
        repo: "https://github.com/weipo0116/HCI_Webgazer_shop",
      },
      repo: "https://github.com/weipo0116/HCI_Webgazer_shop",
      image: HCI_teaser,
    },
  ],
};
