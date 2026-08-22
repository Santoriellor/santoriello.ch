import React, { useEffect, useState } from "react";
import "../styles/CodeRain.css";
import { codeSnippets } from "../data/codeSnippets";

function getRandomCodeSnippet() {
  const randomIndex = Math.floor(Math.random() * codeSnippets.length);
  return codeSnippets[randomIndex];
}

const CodeRain = () => {
  const [drops, setDrops] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseInViewport, setIsMouseInViewport] = useState(true);

  // Create rain drops
  useEffect(() => {
    const createRainDrop = () => {
      setDrops((prevDrops) => {
        if (prevDrops.length >= 20) {
          // Remove the oldest drop when the limit is reached
          return [
            ...prevDrops.slice(1),
            {
              id: Math.random(),
              char: getRandomCodeSnippet(),
              left: Math.random() * window.innerWidth,
              top: -50,
              fontSize: Math.random() * 12 + 6,
              speed: Math.random() * 1 + 0.5,
              brightness: Math.random() * 0.5 + 0.1,
              orient: Math.random() * 360,
            },
          ];
        }
        // Add a new drop if the limit isn't reached
        return [
          ...prevDrops,
          {
            id: Math.random(),
            char: getRandomCodeSnippet(),
            left: Math.random() * window.innerWidth,
            top: -50,
            fontSize: Math.random() * 12 + 6,
            speed: Math.random() * 1 + 0.5,
            brightness: Math.random() * 0.5 + 0.1,
            orient: Math.random() * 360,
          },
        ];
      });
    };

    const interval = setInterval(createRainDrop, 300);

    return () => clearInterval(interval); // Clean up interval
  }, []); // Empty dependency to only run once on component mount

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
      setIsMouseInViewport(true); // Mouse is in the viewport
    };

    const handleMouseOut = () => {
      setIsMouseInViewport(false); // Mouse has left the viewport
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
    }; // Clean up listeners
  }, []);

  // Move every drop down by its own speed, once per frame. moveDrops lives
  // inside the effect so the effect owns everything it uses and the dependency
  // array can honestly be empty; frameId holds the id that cancels the loop.
  useEffect(() => {
    let frameId = 0;

    const moveDrops = () => {
      setDrops((prevDrops) =>
        prevDrops.map((drop) => ({
          ...drop,
          top: drop.top + drop.speed,
        })),
      );
    };

    const animate = () => {
      moveDrops();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="code-rain">
      {drops.map((drop) => {
        // Calculate the distance to the mouse if mouse is in the viewport
        const distance = isMouseInViewport
          ? Math.sqrt(
              Math.pow(mousePos.x - drop.left, 2) +
                Math.pow(mousePos.y - drop.top, 2),
            )
          : 0.5; // No distance when mouse is out

        // Adjust brightness based on distance or keep it constant
        const brightness = isMouseInViewport
          ? Math.max(1 - distance / 300, 0)
          : drop.brightness; // Keep brightness constant when mouse is out

        return (
          <div
            key={drop.id}
            className="code"
            style={{
              left: `${drop.left}px`,
              top: `${drop.top}px`,
              fontSize: `${drop.fontSize}px`,
              color: `rgba(4, 193, 200, ${brightness})`,
              rotate: `${drop.orient}deg`, // Brighter near the mouse or constant
            }}
          >
            {drop.char}
          </div>
        );
      })}
    </div>
  );
};

export default CodeRain;
