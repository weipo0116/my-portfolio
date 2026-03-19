// src/data.js
import selfImage from "./assets/self.jpg";
import selfImage2 from "./assets/MIT_me.jpg";
import samplePhoto from "./assets/raccoon.png";
import thesisTeaser from "./assets/project_img/thesis_teaser.png";
import vangoph_teaser from "./assets/project_img/vangoph_teaser.png";
import HCI_teaser from "./assets/project_img/HCI_teaser.png";
import ds_poster from "./assets/project_img/ds_poster.png";
import PR_img from "./assets/project_img/PR_img.png";
import chros_img from "./assets/others_img/chros.jpg";
import pg_img from "./assets/others_img/PG.jpg";
import nccu_img from "./assets/others_img/nccu.png";

export const siteData = {
  name: "Webber Lai",
  title: "Full Stack Developer",
  tagline:
    "It's easy to be different, but difficult to be better. \n 無法想像的畫面，就無法靠魔力實現 -《葬送的芙莉蓮》",
  location: "Taipei, Taiwan",
  avatarAlt: "Webber Lai portrait",
  avatarImage: selfImage,
  aboutImage: selfImage2,
  heroHighlights: [
    "M.S. CS @ NCCU — Computer Graphics & Data Visualization.",
    "Built interactive visual/data experiences (React, D3.js) end-to-end.",
    "Worked across product, design, and engineering to turn ideas into shipped features.",
  ],
  contacts: {
    github: "https://github.com/weipo0116",
    linkedin: "https://www.linkedin.com/in/weipo-lai-webber/",
    email: "mailto:weipo900116@gmail.com",
  },
  about: {
    intro:
      "Hi, I'm Webber Lai. I recently completed my M.S. in Computer Science at NCCU (Jan 2026).",
    status:
      "Open to full stack roles. I’m also interested in Product Manager (PM) opportunities where I can bridge user needs, engineering execution, and data insights.",
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
  ],
  education: [
    {
      degree: "M.S. in Computer Science",
      school: "National Chengchi University (NCCU)",
      period: "Sep 2023 - Feb 2026",
      note: "Thesis: Interactive semantic segmentation for large-scale aerial Gaussian splatting.\n Advisor: Ming-Te Chi.",
    },
    {
      degree: "B.S. in Big Data Management (Data Science)",
      school: "Soochow University (SCU)",
      period: "Sep 2019 - Jun 2023",
      note: "",
    },
    {
      degree: "Exchange Program, CS & Engineering",
      school: "Fudan University",
      period: "Sep 2021 - Jan 2022",
      note: "",
    },
  ],
  experience: [
    {
      role: "Social Content BD Team Intern | Social Content Strategy & Analytics",
      company: "LINE Taiwan Limited",
      logo: "https://vos.line-scdn.net/landpress-content-v2-tqq6mwxs5qlx5cg0nutma2bg/1c7f9ad5a0d2415cab739ae6e9f71e35-large.png?updatedAt=1752734110000",
      period: "Oct 2022 - Aug 2023",
      summary: [
        "Built and owned monthly performance reporting, translating data into actionable insights for management.",
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
