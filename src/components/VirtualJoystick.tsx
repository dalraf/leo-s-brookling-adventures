import React, { useRef } from 'react';

interface VirtualJoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
  onEnd: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onEnd }) => {
  const isDraggingRef = useRef(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const baseSize = 80;
  const handleSize = 30;
  const maxDistance = baseSize / 2;

  const updateHandleTransform = (x: number, y: number) => {
    if (handleRef.current) {
      handleRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    isDraggingRef.current = true;
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    let deltaX = touch.clientX - centerRef.current.x;
    let deltaY = touch.clientY - centerRef.current.y;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      deltaX *= scale;
      deltaY *= scale;
    }

    updateHandleTransform(deltaX, deltaY);

    onMove({ x: deltaX / maxDistance, y: deltaY / maxDistance });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = false;
    updateHandleTransform(0, 0);
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
        className="absolute inset-0 rounded-full bg-white/15 border border-white/25"
        style={{ width: baseSize, height: baseSize }}
      />
      {/* Handle */}
      <div 
        ref={handleRef}
        className="absolute rounded-full bg-white/40 border border-white/50 shadow-lg will-change-transform"
        style={{ 
          width: handleSize, 
          height: handleSize,
          left: baseSize / 2 - handleSize / 2,
          top: baseSize / 2 - handleSize / 2,
        }}
      />
    </div>
  );
};
