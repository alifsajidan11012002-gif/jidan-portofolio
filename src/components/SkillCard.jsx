import React, { useRef } from 'react';
import './SkillCard.css';

const MAX_TILT = 18; // degrees

export default function SkillCard({ name, Icon, color }) {
  const cardRef   = useRef(null);
  const shineRef  = useRef(null);
  const rafRef    = useRef(null);

  const onMouseMove = (e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      const shine = shineRef.current;
      if (!card || !shine) return;

      const rect = card.getBoundingClientRect();
      // Normalized -0.5 → +0.5 from center
      const nx = (e.clientX - rect.left) / rect.width  - 0.5;
      const ny = (e.clientY - rect.top)  / rect.height - 0.5;

      const rotateY =  nx * MAX_TILT * 2;
      const rotateX = -ny * MAX_TILT * 2;

      // 3D tilt
      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06,1.06,1.06)`;

      // Shine position (percentage inside card)
      const shineX = (nx + 0.5) * 100;
      const shineY = (ny + 0.5) * 100;
      shine.style.background =
        `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.22) 0%, transparent 65%)`;
      shine.style.opacity = '1';
    });
  };

  const onMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    const shine = shineRef.current;
    if (!card || !shine) return;

    card.style.transform = '';
    shine.style.opacity  = '0';
  };

  // Inline CSS vars for brand color
  const vars = {
    '--skill-color':        color,
    '--skill-color-subtle': color + '1a',  // ~10% opacity
    '--skill-glow':         color + '55',  // ~33% opacity
  };

  return (
    <div
      className="skill-card"
      ref={cardRef}
      style={vars}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Shine overlay */}
      <div className="skill-card-shine" ref={shineRef} aria-hidden="true" />

      {/* Icon */}
      <div className="skill-icon-wrap">
        {Icon ? <Icon className="skill-icon" /> : null}
      </div>

      {/* Name */}
      <span className="skill-name">{name}</span>
    </div>
  );
}
