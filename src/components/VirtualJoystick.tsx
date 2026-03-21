import React, { useState, useRef, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
  onEnd: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onEnd }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const baseSize = 80;
  const handleSize = 30;
  const maxDistance = baseSize / 2;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !joystickRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    if (distance > maxDistance) {
      deltaX = Math.cos(angle) * maxDistance;
      deltaY = Math.sin(angle) * maxDistance;
    }

    setPosition({ x: deltaX, y: deltaY });

    // Normalize direction
    const normX = deltaX / maxDistance;
    const normY = deltaY / maxDistance;

    onMove({ x: normX, y: normY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onEnd();
  };

  return (
    <div 
      ref={joystickRef}
      className="relative pointer-events-auto touch-none select-none"
      style={{ width: baseSize, height: baseSize }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Base */}
      <div 
        className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
        style={{ width: baseSize, height: baseSize }}
      />
      {/* Handle */}
      <div 
        className="absolute rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-lg transition-transform duration-75"
        style={{ 
          width: handleSize, 
          height: handleSize,
          left: baseSize / 2 - handleSize / 2 + position.x,
          top: baseSize / 2 - handleSize / 2 + position.y,
        }}
      />
    </div>
  );
};
