import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { BigButton } from "components/CenteredPageComponents";
import HeadTitle from "components/HeadTitle";

import TitlesBlock from "pages/OnboardingPage/components/TitlesBlock";
import { RoutePaths } from "pages/routePaths";

interface EmptyResourceListViewProps {
  resourceType: "connections" | "destinations" | "sources";
  onCreateClick: () => void;
  disableCreateButton?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #212946;
`;

const IllustrationContainer = styled(Container)`
  position: relative;
  width: 700px;
  height: 276px;

  pointer-events: none;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.lightTextColor};
  margin-top: 50px;
`;

const ButtonContainer = styled.div`
  padding: 18px;
  background-color: #2a2f66;
  border-radius: 60px;
  margin: 70px 0 50px 0;
`;
const Badge = styled.div`
  padding: 20px 23px;
  border-radius: 10px 10px 0px 1px;
  background: var(--Surface, #fff);
  color: var(--text-normal, #27272a);
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  position: absolute;
  top: 50%;
  right: -61px;
  transform: translate(0, -50%) rotate(-90deg);
`;

export const EmptyResourceListView: React.FC<EmptyResourceListViewProps> = React.memo(
  ({ resourceType, onCreateClick }) => {
    const {} = useMemo(() => {
      const singularResourceType = resourceType.substring(0, resourceType.length - 1);
      const baseMessageId = resourceType === "connections" ? singularResourceType : resourceType;

      const headingMessageId = `${baseMessageId}.description`;
      const buttonMessageId = `${baseMessageId}.new${
        singularResourceType.substring(0, 1).toUpperCase() + singularResourceType.substring(1)
      }`;

      return { headingMessageId, buttonMessageId, singularResourceType };
    }, [resourceType]);
    const navigate = useNavigate();
    const getPageTitle = (resourceType: "connections" | "destinations" | "sources"): string => {
      switch (resourceType) {
        case "connections":
          return "admin.dashboard";

        case "sources":
          return "admin.sources";

        case "destinations":
          return "admin.destinations";

        default:
          return "admin.dashboard";
      }
    };

    return (
      <Container>
        {" "}
        <Badge
          style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "flex-end",
            flexDirection: "column",
            gap: "8px",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/${RoutePaths.OnBoarding}`, { replace: true })}
        >
          Onboarding
        </Badge>
        <HeadTitle titles={[{ id: getPageTitle(resourceType) }]} />
        <TitlesBlock testId="onboarding.welcome" title={<FormattedMessage id="onboarding.welcome" />}>
          <FormattedMessage
            id="onboarding.welcomeUser.text"
            values={{
              b: (b: React.ReactNode) => (
                <>
                  <b>{b}</b>
                  <br />
                </>
              ),
            }}
          />
        </TitlesBlock>
        <IllustrationContainer>
          <img
            src="/daspireDashboard.png"
            alt="logo"
            style={{ maxWidth: "100%", height: "auto", objectFit: "cover" }}
          />
        </IllustrationContainer>
        <ButtonContainer>
          <BigButton shadow onClick={onCreateClick}>
            <FormattedMessage id="onboarding.firstConnection" />
          </BigButton>
        </ButtonContainer>
      </Container>
    );
  }
);
