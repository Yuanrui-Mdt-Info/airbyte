interface IProps {
  color?: string;
  width?: number;
  height?: number;
}

export const DocumentationIcon = ({ color = "currentColor", width = 24, height = 24 }: IProps) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.50178 24H18.4982C20.8365 24 22 22.8246 22 20.4962V10.3321C22 8.88807 21.8419 8.26116 20.9382 7.34328L14.7027 1.0634C13.8443 0.190281 13.1439 0 11.8674 0H6.50178C4.17479 0 3 1.18658 3 3.51494V20.4962C3 22.8358 4.17479 24 6.50178 24ZM6.59215 22.1977C5.42863 22.1977 4.81865 21.5821 4.81865 20.4627V3.54851C4.81865 2.44031 5.42863 1.80222 6.60343 1.80222H11.6189V8.30596C11.6189 9.71639 12.3418 10.4104 13.7426 10.4104H20.1813V20.4627C20.1813 21.5821 19.5826 22.1977 18.4079 22.1977H6.59215ZM13.9459 8.72014C13.5053 8.72014 13.3246 8.54104 13.3246 8.09328V2.14925L19.8312 8.72014H13.9459ZM16.657 13.4888H8.08321C7.67657 13.4888 7.38286 13.791 7.38286 14.1717C7.38286 14.5634 7.67657 14.8657 8.08321 14.8657H16.657C17.0523 14.8657 17.3573 14.5634 17.3573 14.1717C17.3573 13.791 17.0523 13.4888 16.657 13.4888ZM16.657 17.3955H8.08321C7.67657 17.3955 7.38286 17.7089 7.38286 18.1007C7.38286 18.4813 7.67657 18.7724 8.08321 18.7724H16.657C17.0523 18.7724 17.3573 18.4813 17.3573 18.1007C17.3573 17.7089 17.0523 17.3955 16.657 17.3955Z"
        fill={color}
      />
    </svg>
  );
};
