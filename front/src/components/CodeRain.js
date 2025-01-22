import React, { useEffect, useState } from "react";
import "../styles/CodeRain.css";

// Multi-language code snippets
const codeSnippets = [
  // HTML
  "<div class='container'></div>",
  "<h1>Welcome to My Site</h1>",
  "<a href='#'>Click Here</a>",
  "<ul><li>Item 1</li>",
  "<p>This is a paragraph.</p>",

  // CSS
  ".container { width:",
  "body { color: white;",
  "text-align: center;",
  ".btn { padding: 10px",
  "a:hover { text-deco",

  // JavaScript
  "const x = 10;",
  "let name = 'John';",
  "if (a > b) {}",
  "{ return a + b; }",
  "const arr = [1, 2, 3];",
  "console.log('Hello');",
  "getElementById('id');",
  "async function fetchData",
  "const sum = (a, b)",
  "{ name: 'Alice' };",

  // Python
  "x = 10",
  "return f'Hello W",
  "if x > 5",
  "import math",
  "list = [1, 2, 3]",
  "with open('file",
  "def add(a, b)",
  "try: pass except",
  "class Person: pass",
  "print('Python Code!')",

  // PHP
  "$x = 10;",
  "$name = 'John';",
  "if ($x > 5)",
  "function greet($name)",
  "$arr = [1, 2, 3];",
  "$conn = new mysqli",
  "echo 'Hello, World!'",
  "try { } catch",
  "json_decode",
  "include('header.php');",

  // MySQL
  "SELECT *",
  "INSERT",
  "WHERE id = 1;",
  "FROM users",
  "SELECT name",
  "CREATE",
  "VARCHAR(100);",
  "COUNT(*)",
  "DROP TABLE",
  "DESCRIBE users;"
];

function getRandomCodeSnippet() {
  const randomIndex = Math.floor(Math.random() * codeSnippets.length);
  return codeSnippets[randomIndex];
};

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
              return [...prevDrops.slice(1), {
                id: Math.random(),
                char: getRandomCodeSnippet(),
                left: Math.random() * window.innerWidth,
                top: -50,
                fontSize: Math.random() * 12 + 6,
                speed: Math.random() * 1 + 0.5,
                brightness: Math.random() * 0.5 + 0.1,
                orient: Math.random() * 360,
              }];
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

  // Use requestAnimationFrame for smoother movement
  const moveDrops = () => {
    setDrops((prevDrops) =>
      prevDrops.map((drop) => ({
        ...drop,
        top: drop.top + drop.speed, // Move down by 5px per frame
      }))
    );
  };

  // Request animation frame to make the movement smoother
  useEffect(() => {
    const animate = () => {
      moveDrops();
      requestAnimationFrame(animate); // Continue the animation
    };

    requestAnimationFrame(animate); // Start animation

    return () => cancelAnimationFrame(animate); // Clean up the animation
  }, []);

  return (
    <div className="code-rain">
      {drops.map((drop) => {
        // Calculate the distance to the mouse if mouse is in the viewport
        const distance = isMouseInViewport
          ? Math.sqrt(
              Math.pow(mousePos.x - drop.left, 2) + Math.pow(mousePos.y - drop.top, 2)
            )
          : 0.5; // No distance when mouse is out

        // Adjust brightness based on distance or keep it constant
        const brightness = isMouseInViewport
          ? Math.max(1 - distance / 300, 0)
          : drop.brightness // Keep brightness constant when mouse is out

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
