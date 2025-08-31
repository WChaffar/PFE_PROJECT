import { ResponsiveLine } from "@nivo/line";
import { useTheme, TextField } from "@mui/material";
import { tokens } from "../theme";
import { useState, useEffect, useRef } from "react";

const TeamMembersEvolLineChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 🔍 Search state
  const [search, setSearch] = useState("");

  // Filtrer les séries selon l'input utilisateur
  const filteredData = data.filter((serie) =>
    serie.id.toLowerCase().includes(search.toLowerCase())
  );

  // Generate unique colors
  const generateColors = (series) => {
    const c = {};
    const hueStep = 360 / series.length;
    series.forEach((serie, index) => {
      c[serie.id] = `hsl(${index * hueStep}, 70%, 50%)`;
    });
    return c;
  };
  const seriesColors = generateColors(filteredData);

  // Tooltip state
  const [activeSlice, setActiveSlice] = useState(null);
  const tooltipRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setActiveSlice(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ width: "100%", height: "250px", position: "relative" }}>
      {/* 🔍 Champ de recherche */}
      <div style={{ position: "absolute", top: 0, right: 10, zIndex: 2 }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Rechercher une série..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "10px", background: "#fff", borderRadius: 4 }}
        />
      </div>

      <ResponsiveLine
        data={filteredData}
        colors={(d) => seriesColors[d.id]}
        margin={{ top: 50, right: 170, bottom: 60, left: 80 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
        curve="monotoneX"
        axisBottom={{ tickRotation: -45, legend: "Time", legendOffset: 46 }}
        axisLeft={{
          legend: "Number of Team Members",
          legendOffset: -60,
          tickValues: "every 1", // ✅ pour avoir tous les tickss
        }}
        enableSlices="x"
        useMesh
        legends={[]}
        layers={[
          "grid",
          "markers",
          "areas",
          "lines",
          "points",
          "axes",
          ({ slices, innerHeight }) =>
            slices.map((slice) => (
              <g key={slice.id}>
                <rect
                  x={slice.points[0].x - 10}
                  y={0}
                  width={20}
                  height={innerHeight}
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
                          {Math.round(point.data.y)}
                        </div>
                      ))}
                    </div>
                  </foreignObject>
                )}
              </g>
            )),
        ]}
      />

      {/* ✅ Légende filtrée */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 0,
          width: "160px",
          height: "150px",
          overflowY: "auto",
          background: theme.palette.background.default,
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "6px",
        }}
      >
        {filteredData.map((serie) => (
          <div
            key={serie.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: seriesColors[serie.id],
                marginRight: 8,
              }}
            />
            <span style={{ fontSize: "12px" }}>{serie.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembersEvolLineChart;
