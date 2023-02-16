import { theme } from "theme";

interface Props {
  color?: string;
}

// export const RotateIcon = ({ color = theme.greyColor20 }: Props) => (
//   <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//     <path
//       d="M3.463 2.433C5.27756 0.860661 7.59899 -0.0033494 10 1.65915e-07C15.523 1.65915e-07 20 4.477 20 10C20 12.136 19.33 14.116 18.19 15.74L15 10H18C18.0001 8.43162 17.5392 6.8978 16.6747 5.58926C15.8101 4.28071 14.5799 3.25516 13.1372 2.64012C11.6944 2.02509 10.1027 1.8477 8.55996 2.13002C7.0172 2.41233 5.59145 3.1419 4.46 4.228L3.463 2.433ZM16.537 17.567C14.7224 19.1393 12.401 20.0033 10 20C4.477 20 0 15.523 0 10C0 7.864 0.67 5.884 1.81 4.26L5 10H2C1.99987 11.5684 2.46075 13.1022 3.32534 14.4107C4.18992 15.7193 5.42007 16.7448 6.86282 17.3599C8.30557 17.9749 9.89729 18.1523 11.44 17.87C12.9828 17.5877 14.4085 16.8581 15.54 15.772L16.537 17.567Z"
//       fill={color}
//     />
//   </svg>
// );

export const RotateIcon = ({ color = theme.primaryColor }: Props) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 2V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 10V18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M19 10C19 5.02945 14.9706 1 10 1C7.45725 1 5.1608 2.05448 3.52405 3.75M1 10C1 14.9706 5.02945 19 10 19C12.4278 19 14.6311 18.0387 16.25 16.476"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
