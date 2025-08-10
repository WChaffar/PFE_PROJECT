import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";

const ProjectBudgetProgressPie = ({ projectBudgetDays }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const budgetProjectDataPie = [
    {
      id: "Amount Spent from Initial Budget  : " + projectBudgetDays?.budgetAmountUsed || 0,
      label: "Amount Spent from Initial Budget",
      value: projectBudgetDays?.budgetAmountUsed || 0,
      color: "#00FF00", // bright green
    },
    {
      id: "Remaining Budget : " +  projectBudgetDays?.remainingBudget || 0,
      label: "Remaining Budget",
      value: projectBudgetDays?.remainingBudget || 0,
      color: "#0000FF", // blue
    },
    {
      id: "Additional Funding : " + projectBudgetDays?.additionalFunding || 0,
      label: "Additional Funding",
      value: projectBudgetDays?.additionalFunding || 0,
      color: "#FFFF00", // yellow
    },
    {
      id:  "Exceeding the initial budget : " +  projectBudgetDays?.exceedingInitialBudget || 0,
      label: "Exceeding the initial budget",
      value: projectBudgetDays?.exceedingInitialBudget || 0,
      color: "red", // yellow
    },
    {
      id: "Initial full budget : " + projectBudgetDays?.fullBudget || 0,
      label: "Initial full budget",
      value: projectBudgetDays?.fullBudget || 0,
      color: "black", // yellow
    },
  ];
  return (
    <div style={{ height: 230, width: "100%" }}>
      {((projectBudgetDays?.budgetAmountUsed !== undefined &&
        projectBudgetDays?.budgetAmountUsed !== 0) ||
        (projectBudgetDays?.remainingBudget !== undefined &&
          projectBudgetDays?.remainingBudget !== 0) ||
        (projectBudgetDays?.additionalFunding !== undefined &&
          projectBudgetDays?.additionalFunding !== 0) ||
        (projectBudgetDays?.exceedingInitialBudget !== undefined &&
          projectBudgetDays?.exceedingInitialBudget !== 0) ||
        (projectBudgetDays?.fullBudget !== undefined &&
          projectBudgetDays?.exceedingInitialBudget !== 0)) && (
        <ResponsivePie
          data={budgetProjectDataPie}
          colors={{ datum: "data.color" }}
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
          }}
          margin={{ top: 40, right: 0, bottom: 80, left: 0 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={colors.grey[100]}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          enableArcLabels={false}
          arcLabel={(e) => `${e.value} Days`}
          arcLabelsRadiusOffset={0.4}
          arcLabelsSkipAngle={7}
          arcLabelsTextColor={{
            from: "color",
            modifiers: [["darker", 2]],
          }}
          // legends={[
          //   {
          //     anchor: "bottom",
          //     direction: "column",
          //     justify: false,
          //     translateX: -200,
          //     translateY: 56,
          //     itemsSpacing: 10,
          //     itemWidth: 140,
          //     itemHeight: 18,
          //     itemTextColor: "#999",
          //     itemDirection: "left-to-right",
          //     itemOpacity: 1,
          //     symbolSize: 18,
          //     symbolShape: "circle",
          //     effects: [
          //       {
          //         on: "hover",
          //         style: {
          //           itemTextColor: "#000",
          //         },
          //       },
          //     ],
          //   },
          // ]}
        />
      )}
    </div>
  );
};

export default ProjectBudgetProgressPie;
