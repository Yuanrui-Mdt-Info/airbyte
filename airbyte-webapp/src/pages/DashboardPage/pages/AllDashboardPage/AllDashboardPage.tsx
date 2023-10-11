import { Box, Grid, Typography, MenuItem, FormControl, InputAdornment, OutlinedInput, Button } from "@mui/material";
import Select from "@mui/material/Select";
import { DateRange, DateRangeCalendar, LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { Pie, PieChart, Cell } from "recharts";
import styled from "styled-components";

import { MainPageWithScroll, PageTitle } from "components";
import BarChart from "components/DashboardBarChart";
import HeadTitle from "components/HeadTitle";
import { ArrowIcon } from "components/icons/ArrowIcon";
import { CalendarTwoIcon } from "components/icons/CalendarIconTwo";
import { DatabaseIcon } from "components/icons/DatabaseIcon";
import { FilterIcon } from "components/icons/FilterIcon";
import { InboxIcon } from "components/icons/InboxIcon";
import { TickIcon } from "components/icons/TickIcon";

import { PageTrackingCodes, useTrackPage } from "hooks/services/Analytics";

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
const ChartWrapper = styled.div`
  width: 100%;
  height: 520px;
  padding: 0 50px 24px 0;
`;
const AllDashboardPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.CONNECTIONS_LIST);
  const [dataDate, setDataDate] = useState("30d");
  const [sourceData, setSourceData] = useState("All sources");
  const [destinationData, setDestinationData] = useState("All destinations");
  const [isBothDatesSelected, setIsBothDatesSelected] = useState(false);

  const [isDateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [value, setValue] = useState<DateRange<Dayjs>>([
    dayjs().subtract(7, "days"), // Start date (e.g., 7 days ago)
    dayjs(), // End date (current date)
  ]);
  const [selectDate, setSelectDate] = useState([
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
      label: "Year to date",
      value: "year to date",
    },
    {
      label: "All time",
      value: "all",
    },
    {
      label: `Custom`,
      value: `custom`,
    },
  ]);

  const allSources = [
    { label: "All sources", value: "All sources" },
    {
      label: "Amazon Ads",
      value: "Amazon Ads",
    },
    {
      label: "Amazon Seller Partner",
      value: "Amazon Seller Partner",
    },
    {
      label: "MySQL",
      value: "MySQL",
    },
  ];
  const allDestinations = [
    { label: "All destinations", value: "All destinations" },
    {
      label: "BigQuery",
      value: "BigQuery",
    },
    {
      label: "MySQL",
      value: "MySQL",
    },
    {
      label: "Snowflake",
      value: "Snowflake",
    },
  ];
  const dataBarChart = [
    { name: "24 May", value: 100 },
    { name: "25 May", value: 250 },
    { name: "26 May", value: 190 },
    { name: "27 May", value: 220 },
    { name: "28 May", value: 280 },
    { name: "30 May", value: 250 },
    { name: "28 May", value: 250 },
    { name: "3 Jun", value: 200 },
    { name: "4 Jun", value: 300 },
    { name: "5 Jun", value: 310 },
    { name: "6 Jun", value: 320 },
    { name: "7 Jun", value: 380 },
    { name: "8 Jun", value: 288 },
    { name: "9 Jun", value: 194 },
    { name: "10 Jun", value: 267 },
    { name: "11 Jun", value: 200 },
    { name: "12 Jun", value: 400 },
    { name: "13 Jun", value: 600 },
    { name: "13 Jun", value: 800 },
  ];
  const LegendLabels = ["value"];

  const handleDateChange = (e: any) => {
    console.log(e, "Target");
    const selectedValue = e.target.value;
    if (selectedValue !== "custom") {
      setDataDate(selectedValue);
      setDateRangePickerOpen(false);
    } else {
      setDateRangePickerOpen(true);
    }
  };
  const handleSourceChange = (e: any) => {
    setSourceData(e.target.value);
  };
  const handleDestinationChange = (e: any) => {
    setDestinationData(e.target.value);
  };
  const handleCustomDateRangeChange = (newValue: DateRange<Dayjs> | null) => {
    if (newValue) {
      setValue(newValue);

      const formattedStartDate = newValue[0]?.format("YYYY-MM-DD");
      const formattedEndDate = newValue[1]?.format("YYYY-MM-DD");
      if (formattedStartDate !== undefined && formattedEndDate !== undefined) {
        const formattedDateRange = `${formattedStartDate} - ${formattedEndDate}`;
        setIsBothDatesSelected(false);
        setDataDate(`${formattedDateRange}`);
      }
    }
  };
  const handleDone = () => {
    setSelectDate([...selectDate, { label: `${dataDate}`, value: `${dataDate}` }]);
    setDateRangePickerOpen(false);
  };
  const handleClear = () => {
    setDataDate("30d");
    setDateRangePickerOpen(false);
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
                            color: "white",
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
                        return (
                          <MenuItem value={data.value} key={data.value}>
                            {data.label}
                            {data?.value === dataDate && (
                              <span style={{ marginLeft: "auto" }}>
                                <TickIcon color="white" />
                              </span>
                            )}
                          </MenuItem>
                        );
                      })}
                    </CustomSelect>
                  </FormControl>
                  {isDateRangePickerOpen && (
                    <>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box>
                          <DateRangeCalendar
                            value={value}
                            onChange={(newValue) => {
                              setValue(newValue);
                              handleCustomDateRangeChange(newValue);
                            }}
                            sx={{
                              "& .MuiPickersDay-root": {
                                "&.Mui-selected": {
                                  backgroundColor: "#4F46E5 !important",
                                },
                              },
                            }}
                          />
                        </Box>
                      </LocalizationProvider>
                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          sx={{ backgroundColor: "#EDF2F7", color: "#2D3748", borderColor: "#EDF2F7" }}
                          onClick={handleClear}
                        >
                          Clear
                        </Button>
                        <Box ml={2}>
                          <Button
                            variant="contained"
                            sx={{ backgroundColor: "#4F46E5", color: "white", borderColor: "#4F46E5" }}
                            onClick={handleDone}
                            disabled={isBothDatesSelected || dataDate === "30d"}
                          >
                            Done
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
                <Box>
                  <FormControl size="medium" fullWidth>
                    <CustomSelect
                      value={sourceData}
                      MenuProps={{
                        sx: {
                          "&& .Mui-selected": {
                            backgroundColor: "#4F46E5 !important",
                            color: "white",
                          },
                        },
                      }}
                      onChange={handleSourceChange}
                      name="sourceData"
                      input={<OutlinedInput notched={false} />}
                      inputProps={{ "aria-label": "Without label" }}
                      startAdornment={
                        <InputAdornment position="start">
                          <FilterIcon />
                        </InputAdornment>
                      }
                    >
                      {allSources?.map((source) => {
                        return (
                          <MenuItem value={source.value} key={source.value}>
                            {source.label}{" "}
                            {source?.value === sourceData && (
                              <span style={{ marginLeft: "auto" }}>
                                <TickIcon color="white" />
                              </span>
                            )}
                          </MenuItem>
                        );
                      })}
                    </CustomSelect>
                  </FormControl>
                </Box>
                <Box>
                  <FormControl size="medium" fullWidth>
                    <CustomSelect
                      value={destinationData}
                      MenuProps={{
                        sx: {
                          "&& .Mui-selected": {
                            backgroundColor: "#4F46E5 !important",
                            color: "white",
                          },
                        },
                      }}
                      onChange={handleDestinationChange}
                      name="destinationData"
                      input={<OutlinedInput notched={false} />}
                      inputProps={{ "aria-label": "Without label" }}
                      startAdornment={
                        <InputAdornment position="start">
                          <FilterIcon />
                        </InputAdornment>
                      }
                    >
                      {allDestinations?.map((dest) => {
                        return (
                          <MenuItem value={dest.value} key={dest.value}>
                            {dest.label}{" "}
                            {dest?.value === destinationData && (
                              <span style={{ marginLeft: "auto" }}>
                                <TickIcon color="white" />
                              </span>
                            )}
                          </MenuItem>
                        );
                      })}
                    </CustomSelect>
                  </FormControl>
                </Box>
              </Box>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <ChartWrapper>
                <BarChart data={dataBarChart} legendLabels={LegendLabels} />
              </ChartWrapper>
            </Grid>
          </Grid>
        </BarCard>
      </Box>
    </MainPageWithScroll>
  );
};
export default AllDashboardPage;
