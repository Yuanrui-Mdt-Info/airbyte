import React, { useMemo } from "react";
import { Bar, CartesianGrid, Label, ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Area } from "recharts";
import { barChartColors, theme } from "theme";

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  legendLabels: string[];
  xLabel?: string;
  yLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, legendLabels, xLabel, yLabel }) => {
  // const chartLinesColor = theme.backgroundColor;
  const chartTicksColor = theme.black300;
  const chartHoverFill = theme.grey100;
  // Function to create a custom rounded bar shape
  const RoundedTopBar = (props: any) => {
    const { x, y, width, height } = props;
    const radius = 5; // Adjust the radius for your desired roundness

    return (
      <path
        d={`M${x},${y + radius} 
         Q${x},${y} ${x + radius},${y} 
         H${x + width - radius} 
         Q${x + width},${y} ${x + width},${y + radius} 
         V${y + height} 
         H${x} 
         V${y + radius}`}
        fill={props.fill}
      />
    );
  };
  const width = useMemo(
    () => Math.min(Math.max([...data].sort((a, b) => b.value - a.value)[0].value.toFixed(0).length * 10, 80), 130),
    [data]
  );
  const formatYAxisLabel = (value: number) => {
    return `${value}K`;
  };

  return (
    <ResponsiveContainer width="100%">
      <ComposedChart data={data} width={500} height={400}>
        <CartesianGrid vertical={false} strokeDasharray="4" />
        <XAxis
          label={
            <Label
              value={xLabel}
              offset={0}
              position="insideBottom"
              fontSize={11}
              fill={chartTicksColor}
              fontWeight={600}
            />
          }
          dataKey="name"
          axisLine={false}
          tickLine={false}
          stroke={chartTicksColor}
          tick={{ fontSize: "11px" }}
          tickSize={7}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          stroke={chartTicksColor}
          tick={{ fontSize: "12px" }}
          tickSize={10}
          width={width}
          tickFormatter={formatYAxisLabel}
        >
          <Label value={yLabel} fontSize={11} fill={chartTicksColor} fontWeight={600} position="top" offset={10} />
        </YAxis>
        <Tooltip cursor={{ fill: chartHoverFill }} />
        <Area dataKey="value" fill="#eaf0ff" stroke="#eaf0ff" />
        {legendLabels.map((barName, key) => (
          <Bar
            key={barName}
            dataKey={barName}
            fill={barChartColors[key]}
            barSize={20}
            shape={<RoundedTopBar />}
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default React.memo(BarChart);
