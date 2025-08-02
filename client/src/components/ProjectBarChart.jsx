import { useRef, useState } from "react";
import { Box, IconButton, Stack, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { ResponsiveBar } from "@nivo/bar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Sample projects with varying progress
const data = [
  { project: "Alpha", progress: 90 },
  { project: "Beta", progress: 70 },
  { project: "Gamma", progress: 45 },
  { project: "Delta", progress: 30 },
  { project: "Epsilon", progress: 85 },
  { project: "Zeta", progress: 60 },
  { project: "Eta", progress: 15 },
  { project: "Theta", progress: 50 },
  { project: "Iota", progress: 95 },
  { project: "Kappa", progress: 20 },
  { project: "Lambda", progress: 65 },
];

const ProjectBarChart = ({ isDashboard = false, projectWorkload }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef = useRef(null);
  const [scrollPos, setScrollPos] = useState(0);

  const scrollAmount = 200;

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setScrollPos((pos) => Math.max(0, pos - scrollAmount));
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setScrollPos((pos) => pos + scrollAmount);
    }
  };

  // Color logic based on progress
  const getBarColor = (bar) => {
    const progress = bar.data.progress;
    if (progress >= 75) return "#4caf50"; // Green
    if (progress >= 40) return "#ffb300"; // Amber
    return "#e53935"; // Red
  };

  return (
    <Box>
       {/* Arrows for navigation */}
       <Stack direction="row" justifyContent="center" spacing={2} >
        <IconButton
          onClick={scrollLeft}
          sx={{
            backgroundColor: colors.primary[400],
            padding: "4px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: "20px" }} />
        </IconButton>
        <IconButton
          onClick={scrollRight}
          sx={{
            backgroundColor: colors.primary[400],
            padding: "4px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
          }}
        >
          <ChevronRightIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Stack>
      {/* Chart container with horizontal scroll */}
      <Box
        ref={containerRef}
        sx={{
          overflowX: "auto",
          width: "100%",
        }}
      >
        <Box sx={{ width: `${data.length * 90}px`, height: "200px" }}>
          <ResponsiveBar
            data={projectWorkload}
            keys={["progress"]}
            indexBy="project"
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={getBarColor}
            theme={{
              axis: {
                domain: { line: { stroke: colors.grey[100] } },
                legend: { text: { fill: colors.grey[100] } },
                ticks: {
                  line: { stroke: colors.grey[100], strokeWidth: 1 },
                  text: { fill: colors.grey[100] },
                },
              },
              legends: { text: { fill: colors.grey[100] } },
            }}
            borderColor={{
              from: "color",
              modifiers: [["darker", "1.6"]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Project",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Progress (%)",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            enableLabel={true}
            labelTextColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            role="application"
            barAriaLabel={(e) => `${e.indexValue}: ${e.value}% complete`}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectBarChart;
