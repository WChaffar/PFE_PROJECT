import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";

const TeamExpertisePie = ({ employeesExperienceMap }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const budgetProjectDataPie = [
    {
      id:
        "Expert (10+ years) : " +
        employeesExperienceMap?.expert +
        (employeesExperienceMap?.expert > 1 ? " Members" : " Member"),
      label: "Expert (10+ years)",
      value: employeesExperienceMap?.expert || 0,
      color: "#00FF00", // bright green
    },
    {
      id:
        "Proficient (5 to 10 years) : " +
        employeesExperienceMap?.proficient +
        (employeesExperienceMap?.proficient > 1 ? " Members" : " Member"),
      label: "Proficient (Advanced) — 5 to 10 years",
      value: employeesExperienceMap?.proficient || 0,
      color: "#0000FF", // blue
    },
    {
      id:
        "Competent (2 to 5 years) : " +
        employeesExperienceMap?.competent +
        (employeesExperienceMap?.competent > 1 ? " Members" : " Member"),
      label: "Competent (2 to 5 years)",
      value: employeesExperienceMap?.competent || 0,
      color: "#FFFF00", // yellow
    },
    {
      id:
        "Beginner (0 to 2 year) : " +
        employeesExperienceMap?.beginner +
        (employeesExperienceMap?.beginner > 1 ? " Members" : " Member"),
      label: "Beginner (0 to 2 year)",
      value: employeesExperienceMap?.beginner || 0,
      color: "black", // yellow
    },
  ];
  return (
    <div style={{ height: 230, width: "100%" }}>
      {((employeesExperienceMap?.expert !== undefined &&
        employeesExperienceMap?.expert !== 0) ||
        (employeesExperienceMap?.proficient !== undefined &&
          employeesExperienceMap?.proficient !== 0) ||
        (employeesExperienceMap?.competent !== undefined &&
          employeesExperienceMap?.competent !== 0) ||
        (employeesExperienceMap?.beginner !== undefined &&
          employeesExperienceMap?.beginner !== 0)) && (
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

export default TeamExpertisePie;
