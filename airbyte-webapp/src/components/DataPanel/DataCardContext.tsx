import { useState, useCallback, createContext, useContext } from "react";

import { ServiceFormValues } from "views/Connector/ServiceForm/types";

export interface SelectDefinition {
  definitionId: string;
  icon?: string;
  name: string;
}

export type DataCardContext = ReturnType<typeof useDataCardState>;
export const useDataCardState = () => {
  const [formValues, setFormValues] = useState<Partial<ServiceFormValues>>();
  const [selectDefinition, setSelectDefinition] = useState<SelectDefinition>({
    definitionId: "",
    icon: "",
    name: "",
  });

  const clearFormValues = useCallback(() => {
    setFormValues({});
  }, [setFormValues]);

  const clearSelectDefinition = useCallback(() => {
    setSelectDefinition({
      definitionId: "",
      icon: "",
      name: "",
    });
  }, [setFormValues]);

  return {
    selectDefinition,
    setSelectDefinition,
    formValues,
    setFormValues,
    clearFormValues,
    clearSelectDefinition,
  };
};

// @ts-expect-error Default value provided at implementation
export const dataCardContext = createContext<DataCardContext>();

export const useDataCardContext = () => useContext(dataCardContext);

export const DataCardProvider: React.FC = ({ children }) => {
  return <dataCardContext.Provider value={useDataCardState()}>{children}</dataCardContext.Provider>;
};
