import React, { useEffect, useRef, useState } from 'react';

interface PlanetConfig {
  id: string;
  name: string;
  baseX: number; // percentage 0-1
  baseY: number; // percentage 0-1
  radius: number;
  speed: number;
  floatAmplitudeX: number;
  floatAmplitudeY: number;
  phaseOffset: number;
  hasRings?: boolean;
  hasInfinityCore?: boolean;
  ringTilt?: number;
  ringRadiusX?: number;
  ringRadiusY?: number;
  depthLayer: number; // 1 (far), 2 (mid), 3 (foreground)
  palette: {
    highlight: string;
    mid: string;
    shadow: string;
    corona: string;
  };
}

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAtmosphereActive, setIsAtmosphereActive] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    // Smooth mouse parallax variables
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 40;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 40;
    };

    const handleResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Stardust particles drifting like cosmic dust in the photo
    interface StardustParticle {
      x: number;
      y: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
      vx: number;
      vy: number;
      isSparkle: boolean;
      sparklePhase: number;
    }

    const stardust: StardustParticle[] = [];
    const dustCount = Math.min(Math.floor(window.innerWidth / 20), 55);

    for (let i = 0; i < dustCount; i++) {
      stardust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.55 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.25 - 0.05, // gentle upward drift
        isSparkle: Math.random() > 0.7,
        sparklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Celestial planets configured to match the photo's cosmic journey & hero planet with infinity
    const planets: PlanetConfig[] = [
      // 1. Hero Central/Lower-Right Celestial Planet: The glowing celestial sphere with the Infinity symbol inside & orbital rings
      {
        id: 'hero-infinity-planet',
        name: 'Construir • Núcleo Infinito',
        baseX: 0.72,
        baseY: 0.52,
        radius: 68,
        speed: 0.0006,
        floatAmplitudeX: 18,
        floatAmplitudeY: 24,
        phaseOffset: 0,
        hasRings: true,
        hasInfinityCore: true,
        ringTilt: -0.42, // radians (~ -24 deg)
        ringRadiusX: 145,
        ringRadiusY: 34,
        depthLayer: 3,
        palette: {
          highlight: '#FFF4E0',
          mid: '#BC9164',
          shadow: '#2A1C12',
          corona: 'rgba(188, 145, 100, 0.45)',
        },
      },
      // 2. Large Atmosphere Planet in upper cosmic distance
      {
        id: 'upper-distant-planet',
        name: 'Cosmos Superior',
        baseX: 0.18,
        baseY: 0.22,
        radius: 52,
        speed: 0.0004,
        floatAmplitudeX: 14,
        floatAmplitudeY: 18,
        phaseOffset: 1.8,
        hasRings: false,
        hasInfinityCore: false,
        depthLayer: 1,
        palette: {
          highlight: '#F3E5D4',
          mid: '#A6825B',
          shadow: '#312318',
          corona: 'rgba(188, 145, 100, 0.25)',
        },
      },
      // 3. Medium Orbital Planet (Left/Mid)
      {
        id: 'orbital-planet-left',
        name: 'Despertar',
        baseX: 0.28,
        baseY: 0.74,
        radius: 38,
        speed: 0.0008,
        floatAmplitudeX: 20,
        floatAmplitudeY: 15,
        phaseOffset: 3.5,
        hasRings: true,
        hasInfinityCore: false,
        ringTilt: 0.35,
        ringRadiusX: 68,
        ringRadiusY: 18,
        depthLayer: 2,
        palette: {
          highlight: '#FAF0E2',
          mid: '#9E774E',
          shadow: '#23160D',
          corona: 'rgba(188, 145, 100, 0.3)',
        },
      },
      // 4. Distant Companion Moon / Satellite
      {
        id: 'companion-moon',
        name: 'Aprender',
        baseX: 0.88,
        baseY: 0.24,
        radius: 22,
        speed: 0.0011,
        floatAmplitudeX: 16,
        floatAmplitudeY: 14,
        phaseOffset: 4.8,
        hasRings: false,
        hasInfinityCore: false,
        depthLayer: 1,
        palette: {
          highlight: '#FFFFFF',
          mid: '#BC9164',
          shadow: '#2C1D13',
          corona: 'rgba(188, 145, 100, 0.35)',
        },
      },
    ];

    let time = 0;

    // Render loop
    const render = () => {
      time += 1;

      // Smooth mouse parallax interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.035;
      currentMouseY += (targetMouseY - currentMouseY) * 0.035;

      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768 * dpr;

      // 1. Soft Warm Nebular Background Vortex (Champagne & Golden mist from the photo)
      const vortexCenterX = width * (isMobile ? 0.5 : 0.65) + currentMouseX * 0.2;
      const vortexCenterY = height * (isMobile ? 0.35 : 0.45) + currentMouseY * 0.2;

      const nebulaGrad = ctx.createRadialGradient(
        vortexCenterX,
        vortexCenterY,
        40 * dpr,
        vortexCenterX,
        vortexCenterY,
        Math.max(width, height) * 0.7
      );
      nebulaGrad.addColorStop(0, 'rgba(238, 226, 214, 0.55)');
      nebulaGrad.addColorStop(0.35, 'rgba(244, 236, 228, 0.35)');
      nebulaGrad.addColorStop(0.7, 'rgba(248, 244, 240, 0.15)');
      nebulaGrad.addColorStop(1, 'rgba(248, 244, 240, 0)');

      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Orbital Trajectories (Curved Ellipses as seen connecting planets in the photo)
      ctx.save();
      const orbitCenterX = width * 0.5 + currentMouseX * 0.3;
      const orbitCenterY = height * 0.68 + currentMouseY * 0.3;

      // Main Grand Orbital Ellipse
      ctx.beginPath();
      ctx.ellipse(
        orbitCenterX,
        orbitCenterY,
        width * 0.58,
        height * 0.24,
        -0.12,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = 'rgba(188, 145, 100, 0.14)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.setLineDash([6 * dpr, 10 * dpr]);
      ctx.stroke();

      // Secondary Upper Orbital Ellipse
      ctx.beginPath();
      ctx.ellipse(
        orbitCenterX,
        orbitCenterY - height * 0.22,
        width * 0.42,
        height * 0.16,
        -0.1,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = 'rgba(188, 145, 100, 0.08)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([4 * dpr, 8 * dpr]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Render Drifting Stardust & Glowing Star Sparks
      for (let i = 0; i < stardust.length; i++) {
        const p = stardust[i];
        p.y += p.vy * dpr;
        p.x += p.vx * dpr;

        // Wrap around boundaries
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        p.sparklePhase += p.pulseSpeed;
        const currentAlpha =
          p.alpha * (0.6 + 0.4 * Math.sin(p.sparklePhase));

        ctx.fillStyle = `rgba(188, 145, 100, ${currentAlpha})`;

        if (p.isSparkle && currentAlpha > 0.4) {
          // 4-point twinkling star cross
          const arm = p.size * 3 * dpr;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(220, 185, 140, ${currentAlpha * 0.7})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.beginPath();
          ctx.moveTo(p.x - arm, p.y);
          ctx.lineTo(p.x + arm, p.y);
          ctx.moveTo(p.x, p.y - arm);
          ctx.lineTo(p.x, p.y + arm);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Render Celestial Planets with 3D Spherical Shading & Floating Motion
      planets.forEach((planet) => {
        // Compute slow harmonic floating coordinates
        const floatX =
          Math.sin(time * planet.speed + planet.phaseOffset) *
          planet.floatAmplitudeX *
          dpr;
        const floatY =
          Math.cos(time * planet.speed * 0.85 + planet.phaseOffset) *
          planet.floatAmplitudeY *
          dpr;

        // Parallax depth offset based on layer
        const parallaxFactor =
          planet.depthLayer === 3 ? 0.75 : planet.depthLayer === 2 ? 0.45 : 0.2;
        const posX =
          planet.baseX * width + floatX + currentMouseX * parallaxFactor * dpr;
        const posY =
          planet.baseY * height + floatY + currentMouseY * parallaxFactor * dpr;

        const radius = isMobile ? planet.radius * 0.75 * dpr : planet.radius * dpr;

        // A. If planet has rings, draw BACK SEGMENT of ring first (depth occlusion)
        if (planet.hasRings && planet.ringRadiusX && planet.ringRadiusY) {
          const rx = isMobile
            ? planet.ringRadiusX * 0.75 * dpr
            : planet.ringRadiusX * dpr;
          const ry = isMobile
            ? planet.ringRadiusY * 0.75 * dpr
            : planet.ringRadiusY * dpr;
          const tilt = planet.ringTilt || -0.3;

          ctx.save();
          ctx.translate(posX, posY);
          ctx.rotate(tilt);

          // Draw back half of outer & inner ring (angles Math.PI to 2*Math.PI)
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI * 2);
          ctx.strokeStyle = 'rgba(188, 145, 100, 0.32)';
          ctx.lineWidth = 3.5 * dpr;
          ctx.stroke();

          // Outer delicate hairline ring
          ctx.beginPath();
          ctx.ellipse(0, 0, rx + 14 * dpr, ry + 5 * dpr, 0, Math.PI, Math.PI * 2);
          ctx.strokeStyle = 'rgba(188, 145, 100, 0.15)';
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();

          ctx.restore();
        }

        // B. Outer Atmospheric Corona Glow
        const coronaGrad = ctx.createRadialGradient(
          posX,
          posY,
          radius * 0.8,
          posX,
          posY,
          radius * 1.65
        );
        coronaGrad.addColorStop(0, planet.palette.corona);
        coronaGrad.addColorStop(0.6, 'rgba(188, 145, 100, 0.12)');
        coronaGrad.addColorStop(1, 'rgba(188, 145, 100, 0)');

        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(posX, posY, radius * 1.65, 0, Math.PI * 2);
        ctx.fill();

        // C. 3D Spherical Body Rendering
        ctx.save();
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
        ctx.clip(); // Clip everything to the spherical disk

        // Spherical lighting gradient: Light source is from top-right
        const lightOffsetX = radius * 0.38;
        const lightOffsetY = -radius * 0.38;
        const sphereGrad = ctx.createRadialGradient(
          posX + lightOffsetX,
          posY + lightOffsetY,
          radius * 0.15,
          posX,
          posY,
          radius * 1.15
        );
        sphereGrad.addColorStop(0, planet.palette.highlight);
        sphereGrad.addColorStop(0.28, planet.palette.mid);
        sphereGrad.addColorStop(0.7, planet.palette.shadow);
        sphereGrad.addColorStop(1, '#1A0F08');

        ctx.fillStyle = sphereGrad;
        ctx.fill();

        // Subtle planetary surface atmospheric marbling / bands
        ctx.save();
        ctx.rotate(-0.3);
        for (let b = -2; b <= 2; b++) {
          const bandY = posY + b * (radius * 0.35);
          ctx.beginPath();
          ctx.arc(posX, bandY, radius * 1.1, 0, Math.PI * 2);
          ctx.strokeStyle =
            b % 2 === 0 ? 'rgba(255, 240, 220, 0.08)' : 'rgba(30, 18, 10, 0.12)';
          ctx.lineWidth = radius * 0.18;
          ctx.stroke();
        }
        ctx.restore();

        // Atmospheric Golden Rim Light along the illuminated crescent
        const rimGrad = ctx.createRadialGradient(
          posX + lightOffsetX * 1.4,
          posY + lightOffsetY * 1.4,
          radius * 0.8,
          posX,
          posY,
          radius
        );
        rimGrad.addColorStop(0, 'rgba(255, 250, 235, 0.65)');
        rimGrad.addColorStop(0.4, 'rgba(188, 145, 100, 0.35)');
        rimGrad.addColorStop(1, 'rgba(188, 145, 100, 0)');
        ctx.fillStyle = rimGrad;
        ctx.fill();

        // D. HERO SPECIAL FEATURE: "Planeta com o Infinito Dourado no Núcleo"
        if (planet.hasInfinityCore) {
          // Transparent crystalline glowing inner core
          const corePulse = 0.85 + 0.15 * Math.sin(time * 0.03);
          const coreRadius = radius * 0.52 * corePulse;

          const coreGrad = ctx.createRadialGradient(
            posX,
            posY,
            2 * dpr,
            posX,
            posY,
            coreRadius
          );
          coreGrad.addColorStop(0, 'rgba(255, 245, 220, 0.95)');
          coreGrad.addColorStop(0.4, 'rgba(212, 168, 122, 0.6)');
          coreGrad.addColorStop(0.8, 'rgba(131, 86, 41, 0.35)');
          coreGrad.addColorStop(1, 'rgba(42, 28, 18, 0)');

          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(posX, posY, coreRadius, 0, Math.PI * 2);
          ctx.fill();

          // Golden Infinity Symbol inside the celestial sphere
          ctx.save();
          ctx.font = `bold ${radius * 0.52}px "Cinzel", "Playfair Display", serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Glow shadow for the infinity symbol
          ctx.shadowColor = '#FFE2B3';
          ctx.shadowBlur = 16 * dpr;

          // Radiant gold fill
          const infGrad = ctx.createLinearGradient(
            posX - radius * 0.3,
            posY,
            posX + radius * 0.3,
            posY
          );
          infGrad.addColorStop(0, '#FFEAC2');
          infGrad.addColorStop(0.5, '#BC9164');
          infGrad.addColorStop(1, '#835629');

          ctx.fillStyle = infGrad;
          ctx.fillText('∞', posX, posY + 1 * dpr);
          ctx.restore();
        }

        ctx.restore(); // end planet disk clip

        // E. FRONT SEGMENT of Orbital Rings (Passing over the planet equator in 3D)
        if (planet.hasRings && planet.ringRadiusX && planet.ringRadiusY) {
          const rx = isMobile
            ? planet.ringRadiusX * 0.75 * dpr
            : planet.ringRadiusX * dpr;
          const ry = isMobile
            ? planet.ringRadiusY * 0.75 * dpr
            : planet.ringRadiusY * dpr;
          const tilt = planet.ringTilt || -0.3;

          ctx.save();
          ctx.translate(posX, posY);
          ctx.rotate(tilt);

          // Front half (angles 0 to Math.PI)
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
          ctx.strokeStyle = 'rgba(255, 235, 205, 0.7)';
          ctx.lineWidth = 3.5 * dpr;
          ctx.shadowColor = '#BC9164';
          ctx.shadowBlur = 10 * dpr;
          ctx.stroke();

          // Outer hairline front ring
          ctx.beginPath();
          ctx.ellipse(0, 0, rx + 14 * dpr, ry + 5 * dpr, 0, 0, Math.PI);
          ctx.strokeStyle = 'rgba(188, 145, 100, 0.45)';
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();

          // Sparkling dust node orbiting on the ring
          const ringAngle = (time * 0.015) % (Math.PI * 2);
          // only draw when on front half
          if (ringAngle >= 0 && ringAngle <= Math.PI) {
            const sparkleX = Math.cos(ringAngle) * rx;
            const sparkleY = Math.sin(ringAngle) * ry;
            ctx.fillStyle = '#FFF8EB';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 8 * dpr;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 2.5 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // F. Delicate Coordinate/Orbital Label Indicator (Luxury Aesthetic)
        if (planet.id === 'hero-infinity-planet' && !isMobile) {
          ctx.save();
          ctx.fillStyle = 'rgba(131, 86, 41, 0.65)';
          ctx.font = `600 ${8.5 * dpr}px sans-serif`;
          ctx.letterSpacing = '0.25em';
          ctx.textAlign = 'center';
          ctx.fillText('NÚCLEO INFINITO • SISTEMA 03', posX, posY + radius + 22 * dpr);

          // Small indicator pip
          ctx.beginPath();
          ctx.arc(posX, posY + radius + 12 * dpr, 1.8 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = '#BC9164';
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Dynamic Cosmic Floating Canvas */}
      <canvas
        ref={canvasRef}
        id="infinity-celestial-canvas"
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
        style={{ opacity: isAtmosphereActive ? 0.88 : 0.25 }}
      />

      {/* Discrete Luxury Floating Atmosphere Indicator / Ambient Badge */}
      <div className="fixed bottom-4 right-4 z-20 pointer-events-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#EBE6E2] shadow-xs text-[10px] text-[#59595F] transition-all hover:border-[#BC9164]">
        <button
          onClick={() => setIsAtmosphereActive((prev) => !prev)}
          className="flex items-center gap-1.5 cursor-pointer hover:text-[#312318]"
          title="Alternar intensidade da Atmosfera Cósmica (Planeta & Órbitas)"
          id="btn-toggle-atmosphere"
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isAtmosphereActive ? 'bg-[#BC9164] animate-pulse' : 'bg-[#D7D0CB]'
            }`}
          />
          <span className="font-semibold uppercase tracking-wider">
            {isAtmosphereActive ? 'Cosmos Ativo' : 'Cosmos Suave'}
          </span>
        </button>
      </div>
    </>
  );
};
