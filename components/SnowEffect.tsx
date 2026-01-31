import React, { useEffect, useRef } from 'react';

export const SnowEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Particle settings
    const snowflakes: { x: number; y: number; r: number; d: number; speed: number }[] = [];
    const maxSnowflakes = 150;

    for (let i = 0; i < maxSnowflakes; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1, // Radius
        d: Math.random() * maxSnowflakes, // Density factor for swaying
        speed: Math.random() * 1 + 0.5, // Fall speed
      });
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      
      for (let i = 0; i < maxSnowflakes; i++) {
        const p = snowflakes[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
    }

    let angle = 0;
    function update() {
      angle += 0.01;
      for (let i = 0; i < maxSnowflakes; i++) {
        const p = snowflakes[i];
        // Updating X and Y coordinates
        // We add 1 to cos function to prevent negative values which would move flakes upwards
        // Every particle has its own density which can be used to make the downward movement different for each flake
        // Let's make it more dynamic
        p.y += Math.cos(angle + p.d) + 1 + p.speed;
        p.x += Math.sin(angle) * 2;

        // Sending flakes back from the top when it exits
        // Lets make it a bit more organic and let flakes enter from the left and right also.
        if (p.x > width + 5 || p.x < -5 || p.y > height) {
          if (i % 3 > 0) { // 66.67% of the flakes
            snowflakes[i] = { x: Math.random() * width, y: -10, r: p.r, d: p.d, speed: p.speed };
          } else {
            // If the flake is exiting from the right
            if (Math.sin(angle) > 0) {
              // Enter from the left
              snowflakes[i] = { x: -5, y: Math.random() * height, r: p.r, d: p.d, speed: p.speed };
            } else {
              // Enter from the right
              snowflakes[i] = { x: width + 5, y: Math.random() * height, r: p.r, d: p.d, speed: p.speed };
            }
          }
        }
      }
    }

    let animationFrameId: number;
    const render = () => {
      draw();
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};