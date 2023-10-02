import { theme } from "theme";

interface Props {
  color?: string;
  width?: number;
  height?: number;
}

export const ArrowIcon = ({ color = theme.primaryColor, width = 9, height = 9 }: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={`${width}`} height={`${height}`} viewBox="0 0 24 24" fill={`${color}`}>
    <path d="M4 14H10V20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M20 10H14V4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M14 10L21 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M3 21L10 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);
