"use client";

import { useEffect, useState } from "react";

export function TypewriterHero() {
  const fullText1 = "Your Campus.";
  const fullText2 = "Your Marketplace.";

  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [activeLine, setActiveLine] = useState(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Typing first line
    if (activeLine === 1) {
      if (text1.length < fullText1.length) {
        timer = setTimeout(() => {
          setText1(fullText1.substring(0, text1.length + 1));
        }, 100); // 100ms per character
      } else {
        // First line is done, pause, then switch to second line
        timer = setTimeout(() => {
          setActiveLine(2);
        }, 500); // 500ms pause
      }
    } 
    // Typing second line
    else if (activeLine === 2) {
      if (text2.length < fullText2.length) {
        timer = setTimeout(() => {
          setText2(fullText2.substring(0, text2.length + 1));
        }, 100); // 100ms per character
      }
    }

    return () => clearTimeout(timer);
  }, [text1, text2, activeLine]);

  return (
    <>
      {/* Screen reader and SEO friendly text */}
      <h1 className="sr-only">Your Campus. Your Marketplace.</h1>

      <h1
        aria-hidden="true"
        className="mb-6 leading-tight select-none"
        style={{
          fontFamily: "var(--font-bodoni), serif",
          fontSize: "clamp(3rem, 8vw, 5.5rem)",
          fontWeight: 900,
          color: "hsl(213 31% 94%)",
        }}
      >
        <span>
          {text1}
          {activeLine === 1 && (
            <span 
              className="animate-blink ml-1 inline-block align-middle rounded-sm"
              style={{
                width: "0.06em",
                height: "0.85em",
                backgroundColor: "hsl(213 31% 94%)",
                boxShadow: "0 0 10px rgba(213, 233, 255, 0.4)",
              }}
            />
          )}
        </span>
        <br />
        <span className="gradient-text">
          {text2}
        </span>
        {activeLine === 2 && (
          <span 
            className="animate-blink ml-1 inline-block align-middle rounded-sm"
            style={{
              width: "0.06em",
              height: "0.85em",
              backgroundColor: "hsl(28 90% 55%)",
              boxShadow: "0 0 15px rgba(245, 167, 30, 0.6)",
            }}
          />
        )}
      </h1>
    </>
  );
}
