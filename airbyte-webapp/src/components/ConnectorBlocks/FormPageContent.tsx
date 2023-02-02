import styled from "styled-components";

const FormPageContent = styled.div<{ big?: boolean }>`
  width: 94%;
  max-width: ${({ big }) => (big ? 1279 : 813)}px;
  // margin: 13px auto;
  margin: 34px auto;
`;

export default FormPageContent;
