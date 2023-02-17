import { createContext, useContext, useState } from "react";
import { theme } from "theme";

export type MainViewContext = ReturnType<typeof useMainViewState>;

export const useMainViewState = () => {
  const [backgroundColor, setBackgroundColor] = useState<string>(theme.backgroundColor);
  const [hasSidebar, setHasDidebar] = useState<boolean>(true);

  return {
    backgroundColor,
    hasSidebar,
    setBackgroundColor,
    setHasDidebar,
  };
};

// @ts-expect-error Default value provided at implementation
export const mainViewContext = createContext<MainViewContext>();

export const useMainViewContext = () => useContext(mainViewContext);

export const MainViewProvider: React.FC = ({ children }) => {
  return <mainViewContext.Provider value={useMainViewState()}>{children}</mainViewContext.Provider>;
};
