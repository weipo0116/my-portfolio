// src/data.js
import selfImage from "./assets/self.jpg";

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
      "Hi, I’m Webber Lai, currently pursuing a CS master degree at NCCU, with plans to graduate in January 2026. ",
    status:
      "Currently open to frontend roles and collaboration on product-focused web apps.",
  },
  skills: [
    "Python",
    "R",
    "Javascript",
    "Bootstrap",
    "React",
    "D3.js",
    "Flask API",
    "Figma",
    "Docker",
    "DevOps",
  ],
  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "Tech Giant",
      period: "2024 - Present",
      summary:
        "Led a redesign of core workflows and improved performance across major pages.",
    },
    {
      role: "Frontend Engineer",
      company: "Product Studio",
      period: "2022 - 2024",
      summary:
        "Built modular UI systems and shipped new features in fast iteration cycles.",
    },
    {
      role: "Full Stack Intern",
      company: "StartUp Inc.",
      period: "2023",
      summary: "Developed internal tools and contributed to API integrations.",
    },
  ],

  projects: [
    {
      name: "Portfolio v2",
      description:
        "Interactive one-page portfolio with D3 timeline and custom layout.",
      repo: "https://github.com/your-username/portfolio-v2",
    },
    {
      name: "DataViz Playground",
      description:
        "A collection of reusable charts and storytelling templates.",
      repo: "https://github.com/your-username/dataviz-playground",
    },
  ],

  otherExperiences: [
    {
      title: "Hackathon Organizer",
      caption: "Led a campus-wide hackathon and mentored student teams.",
      image: "",
    },
    {
      title: "Workshop Speaker",
      caption: "Presented UI engineering workflows to junior designers.",
      image: "",
    },
    {
      title: "Travel & Photography",
      caption: "Documented tech meetups and city walks.",
      image: "",
    },
    {
      title: "Travel & Photography",
      caption: "Documented tech meetups and city walks.",
      image: "",
    },
  ],
};
