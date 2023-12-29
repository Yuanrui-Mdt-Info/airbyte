import React from "react";

// import { ImplementationTable } from "components/EntityTable";
import SourceTable from "components/EntityTable/SourceTable";
import { SourceTableDataItem } from "components/EntityTable/types";
// import { EntityTableDataItem } from "components/EntityTable/types";
// import { getEntityTableData } from "components/EntityTable/utils";

import { SourceRead } from "core/request/AirbyteClient";
// import { useConnectionList } from "hooks/services/useConnectionHook";
import useRouter from "hooks/useRouter";

// import { useSourceDefinitionList } from "../../../../../services/connector/SourceDefinitionService";

interface SourcesTableProps {
  sources: SourceRead[];
  setSortFieldName?: any;
  setSortDirection?: any;
  onSelectFilter?: any;
}

const SourcesTable: React.FC<SourcesTableProps> = ({ sources, setSortFieldName, setSortDirection, onSelectFilter }) => {
  const { push } = useRouter();

  // const { connections } = useConnectionList();
  // const { sourceDefinitions } = useSourceDefinitionList();
  // console.log("sources", sources);
  // const data = getEntityTableData(sources, connections, sourceDefinitions, "source");
  // console.log(data, "Data");
  // const clickRow = (source: EntityTableDataItem) => push(`${source.entityId}`);
  const clickRow = (source: SourceTableDataItem) => push(`${source.sourceId}`);
  return (
    <SourceTable
      data={sources}
      onClickRow={clickRow}
      entity="source"
      setSortFieldName={setSortFieldName}
      setSortDirection={setSortDirection}
      onSelectFilter={onSelectFilter}
    />
  );
};

export default SourcesTable;
