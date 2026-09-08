export default function CanvaIcon({ size = 24, color = 'currentColor', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill={color} />
      <path
        d="M15.2 9.4c-.6-1-1.6-1.6-2.9-1.6-2.3 0-3.9 1.8-3.9 4.2 0 2.4 1.6 4.2 3.9 4.2 1.3 0 2.4-.6 3-1.7"
        stroke="#07070b"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
