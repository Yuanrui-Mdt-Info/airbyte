import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button, MainPageWithScroll } from "components";
import HeadTitle from "components/HeadTitle";
import PageTitle from "components/PageTitle";

import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useDestinationList } from "hooks/services/useDestinationHook";
import useRouter from "hooks/useRouter";

import DestinationsTable from "./components/DestinationsTable";
import { RoutePaths } from "../../../routePaths";

const BtnInnerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 4px;
`;

const BtnIcon = styled(FontAwesomeIcon)`
  font-size: 16px;
  margin-right: 10px;
`;

const BtnText = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
`;

const AllDestinationsPage: React.FC = () => {
  const { push } = useRouter();
  const { destinations } = useDestinationList();

  useTrackPage(PageTrackingCodes.DESTINATION_LIST);

  const onCreateDestination = () => push(`${RoutePaths.SelectDestination}`);

  if (destinations.length === 0) {
    onCreateDestination();
    return null;
  }

  return (
    <MainPageWithScroll
      headTitle={<HeadTitle titles={[{ id: "admin.destinations" }]} />}
      pageTitle={
        <PageTitle
          withPadding
          title=""
          endComponent={
            <Button onClick={onCreateDestination} data-id="new-destination">
              <BtnInnerContainer>
                <BtnIcon icon={faPlus} />
                <BtnText>
                  <FormattedMessage id="destinations.newDestination" />
                </BtnText>
              </BtnInnerContainer>
            </Button>
          }
        />
      }
    >
      <DestinationsTable destinations={destinations} />
    </MainPageWithScroll>
  );
};

export default AllDestinationsPage;
