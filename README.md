# My Portfolio

Personal portfolio website showcasing my projects and information.

## Table of Contents

- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Project Structure](#project-structure)

## Live Demo

**GitHub Pages**: [https://weipo0116.github.io/my-portfolio/](https://weipo0116.github.io/my-portfolio/)

## Tech Stack

This project is built with the following technologies:

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **D3.js** - Data visualization library
- **ESLint** - Code quality linter

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to GitHub Pages

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

## Project Structure

```
my-portfolio/
├── public/              # Static assets
│   └── vite.svg        # Vite logo
├── src/                 # Source code
│   ├── assets/         # Images and media files
│   │   ├── raccoon.png # Image assets
│   │   └── self.jpg    # Profile photo
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application styles
│   ├── data.js         # Data configuration
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── index.html           # HTML template
├── vite.config.js      # Vite configuration
├── eslint.config.js    # ESLint configuration
├── package.json        # Project dependencies
└── README.md           # This file
```

### Where to Modify

- **Content & Data**: Edit `src/data.js` to update project information, skills, and other data
- **Main Component**: Modify `src/App.jsx` to change the layout and structure
- **Styling**: Update `src/App.css` for component-specific styles or `src/index.css` for global styles
- **Images**: Place new images in `src/assets/` folder
- **Static Files**: Add favicon, robots.txt, etc. to `public/` folder
- **Configuration**: Adjust build settings in `vite.config.js`
