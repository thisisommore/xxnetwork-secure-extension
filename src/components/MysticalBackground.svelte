<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animationFrame: number;
  let particles: Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
  }> = [];

  const PARTICLE_COUNT = 4;
  const PARTICLE_SIZE = 95;
  const PARTICLE_SPEED = 0.3;
  const PARTICLE_OPACITY = 0.5;

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * PARTICLE_SIZE + 10,
        speedX: (Math.random() - 0.5) * PARTICLE_SPEED,
        speedY: (Math.random() - 0.5) * PARTICLE_SPEED,
        opacity: Math.random() * PARTICLE_OPACITY,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(0.5, "#0A192F");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add blur effect
    ctx.filter = "blur(20px)";

    // Update and draw particles
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Bounce off edges
      if (
        particle.x - particle.size < 0 ||
        particle.x + particle.size > canvas.width
      ) {
        particle.speedX *= -1;
      }
      if (
        particle.y - particle.size < 0 ||
        particle.y + particle.size > canvas.height
      ) {
        particle.speedY *= -1;
      }

      // Keep particles within bounds
      particle.x = Math.max(
        particle.size,
        Math.min(canvas.width - particle.size, particle.x),
      );
      particle.y = Math.max(
        particle.size,
        Math.min(canvas.height - particle.size, particle.y),
      );

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 150, 255, ${particle.opacity})`; // Light blue with opacity
      ctx.fill();
    });

    // Reset filter
    ctx.filter = "none";

    animationFrame = requestAnimationFrame(animate);
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  onMount(() => {
    ctx = canvas.getContext("2d")!;
    handleResize();
    window.addEventListener("resize", handleResize);
    animate();
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    cancelAnimationFrame(animationFrame);
  });
</script>

<canvas
  bind:this={canvas}
  style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;"
/>

<style>
  canvas {
    pointer-events: none;
  }
</style>
