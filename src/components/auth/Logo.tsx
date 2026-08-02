interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 72, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ASCEND logo"
    >
      <path d="M50 8 L88 88 L64 88 L50 54 L36 88 L12 88 Z" fill="currentColor" />
      <path d="M40 68 L60 68 L54 82 L46 82 Z" fill="var(--background)" />
    </svg>
  );
}
