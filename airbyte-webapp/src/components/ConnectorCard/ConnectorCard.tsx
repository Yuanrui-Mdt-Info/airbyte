import styled from "styled-components";

import { ReleaseStageBadge } from "components/ReleaseStageBadge";

import { ReleaseStage } from "core/request/AirbyteClient";
import { getIcon } from "utils/imageUtils";

interface Props {
  connectionName: string;
  icon?: string;
  connectorName: string;
  releaseStage?: ReleaseStage;
}

const MainComponent = styled.div`
  display: flex;
  padding: 10px;
  width: 100%;
  align-items: center;
`;

const Details = styled.div`
  flex: 1;
  margin-left: 22px;
  display: flex;
  flex-direction: column;
  font-weight: normal;
`;

const EntityIcon = styled.div`
  width: 96px;
  height: 96px;
  box-shadow: 0px 10px 12px rgba(74, 74, 87, 0.1);
  border-radius: 18px;
  padding: 6px;
  box-sizing: border-box;
  @media (max-width: 600px) {
    width: 60px;
    height: 60px;
  }
`;

const ConnectionName = styled.div`
  font-size: 16px;
  text-align: left;
  margin-right: 10px;
  font-weight: 500;
  line-height: 30px;
  color: #27272a;
`;

const ConnectorDetails = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const ConnectorName = styled.div`
  font-size: 14px;
  margin-top: 10px;
  color: #999999;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ConnectorCard = (props: Props) => {
  const { connectionName, icon, releaseStage, connectorName } = props;

  return (
    <MainComponent>
      {icon && <EntityIcon>{getIcon(icon)}</EntityIcon>}
      <Details>
        <ConnectorDetails>
          <ConnectionName>{connectionName}</ConnectionName>
          {releaseStage && <ReleaseStageBadge stage={releaseStage} />}
        </ConnectorDetails>
        <ConnectorName>{connectorName}</ConnectorName>
      </Details>
    </MainComponent>
  );
};

export default ConnectorCard;
