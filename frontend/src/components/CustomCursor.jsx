import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check if the device is touch-enabled
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      if (cursorRef.current) cursorRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
      return;
    }

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Animating the ring with a slight delay for smooth trailing effect
    let animationFrameId;
    const animRing = () => {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;
      
      ringPosRef.current.x += (targetX - ringPosRef.current.x) * 0.12;
      ringPosRef.current.y += (targetY - ringPosRef.current.y) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringPosRef.current.x}px`;
        ringRef.current.style.top = `${ringPosRef.current.y}px`;
      }
      animationFrameId = requestAnimationFrame(animRing);
    };
    animRing();

    // Hover effect handlers
    const addHover = () => {
      if (ringRef.current) ringRef.current.classList.add('hovered');
    };
    const removeHover = () => {
      if (ringRef.current) ringRef.current.classList.remove('hovered');
    };

    // Use event delegation to catch hover on interactive elements
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      // Match links, buttons, select, inputs, textareas, cards
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('.event-card') || 
        target.closest('.partner-card') || 
        target.closest('.gm');

      if (isInteractive) {
        addHover();
      } else {
        removeHover();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="cursor">
      <div className="cursor-dot" ref={cursorRef}></div>
      <div className="cursor-ring" ref={ringRef}></div>
    </div>
  );
};

export default CustomCursor;
