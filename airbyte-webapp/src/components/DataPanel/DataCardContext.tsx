import { useState, createContext, useContext } from "react";
// import { SourceDefinitionReadWithLatestTag } from "services/connector/SourceDefinitionService";

export interface SelectDefinition {
  definitionId: string;
  icon?: string;
  name: string;
}

export type DataCardContext = ReturnType<typeof useDataCardState>;
export const useDataCardState = () => {
  const [selectDefinition, setSelectDefinition] = useState<SelectDefinition>({
    definitionId: "",
    icon: "",
    name: "",
  });

  return {
    selectDefinition,
    setSelectDefinition,
  };
};

// @ts-expect-error Default value provided at implementation
export const dataCardContext = createContext<DataCardContext>();

export const useDataCardContext = () => useContext(dataCardContext);

export const DataCardProvider: React.FC = ({ children }) => {
  return <dataCardContext.Provider value={useDataCardState()}>{children}</dataCardContext.Provider>;
};
