import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

// Updated data matching your matplotlib chart
const data = [
  {
    id: "Developers",
    color: "hsl(211, 70%, 50%)", // matplotlib blue
    data: [
      { x: "Jan 2023", y: 2 },
      { x: "Apr 2023", y: 4 },
      { x: "Jul 2023", y: 6 },
      { x: "Oct 2023", y: 7 },
      { x: "Jan 2024", y: 9 },
      { x: "Apr 2024", y: 10 },
    ],
  },
  {
    id: "Designers",
    color: "hsl(32, 90%, 55%)", // matplotlib orange
    data: [
      { x: "Jan 2023", y: 1 },
      { x: "Apr 2023", y: 2 },
      { x: "Jul 2023", y: 2 },
      { x: "Oct 2023", y: 3 },
      { x: "Jan 2024", y: 3 },
      { x: "Apr 2024", y: 4 },
    ],
  },
  {
    id: "PMs",
    color: "hsl(145, 63%, 45%)", // matplotlib green
    data: [
      { x: "Jan 2023", y: 1 },
      { x: "Apr 2023", y: 1 },
      { x: "Jul 2023", y: 2 },
      { x: "Oct 2023", y: 2 },
      { x: "Jan 2024", y: 3 },
      { x: "Apr 2024", y: 4 },
    ],
  },
];

const TeamMembersEvolLineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <ResponsiveLine
      data={data}
      area={true} // 🔥 Area chart enabled
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={{ datum: "color" }} // Use per-series color
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true, // ✅ for stacking areas
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="monotoneX" // smooth like catmullRom
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Time",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Number of Team Members",
        legendOffset: -50,
        legendPosition: "middle",
      }}
      enableGridX={true}
      enableGridY={true}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ], 
        },
      ]}
    />
  );
};

export default TeamMembersEvolLineChart;
