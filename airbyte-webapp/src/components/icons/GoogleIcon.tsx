interface IProps {
  color?: string;
  width?: number;
  height?: number;
}

export const GoogleIcon = ({ width = 35, height = 35 }: IProps) => {
  return (
    <svg width={`${width}`} height={`${height}`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M45.6 0H2.4C1.07452 0 0 1.07452 0 2.4V45.6C0 46.9255 1.07452 48 2.4 48H45.6C46.9255 48 48 46.9255 48 45.6V2.4C48 1.07452 46.9255 0 45.6 0Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.368 24.2453C34.368 23.4795 34.2993 22.7432 34.1716 22.0363H24V26.2139H29.8124C29.562 27.5639 28.8011 28.7077 27.6573 29.4735V32.1833H31.1476C33.1898 30.3032 34.368 27.5344 34.368 24.2453Z"
        fill="#4285F4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 34.7999C26.916 34.7999 29.3608 33.8329 31.1477 32.1834L27.6573 29.4736C26.6902 30.1216 25.4531 30.5045 24 30.5045C21.1871 30.5045 18.8062 28.6047 17.9569 26.0519H14.3488V28.8501C16.1258 32.3798 19.7782 34.7999 24 34.7999Z"
        fill="#34A853"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.9569 26.0521C17.7409 25.4041 17.6181 24.7119 17.6181 24.0001C17.6181 23.2883 17.7409 22.5961 17.9569 21.9481V19.1499H14.3487C13.6172 20.6079 13.2 22.2574 13.2 24.0001C13.2 25.7428 13.6172 27.3923 14.3487 28.8503L17.9569 26.0521Z"
        fill="#FBBC05"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 17.4955C25.5857 17.4955 27.0093 18.0404 28.1286 19.1106L31.2262 16.0129C29.3558 14.2702 26.9111 13.2 24 13.2C19.7782 13.2 16.1258 15.6202 14.3488 19.1498L17.9569 21.948C18.8062 19.3953 21.1871 17.4955 24 17.4955Z"
        fill="#EA4335"
      />
    </svg>
  );
};
