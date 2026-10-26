// src/useScrollMotion.js
// Scroll-linked motion layered on top of the Framer Motion entrances.
// Framer handles "appear once" (cards, sections); GSAP handles anything tied to
// scroll position (scrubbed parallax, depth, heading reveals). Only transform and
// opacity are animated, and everything is skipped for prefers-reduced-motion.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE_OUT = "expo.out";

export const useScrollMotion = (scopeRef, deps) => {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Hero: one pinned "moment" on wide screens, a simple recede elsewhere.
      // Targets are inner wrappers Framer never animates, so React re-renders
      // (active nav, language) can't snap them back.
      mm.add(
        {
          wide: "(min-width: 960px) and (prefers-reduced-motion: no-preference)",
          narrow:
            "(max-width: 959px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const root = scopeRef.current;
          const hero = root?.querySelector(".hero");
          if (!hero) return;
          const text = root.querySelector(".hero-text-inner");
          const visual = root.querySelector(".hero-visual-inner");
          if (context.conditions.wide && text && visual) {
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: hero,
                  start: "top top",
                  end: "+=45%",
                  scrub: 0.6,
                  pin: true,
                  anticipatePin: 1,
                  // The big portrait settles at either end, never half-way.
                  snap: {
                    snapTo: [0, 1],
                    duration: { min: 0.25, max: 0.6 },
                    delay: 0.08,
                    ease: "power2.inOut",
                  },
                },
              })
              // Text lifts away; the portrait moves to centre and grows,
              // then simply scrolls off with the page (no blank screen).
              .to(text, { y: -56, opacity: 0, duration: 0.8 }, 0)
              .to(visual, { x: "-20vw", scale: 1.22, duration: 1 }, 0);
          } else {
            const content = root.querySelector(".hero-content");
            gsap.to(content, {
              yPercent: -10,
              opacity: 0.25,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
            });
          }
        },
      );

      // Other experiences: vertical scroll drives the row sideways on wide
      // screens, snapping card by card. Narrow screens keep native swipe +
      // CSS scroll-snap.
      mm.add(
        "(min-width: 960px) and (prefers-reduced-motion: no-preference)",
        () => {
          const root = scopeRef.current;
          const scroller = root?.querySelector(".hscroll");
          const track = scroller?.querySelector(".hscroll-track");
          const section = root?.querySelector("#others");
          if (!scroller || !track || !section) return;
          const cards = gsap.utils.toArray(".hscroll-card", track);
          const distance = () =>
            Math.max(0, track.scrollWidth - scroller.clientWidth);
          if (distance() < 40) return;
          scroller.classList.add("is-driven");
          scroller.scrollLeft = 0;

          const slide = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              // Pin just below the fixed nav so the title stays readable.
              start: () => {
                const nav = document.querySelector(".nav");
                return `top ${(nav ? nav.offsetHeight : 64) + 28}px`;
              },
              end: () => `+=${distance()}`,
              scrub: 0.8,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              snap: {
                snapTo: (progress) => {
                  const d = distance() || 1;
                  const stops = cards.map((card) =>
                    Math.min(1, (card.offsetLeft - cards[0].offsetLeft) / d),
                  );
                  return gsap.utils.snap(stops, progress);
                },
                duration: { min: 0.2, max: 0.55 },
                delay: 0.06,
                ease: "power2.inOut",
              },
            },
          });

          // Each photo drifts against the row's movement (horizontal parallax).
          cards.forEach((card) => {
            const image = card.querySelector(".photo-image");
            if (!image) return;
            gsap.fromTo(
              image,
              { xPercent: 5, scale: 1.14 },
              {
                xPercent: -5,
                scale: 1.14,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: slide,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
          });

          return () => scroller.classList.remove("is-driven");
        },
      );

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Reading progress across the top of the page.
        const progress = scopeRef.current?.querySelector(".scroll-progress");
        if (progress) {
          gsap.to(progress, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.3,
            },
          });
        }

        // Section titles drift a little slower than the page (parallax).
        gsap.utils.toArray(".section-header").forEach((header) => {
          // The pinned row already moves; a drifting title there would fight it.
          if (header.closest("#others")) return;
          gsap.fromTo(
            header,
            { y: 36 },
            {
              y: -36,
              ease: "none",
              scrollTrigger: {
                trigger: header,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        // Large photos glide inside their frames.
        gsap.utils
          .toArray(".education-photo img, .project-thumb-image")
          .forEach((image) => {
            gsap.fromTo(
              image,
              { yPercent: -4, scale: 1.08 },
              {
                yPercent: 4,
                scale: 1.08,
                ease: "none",
                scrollTrigger: {
                  trigger: image.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });

        // Work page title does the same, a little faster.
        const workHero = scopeRef.current?.querySelector(".work-hero-inner");
        if (workHero) {
          gsap.fromTo(
            workHero,
            { y: 0, opacity: 1 },
            {
              immediateRender: false,
              y: -60,
              opacity: 0.2,
              ease: "none",
              scrollTrigger: {
                trigger: ".work-hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        }

        // Section titles rise in from below their baseline, once.
        gsap.utils.toArray(".section-header h2").forEach((heading) => {
          gsap.from(heading, {
            yPercent: 60,
            opacity: 0,
            duration: 1.1,
            ease: EASE_OUT,
            scrollTrigger: { trigger: heading, start: "top 90%", once: true },
          });
        });

        // Photos sit slightly zoomed and glide inside their frame (depth).
        gsap.utils.toArray(".about-photo-image").forEach((image) => {
          const frame = image.parentElement;
          gsap.fromTo(
            image,
            { yPercent: -5, scale: 1.08 },
            {
              yPercent: 5,
              scale: 1.08,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        // Company logos settle into place as their card scrolls to centre.
        gsap.utils.toArray(".company-logo-shell").forEach((logo) => {
          gsap.fromTo(
            logo,
            { scale: 0.9 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: logo,
                start: "top bottom",
                end: "center 65%",
                scrub: 0.5,
              },
            },
          );
        });
      });

      // Fonts and lazy images change layout after first paint.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh);
      return () => {
        window.removeEventListener("load", refresh);
        mm.revert();
      };
    },
    { scope: scopeRef, dependencies: deps, revertOnUpdate: true },
  );
};

// Language changes reflow text; re-measure triggers instead of rebuilding them
// (rebuilding would replay the "once" heading reveals).
export const useRefreshOnChange = (value) => {
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [value]);
};
