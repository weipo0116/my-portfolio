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

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Hero recedes as you scroll past it: drifts up, softens, scales back.
        // On large screens it is pinned for a beat so the portrait can open up
        // before the page moves on (one deliberate "moment", not many).
        const heroContent = scopeRef.current?.querySelector(".hero-content");
        const heroVisual = scopeRef.current?.querySelector(".hero-visual");
        const heroText = scopeRef.current?.querySelector(".hero-text");
        if (heroContent) {
          const wide = window.matchMedia("(min-width: 960px)").matches;
          if (wide && heroVisual && heroText) {
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "+=55%",
                scrub: 0.6,
                pin: true,
                anticipatePin: 1,
              },
            });
            // fromTo + immediateRender:false: these elements also run a Framer
            // entrance, so the scroll start state must be their *final* state,
            // not whatever they were mid-entrance when this was created.
            const settled = { immediateRender: false };
            tl.fromTo(
              heroText,
              { y: 0, opacity: 1 },
              { y: -48, opacity: 0, duration: 1, ...settled },
              0,
            )
              .fromTo(
                heroVisual,
                { scale: 1, x: 0 },
                { scale: 1.18, x: "-18vw", duration: 1, ...settled },
                0,
              )
              .fromTo(
                heroVisual,
                { opacity: 1 },
                { opacity: 0, duration: 0.35, ...settled },
                0.75,
              );
          } else {
            gsap.to(heroContent, {
              yPercent: -10,
              scale: 0.96,
              opacity: 0.25,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
            });
          }
        }

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
