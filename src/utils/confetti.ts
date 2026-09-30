/**
 * High-performance, zero-dependency full-screen confetti particle burst.
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'ribbon';
}

const COLORS = [
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EAB308', // Gold
  '#14B8A6', // Teal
];

export function launchConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const particleCount = Math.min(width > 768 ? 160 : 90, 200);
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    // Launch from top-center and corners
    const startX = width * 0.5 + (Math.random() - 0.5) * (width * 0.8);
    const startY = height * 0.15 + (Math.random() - 0.5) * 50;

    particles.push({
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -12 - 4, // initial upward thrust
      size: Math.random() * 8 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 14,
      opacity: 1,
      shape: Math.random() > 0.6 ? 'ribbon' : Math.random() > 0.3 ? 'rect' : 'circle',
    });
  }

  const startTime = performance.now();
  const duration = 3800; // ms

  function render(now: number) {
    const elapsed = now - startTime;
    if (elapsed > duration) {
      canvas.remove();
      return;
    }

    ctx!.clearRect(0, 0, width, height);

    const progress = elapsed / duration;
    const globalFade = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.42; // gravity
      p.vx *= 0.985; // drag
      p.rotation += p.rotationSpeed;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity * globalFade;
      ctx!.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.shape === 'circle') {
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        // Ribbon / strip
        ctx!.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
      }

      ctx!.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
