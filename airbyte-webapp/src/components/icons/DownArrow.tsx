import { theme } from "theme";

interface Props {
  color?: string;
  width?: number;
  height?: number;
}

export const DownArrow = ({ color = theme.primaryColor, width = 12, height = 6 }: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={`${width}`} height={`${height}`} viewBox="0 0 12 6" fill={`${color}`}>
    <path d="M1 1L6.11628 5L11 1" stroke="#999999" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);
