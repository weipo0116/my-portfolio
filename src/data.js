// src/data.js
import selfImage from "./assets/self.jpg";
import samplePhoto from "./assets/raccoon.png";
import thesisTeaser from "./assets/project_img/thesis_teaser.png";
import vangoph_teaser from "./assets/project_img/vangoph_teaser.png";
import HCI_teaser from "./assets/project_img/HCI_teaser.png";
import chros_img from "./assets/others_img/chros.jpg";
import pg_img from "./assets/others_img/PG.jpg";
import nccu_img from "./assets/others_img/nccu.png";

export const siteData = {
  name: "Webber Lai",
  title: "Full Stack Developer",
  tagline:
    "Building clean, fast, and human-centered web experiences. 無法想像的畫面，就無法靠魔力實現 -《葬送的芙莉蓮》",
  location: "Taipei, Taiwan",
  avatarAlt: "Webber Lai portrait",
  avatarImage: selfImage,
  contacts: {
    github: "https://github.com/weipo0116",
    linkedin: "https://www.linkedin.com/in/weipo-lai-webber/",
    email: "mailto:weipo900116@gmail.com",
  },
  about: {
    intro:
      "Hi, I'm Webber Lai. I just completed my master's degree in Computer Science at NCCU in January 2026. I enjoy building end-to-end web products, from data processing and API design to frontend interaction and UX details.",
    status:
      "Currently open to full stack roles, and also very interested in Product Manager (PM) opportunities where I can connect user needs, engineering execution, and data analysis.",
  },
  skills: [
    "Python",
    "R",
    "JavaScript",
    "Bootstrap",
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
      note: "Thesis: Interactive semantic segmentation for large-scale aerial Gaussian splatting.\n Professor: Ming-Te Chi",
    },
    {
      degree: "B.S. in Big Data Management",
      school: "Soochow University (SCU)",
      period: "Sep 2019 - Jun 2023",
      note: "",
    },
    {
      degree: "Exchange Student, CS & Engineering",
      school: "Fudan University",
      period: "Sep 2021 - Jan 2022",
      note: "",
    },
  ],
  experience: [
    {
      role: "Social Content BD Team Intern",
      company: "LINE Taiwan Limited",
      logo: "https://vos.line-scdn.net/landpress-content-v2-tqq6mwxs5qlx5cg0nutma2bg/1c7f9ad5a0d2415cab739ae6e9f71e35-large.png?updatedAt=1752734110000",
      period: "Oct 2022 - Aug 2023",
      summary: [
        "Monthly performance analysis and report writing, providing insights.",
        "Assisted in planning events and tracking execution for smooth progress.",
        "Reviewed platform content and analyzed user reactions and preferences.",
      ],
    },
    {
      role: "Data Science Consulting Intern",
      company: "Advant Analytics Tactics Ltd., AAT",
      logo: "https://system.netsuite.com/core/media/media.nl?id=14523301&c=835472&h=IG4EQfcTtnBchNGzUxALv1tVswtgqcyE8vTxEwOoFw9ekkQs",
      period: "Apr 2022 - Sep 2022",
      summary: [
        "Tested frontend packages in the KNIME platform.",
        "Built web templates for finance and semiconductor clients.",
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
      title: "Pacific Graphics Conference \n- Technical Team Lead",
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
      title: "NCCU Chen Sheng Chorus (Tenor)",
      expandIcon: "more-circle",
      caption: [
        "Participated as a tenor during master's studies at NCCU.",
        "Performed in a public concert at Eslite Performance Hall (誠品廳).",
      ],
      period: "2024 - 2025",
      image: chros_img,
    },
    {
      title: "Portfolio",
      expandIcon: "more-circle",
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
      repo: "https://github.com/weipo0116/saga",
      image: thesisTeaser,
    },
    {
      name: "VanGoph Visualization",
      description:
        "An interactive visualization project that explores Vincent van Gogh-related data with custom charts and insights.",
      repo: "https://github.com/weipo0116/VanGoph_Visualization",
      image: vangoph_teaser,
    },
    {
      name: "Prediction of Ecommerce Transaction Fraud",
      description:
        "Team-based data science project featuring end-to-end analysis, modeling, and a presentation-ready narrative.",
      repo: "https://github.com/112-2-dataScience/finalproject-group6",
      image: samplePhoto,
    },
    {
      name: "PR Garbage Detection",
      description:
        "Computer vision project for garbage detection with model training, evaluation, and deployment-ready inference.",
      repo: "https://github.com/weipo0116/PR_Garbage-Detection",
      image: samplePhoto,
    },
    {
      name: "HCI Webgazer Shop",
      description:
        "An HCI-focused web shopping experience using gaze interaction concepts to explore attention-aware interface design.",
      repo: "https://github.com/weipo0116/HCI_Webgazer_shop",
      image: HCI_teaser,
    },
  ],
};
