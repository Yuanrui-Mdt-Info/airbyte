import { useState, useCallback, createContext, useContext } from "react";

import { ServiceFormValues } from "views/Connector/ServiceForm/types";

export interface SelectDefinition {
  definitionId: string;
  icon?: string;
  name: string;
}

export type DataCardContext = ReturnType<typeof useDataCardState>;
export const useDataCardState = () => {
  const [destinationServiceValues, setDestinationServiceValues] = useState<Partial<ServiceFormValues>>();
  const [sourceServiceValues, setSourceServiceValues] = useState<Partial<ServiceFormValues>>();
  const [selectSourceDefinition, setSourceSelectDefinition] = useState<SelectDefinition>({
    definitionId: "",
    icon: "",
    name: "",
  });

  const [selectDestinationDefinition, setDestinationSelectDefinition] = useState<SelectDefinition>({
    definitionId: "",
    icon: "",
    name: "",
  });

  const clearSourceServiceValues = useCallback(() => {
    setSourceServiceValues({});
  }, [setSourceServiceValues]);

  const clearDestinationServiceValues = useCallback(() => {
    setDestinationServiceValues({});
  }, [setDestinationServiceValues]);

  const clearSourceSelectDefinition = useCallback(() => {
    setSourceSelectDefinition({
      definitionId: "",
      icon: "",
      name: "",
    });
  }, [setSourceSelectDefinition]);

  const clearDestinationSelectDefinition = useCallback(() => {
    setDestinationSelectDefinition({
      definitionId: "",
      icon: "",
      name: "",
    });
  }, [setDestinationSelectDefinition]);

  return {
    selectSourceDefinition,
    selectDestinationDefinition,
    sourceServiceValues,
    destinationServiceValues,
    setSourceSelectDefinition,
    setDestinationSelectDefinition,
    clearSourceSelectDefinition,
    clearDestinationSelectDefinition,
    clearSourceServiceValues,
    clearDestinationServiceValues,
    setDestinationServiceValues,
    setSourceServiceValues,
  };
};

// @ts-expect-error Default value provided at implementation
export const dataCardContext = createContext<DataCardContext>();

export const useDataCardContext = () => useContext(dataCardContext);

export const DataCardProvider: React.FC = ({ children }) => {
  return <dataCardContext.Provider value={useDataCardState()}>{children}</dataCardContext.Provider>;
};
