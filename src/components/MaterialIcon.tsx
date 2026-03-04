"use client";

interface MaterialIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  filled?: boolean;
}

export function MaterialIcon({ name, className = "", style, filled }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        ...style,
        ...(filled && { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }),
      }}
    >
      {name}
    </span>
  );
}
