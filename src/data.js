// src/data.js
import selfImage from "./assets/self.jpg";
import samplePhoto from "./assets/raccoon.png";

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
      "Hi, I'm Webber Lai, currently pursuing a master's degree in Computer Science at NCCU, with plans to graduate in February 2026.",
    status:
      "Currently open to frontend roles and collaboration on product-focused web apps.",
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
      caption: [
        "Handled night shifts for daily dormitory operations, including key desk support, visitor check-in, and parcel processing.",
        "Performed routine facility checks for water heaters, electricity usage, and shared-space equipment.",
        "Supported residents with issue clarification and coordinated with related units for follow-up actions.",
      ],
      period: "2024/06 - 2026/02",
      image: samplePhoto,
    },
    {
      title: "Portfolio v2",
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
        "Post-hoc semantic 3DGS editing for large-scale aerial scenes without retraining. \nEnables interactive labeling and open-vocabulary queries with real-time rendering.",
      repo: "https://github.com/weipo0116/saga",
      image: samplePhoto,
    },
  ],
};
