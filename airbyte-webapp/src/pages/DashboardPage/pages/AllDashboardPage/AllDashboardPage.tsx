import { Box, Grid, Typography, MenuItem, FormControl, InputAdornment, OutlinedInput } from "@mui/material";
import Select from "@mui/material/Select";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { useState } from "react";
import { Pie, PieChart, Cell } from "recharts";
import styled from "styled-components";

import { MainPageWithScroll, PageTitle } from "components";
import HeadTitle from "components/HeadTitle";
import { ArrowIcon } from "components/icons/ArrowIcon";
import { CalendarTwoIcon } from "components/icons/CalendarIconTwo";
import { DatabaseIcon } from "components/icons/DatabaseIcon";
import { InboxIcon } from "components/icons/InboxIcon";

import { PageTrackingCodes, useTrackPage } from "hooks/services/Analytics";
// ../../../../../public/downArrow.svg
const CustomSelect = styled(Select)`
  width: 100%;
  height: 52px !important;
  background: #ffffff;
  border-radius: 6px !important;

  .MuiSelect-icon {
    background-position: center;
    background-repeat: no-repeat;
    object-fit: cover;
    padding-right: 24px;
    background-image: url("/downArrow.svg");
  }
  &:hover {
    border: 1px solid #d1d5db !important;
  }
`;

const TotalRowsCard = styled.div`
  width: 100%;
  height: 250px;
  border-radius: 22px;
  background: linear-gradient(285deg, #4f46e5 0%, #52c1ff 100%);
`;
const TotalRowsSecondCard = styled.div`
  width: 100%;
  height: 240px;
  border-radius: 22px;
  background: #fff;
`;
const TotalRowsSecondCardContainer = styled.div`
  width: 100%;
  padding-left: 20px; /* Add left padding */
  padding-right: 20px; /* Add right padding */
`;
const ConnectionCard = styled.div`
  width: 100%;
  height: 212px;
  border-radius: 22px;
  background-image: url("/connectionCard.svg");
  background-size: cover;
`;
const SourceCard = styled.div`
  width: 100%;
  height: 212px;
  border-radius: 22px;
  background-image: url("/sourceCard.svg");
  background-size: cover;
`;
const DestinationCard = styled.div`
  width: 100%;
  height: 212px;
  border-radius: 22px;
  background-image: url("/destinationCard.svg");
  background-size: cover;
`;
const BarCard = styled.div`
width:100%,
height:640px;
border-radius:22px;
background:#FFF;
`;
const selectDate = [
  {
    label: "Last 7 days",
    value: "7d",
  },
  {
    label: "Last 30 days",
    value: "30d",
  },
  {
    label: "Last 90 days",
    value: "90d",
  },
  {
    label: "All time",
    value: "all",
  },
  {
    label: "Custom",
    value: "custom",
  },
];
const AllDashboardPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.CONNECTIONS_LIST);
  const [dataDate, setDataDate] = useState("30d");

  const [isDateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleDateChange = (e: any) => {
    const selectedValue = e.target.value;
    setDataDate(selectedValue);
    if (selectedValue === "custom") {
      setDateRangePickerOpen(true);
    } else {
      setDateRangePickerOpen(false);
    }
  };
  return (
    <MainPageWithScroll
      withPadding
      headTitle={<HeadTitle titles={[{ id: "admin.dashboard" }]} />}
      pageTitle={<PageTitle withPadding title="" />}
    >
      {" "}
      <Grid container spacing={2}>
        <Grid item lg={5} md={12} sm={12} xs={12}>
          <TotalRowsCard>
            <Grid container spacing={2}>
              <Grid item lg={4} md={4} sm={4} xs={4}>
                <Box pl={5} pt={3}>
                  <PieChart width={900} height={250}>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: "Category A", value: 300 },
                        { name: "Category B", value: 250 },
                      ]}
                      cx={50}
                      cy={50}
                      outerRadius={40}
                      innerRadius={25} // Set an inner radius to create a "donut" style
                      paddingAngle={0}
                      startAngle={90} // Start angle for the half-white side
                      endAngle={-270} // Start angle for the half-white side
                    >
                      <Cell fill="#FFF" />
                      <Cell fill="#74bbfb" />
                    </Pie>
                  </PieChart>
                </Box>
              </Grid>
              <Grid item lg={8} md={8} sm={8} xs={8}>
                <Box pt={4}>
                  {" "}
                  <Box>
                    {" "}
                    <Typography
                      fontSize={{ lg: 40, md: 40, sm: 35, xs: 25 }}
                      color="#FFF"
                      fontWeight={700}
                      fontFamily="Inter"
                    >
                      400,000
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    fontSize={{ lg: 16, md: 16, sm: 16, xs: 14 }}
                    fontFamily="Inter"
                    color="#D1D5DB"
                    fontWeight={400}
                  >
                    total rows processed during
                    <br /> the current billing cycle
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TotalRowsCard>
        </Grid>
        <Grid item lg={7} md={12} sm={12} xs={12}>
          <Box pt={{ md: 2, sm: 2 }}>
            {" "}
            <TotalRowsSecondCard>
              <TotalRowsSecondCardContainer>
                <Grid container spacing={2}>
                  <Grid item lg={4} md={4} sm={4} xs={4}>
                    <ConnectionCard>
                      <Box pl={2} pt={2} display="flex" flexDirection="column">
                        <Box sx={{ borderRadius: "8px", backgroundColor: "#FEB26F", height: "46px", width: "46px" }}>
                          <Box textAlign="center" pt="10px">
                            <ArrowIcon width={20} height={20} color="none" />
                          </Box>
                        </Box>
                        <Box pt={3}>
                          <Typography
                            fontSize={{ lg: 40, md: 40, sm: 35, xs: 25 }}
                            fontWeight={700}
                            color="#27272A"
                            fontFamily="Inter"
                          >
                            15
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            fontSize={{ lg: 16, md: 16, sm: 16, xs: 14 }}
                            fontWeight={400}
                            color="#6B6B6F"
                            fontFamily="Inter"
                          >
                            total connections
                          </Typography>
                        </Box>
                      </Box>
                    </ConnectionCard>
                  </Grid>
                  <Grid item lg={4} md={4} sm={4} xs={4}>
                    <SourceCard>
                      <Box pl={2} pt={2} display="flex" flexDirection="column">
                        {" "}
                        <Box sx={{ borderRadius: "8px", backgroundColor: "#9371FA", height: "46px", width: "46px" }}>
                          <Box textAlign="center" pt="12px">
                            {" "}
                            <InboxIcon color="none" />
                          </Box>
                        </Box>
                        <Box pt={3}>
                          <Typography
                            fontSize={{ lg: 40, md: 40, sm: 35, xs: 25 }}
                            fontWeight={700}
                            color="#27272A"
                            fontFamily="Inter"
                          >
                            10
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            fontSize={{ lg: 16, md: 16, sm: 16, xs: 14 }}
                            fontWeight={400}
                            color="#6B6B6F"
                            fontFamily="Inter"
                          >
                            data sources
                            <br /> connected
                          </Typography>
                        </Box>
                      </Box>
                    </SourceCard>
                  </Grid>
                  <Grid item lg={4} md={4} sm={4} xs={4}>
                    <DestinationCard>
                      <Box pl={2} pt={2} display="flex" flexDirection="column">
                        {" "}
                        <Box sx={{ borderRadius: "8px", backgroundColor: "#6B9EFF", height: "46px", width: "46px" }}>
                          <Box textAlign="center" pt="12px">
                            {" "}
                            <DatabaseIcon color="none" />
                          </Box>
                        </Box>
                        <Box pt={3}>
                          <Typography
                            fontSize={{ lg: 40, md: 40, sm: 35, xs: 25 }}
                            fontWeight={700}
                            color="#27272A"
                            fontFamily="Inter"
                          >
                            2
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            fontSize={{ lg: 16, md: 16, sm: 16, xs: 14 }}
                            fontWeight={400}
                            color="#6B6B6F"
                            fontFamily="Inter"
                          >
                            data destinations
                            <br /> connected
                          </Typography>
                        </Box>
                      </Box>
                    </DestinationCard>
                  </Grid>
                </Grid>
              </TotalRowsSecondCardContainer>
            </TotalRowsSecondCard>
          </Box>
        </Grid>
      </Grid>
      <Box pt={5}>
        <BarCard>
          <Grid container spacing={2}>
            <Grid item lg={4} md={4} sm={12} xs={12}>
              <Box pl={2}>
                {" "}
                <Typography
                  fontSize={{ lg: 22, md: 22, sm: 18, xs: 16 }}
                  fontWeight={500}
                  fontFamily="Inter"
                  color="#27272A"
                >
                  No. of rows processed
                </Typography>
              </Box>
            </Grid>
            <Grid item lg={8} md={8} sm={12} xs={12}>
              <Box display="flex" justifyContent="space-evenly">
                <Box>
                  {" "}
                  <FormControl size="medium" fullWidth>
                    <CustomSelect
                      value={dataDate}
                      MenuProps={{
                        sx: {
                          "&& .Mui-selected": {
                            backgroundColor: "#4F46E5 !important",
                          },
                        },
                      }}
                      onChange={handleDateChange}
                      name="dataDate"
                      input={<OutlinedInput notched={false} />}
                      inputProps={{ "aria-label": "Without label" }}
                      startAdornment={
                        <InputAdornment position="start">
                          <CalendarTwoIcon />
                        </InputAdornment>
                      }
                    >
                      {selectDate?.map((data) => {
                        return <MenuItem value={data.value}>{data.label}</MenuItem>;
                      })}
                    </CustomSelect>
                  </FormControl>
                  {isDateRangePickerOpen && (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateRangePicker
                        value={[startDate, endDate]}
                        onChange={(newValue: any) => {
                          setStartDate(newValue[0]);
                          setEndDate(newValue[1]);
                        }}
                        open={isDateRangePickerOpen}
                      />
                    </LocalizationProvider>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </BarCard>
      </Box>
    </MainPageWithScroll>
  );
};
export default AllDashboardPage;
