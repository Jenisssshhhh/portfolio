import React, { useRef } from "react";

export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const btnRef = useRef<HTMLButtonElement>(null);

  // Ripple effect handler
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const button = btnRef.current;
    if (!button) return;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.className = "ripple";
    button.appendChild(circle);
    setTimeout(() => {
      circle.remove();
    }, 600);
    if (props.onClick) props.onClick(e);
  };

  return (
    <button
      ref={btnRef}
      className={`rounded font-semibold transition px-6 py-2 bg-card text-card-foreground shadow-sm hover:bg-accent border border-border active:bg-secondary focus:ring-2 focus:ring-ring focus:outline-none active:scale-95 overflow-hidden ${className}`}
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

// Ripple effect CSS
// Add this to your global CSS or in a <style jsx global> block:
/*
.ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 0.6s linear;
  background-color: rgba(29, 29, 31, 0.15);
  pointer-events: none;
  z-index: 1;
}
@keyframes ripple {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
*/
