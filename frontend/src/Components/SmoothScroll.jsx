import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const SmoothScroll = () => {
  const { pathname, hash } = useLocation();
  const scrollAttempts = useRef(0);
  const maxScrollAttempts = 5;

  useEffect(() => {
    // Reset scroll attempts on new navigation
    scrollAttempts.current = 0;

    // Function to handle scrolling with retry logic
    const handleScroll = () => {
      // If there's a hash in the URL, scroll to the element with that ID
      if (hash) {
        const targetId = hash.substring(1);
        const element = document.getElementById(targetId);

        if (element) {
          // Try to scroll to the element
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Check if scroll was successful
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            const isInView =
              rect.top >= 0 && rect.top <= window.innerHeight * 0.3;

            // If not in view and we haven't exceeded max attempts, try again
            if (!isInView && scrollAttempts.current < maxScrollAttempts) {
              scrollAttempts.current++;
              handleScroll();
            }
          }, 500);
        } else if (scrollAttempts.current < maxScrollAttempts) {
          // Element not found yet, try again after a delay (DOM might still be loading)
          scrollAttempts.current++;
          setTimeout(handleScroll, 200);
        }
      } else {
        // If there's no hash, scroll to the top of the page
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    // Start the scroll process
    handleScroll();

    // Cleanup function
    return () => {
      scrollAttempts.current = 0;
    };
  }, [pathname, hash]);

  // Initialize Lenis smooth scrolling if available
  useEffect(() => {
    // Check if Lenis is available globally
    if (typeof window.Lenis === "function") {
      try {
        const lenis = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
        });

        // Lenis scroll handler
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }

        // Start the animation
        requestAnimationFrame(raf);

        // Cleanup
        return () => {
          lenis.destroy();
        };
      } catch (error) {
        console.error("Error initializing Lenis:", error);
      }
    }
  }, []);

  return null;
};

export default SmoothScroll;
