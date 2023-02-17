import { MainViewProvider } from "./mainViewContext";

export const MainViewWrapper: React.FC = ({ children }) => {
  return (
    <MainViewProvider>
      <MainViewWrapper>{children}</MainViewWrapper>
    </MainViewProvider>
  );
};
