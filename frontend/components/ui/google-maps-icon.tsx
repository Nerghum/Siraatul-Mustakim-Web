import React from "react";

export function GoogleMapsIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 4C15.716 4 9 10.716 9 19c0 10.25 13.5 24.25 14.125 24.875a1.25 1.25 0 0 0 1.75 0C25.5 43.25 39 29.25 39 19c0-8.284-6.716-15-15-15z"
        fill="#EA4335"
      />
      <circle cx="24" cy="19" r="6" fill="#B31412" />
      <path
        d="M18 19c0-3.314 2.686-6 6-6V4C15.716 4 9 10.716 9 19c0 4.545 2.66 10.395 6.035 15.655L18 20.2V19z"
        fill="#4285F4"
      />
      <path
        d="M24 13c3.314 0 6 2.686 6 6 0 1.2-.35 2.316-.95 3.25l4.985 8.405C37.03 23.36 39 19.34 39 19c0-8.284-6.716-15-15-15v9z"
        fill="#FBBC04"
      />
      <path
        d="M15.035 34.655C18.37 39.845 23.125 43.875 24 44.75c.875-.875 5.63-4.905 8.965-10.095L24 19l-8.965 15.655z"
        fill="#34A853"
      />
    </svg>
  );
}
