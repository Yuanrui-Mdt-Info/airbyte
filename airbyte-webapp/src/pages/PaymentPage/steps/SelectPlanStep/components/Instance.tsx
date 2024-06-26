import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup } from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import styled from "styled-components";

import { ProductOptionItem } from "core/domain/product";

interface IProps {
  productOptions?: ProductOptionItem[];
  product?: ProductOptionItem;
  setProduct?: (item: ProductOptionItem) => void;
  // selectedProduct?: any;
  mode?: boolean;
  setCloudProvider?: any;
  cloudProvider?: string;
  handleInstanceSelect?: any;
  regions?: any;
  cloudItemId?: string;
  setCloudItemId?: any;
  setSelectedRegion?: any;
  setSelectedInstance?: any;
  selectedRegion?: any;
  instance?: any;
  packages?: any;
  selectedInstance?: any;
  setCloudPackageId?: any;
  setPrice?: any;
  instanceSelected?: boolean;
  setInstanceSelected?: any;
  regionScrollRef?: any;
  setJobs?: any;
}

const Title = styled.div`
  font-weight: 500;
  font-size: 18px;
  color: ${({ theme }) => theme.black300};
`;
const TitleB = styled.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #999999;
`;
// const DeployContainer = styled.div`
//   padding: 50px;
// `;

const CardContainer = styled.div`
  padding: 20px 20px 50px;
  background: #ffffff;
  border-radius: 16px;
`;

const Instance: React.FC<IProps> = ({
  // regions,
  setPrice,
  setSelectedInstance,
  // cloudProvider,
  selectedRegion,
  instance,
  packages,
  selectedInstance,
  cloudItemId,
  setCloudPackageId,
  // selectedProduct,
  setInstanceSelected,
  setJobs,
  regionScrollRef,
}) => {
  const { formatMessage } = useIntl();

  return (
    <CardContainer ref={regionScrollRef}>
      <Grid container spacing={2}>
        <Grid item lg={12} md={12} sm={12} xs={12}>
          <Box pl={4} pt={4}>
            <Title>
              <FormattedMessage id="plan.instanceSize" />
            </Title>
          </Box>
          <Box pl={4} pt={2}>
            <Box padding="0px 5px 0px">
              <TitleB>
                <FormattedMessage id="plan.instancedesc" />
              </TitleB>
            </Box>
          </Box>
        </Grid>

        {instance?.length > 0 ? (
          <>
            {instance?.map((inst: any) => {
              return (
                <Grid item lg={3} md={3} sm={6} xs={12} key={inst?.instanceItemId} className="col-span-1">
                  <Box pt={2} pl={5}>
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name={inst?.instanceSizeName}
                      >
                        <FormControlLabel
                          value={inst?.instanceItemId}
                          control={
                            <Radio
                              onChange={(e) => {
                                setSelectedInstance(e.target.value);
                                const selectedPackage = packages?.find((p: any) => {
                                  return (
                                    p?.cloudItemId === cloudItemId &&
                                    p?.regionItemId === selectedRegion &&
                                    p?.instanceItemId === e.target.value
                                  );
                                });

                                if (selectedPackage) {
                                  setInstanceSelected(true);
                                  setJobs(inst?.noOfJobs);
                                  setPrice(selectedPackage?.price);
                                  setCloudPackageId(selectedPackage?.cloudPackageId);
                                  setInstanceSelected(true);
                                } else {
                                  setInstanceSelected(false);
                                }
                                // setInstanceSelected(true);
                                // setJobs(inst?.noOfJobs);
                              }}
                              sx={{
                                "&.Mui-checked": {
                                  color: "#4F46E5",
                                },
                                "&.Mui-disabled": {
                                  color: "#AAAAAA",
                                },
                              }}
                              checked={selectedInstance === inst?.instanceItemId}
                              // disabled={
                              //   selectedProduct?.instanceItemId === inst?.instanceItemId &&
                              //   selectedProduct?.instanceItemId === selectedInstance
                              // }
                            />
                          }
                          label={
                            <span
                              style={{
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {`${inst?.instanceSizeName} (${inst?.noOfJobs} ${formatMessage({ id: "plan.jobs" })})`}
                            </span>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Grid>
              );
            })}
          </>
        ) : null}
      </Grid>
    </CardContainer>
  );
};

export default Instance;
