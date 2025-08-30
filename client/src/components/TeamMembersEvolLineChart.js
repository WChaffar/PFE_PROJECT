import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { useEffect, useRef, useState } from "react";

const TeamMembersEvolLineChart = ({
  isCustomLineColors = false,
  isDashboard = false,
  data,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Générer des couleurs uniques automatiquement pour chaque série
  const generateColors = (series) => {
    const colors = {};
    const hueStep = 360 / series.length;
    series.forEach((serie, index) => {
      colors[serie.id] = `hsl(${index * hueStep}, 70%, 50%)`;
    });
    return colors;
  };

  const seriesColors = generateColors(data);

  const [activeSlice, setActiveSlice] = useState(null);
  const tooltipRef = useRef(null);

  // Fermer le tooltip au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setActiveSlice(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "250px",
        overflowX: "auto",
        overflowY: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: `${Math.max(data.length * 20, 250)}px`,
        }}
      >
        <ResponsiveLine
          data={data}
          area={true}
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
            tooltip: { container: { display: "none" } }, // désactive le tooltip par défaut
          }}
          colors={(d) => seriesColors[d.id]} // couleur unique par série
          margin={{ top: 50, right: 250, bottom: 60, left: 80 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
          yFormat=" >-.2f"
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: isDashboard ? undefined : "Time",
            legendOffset: 46,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? undefined : "Number of Team Members",
            legendOffset: -60,
            legendPosition: "middle",
            tickValues: 1,
          }}
          enableGridX={true}
          enableGridY={true}
          pointSize={6}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          useMesh={true}
          enableSlices="x"
          layers={[
            "grid",
            "markers",
            "areas",
            "lines",
            "points",
            "axes",
            "legends",
            // Layer custom pour afficher tooltip au clic
            ({ slices }) =>
              slices.map((slice) => (
                <g key={slice.id}>
                  <rect
                    x={slice.points[0].x - 10}
                    y={0}
                    width={20}
                    height="100%"
                    fill="transparent"
                    onClick={() => setActiveSlice(slice)}
                    style={{ cursor: "pointer" }}
                  />
                  {activeSlice && activeSlice.id === slice.id && (
                    <foreignObject
                      x={slice.points[0].x + 10}
                      y={slice.points[0].y - 80}
                      width={200}
                      height={200}
                    >
                      <div
                        ref={tooltipRef}
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          padding: "10px",
                          background: "#fff",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          color: "#000",
                        }}
                      >
                        <strong>{slice.points[0].data.xFormatted}</strong>
                        {slice.points.map((point) => (
                          <div key={point.id} style={{ marginTop: 4 }}>
                            <span
                              style={{
                                color: seriesColors[point.serieId],
                                fontWeight: "bold",
                              }}
                            >
                              {point.serieId}:
                            </span>{" "}
                            {Math.round(point.data.y)}{" "}
                          </div>
                        ))}
                      </div>
                    </foreignObject>
                  )}
                </g>
              )),
          ]}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              translateX: 120,
              itemWidth: 100,
              itemHeight: 20,
              symbolSize: 12,
              symbolShape: "circle",
              // Les couleurs des symboles sont automatiquement récupérées depuis `colors`
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TeamMembersEvolLineChart;
