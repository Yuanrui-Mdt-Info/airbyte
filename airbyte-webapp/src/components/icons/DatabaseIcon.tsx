import { theme } from "theme";

interface Props {
  color?: string;
  width?: number;
  height?: number;
}

export const DatabaseIcon = ({ color = theme.primaryColor, width = 24, height = 24 }: Props) => (
  <svg width={`${width}`} height={`${height}`} viewBox="0 0 24 24" fill={`${color}`} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 8C16.9706 8 21 6.65685 21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5C3 6.65685 7.02944 8 12 8Z"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M21 12C21 13.66 17 15 12 15C7 15 3 13.66 3 12"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M3 5V19C3 20.66 7 22 12 22C17 22 21 20.66 21 19V5"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
