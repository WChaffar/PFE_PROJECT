import React from "react";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { projectsData } from "../../data/ProjectsData";

const CustomToolbar = () => (
  <GridToolbarContainer>
    <Box display="flex" flexDirection="row" gap={2} alignItems="center">
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </Box>
  </GridToolbarContainer>
);

const Reports = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleExport = (format) => {
    alert(`Exporting to ${format.toUpperCase()}... (logic to implement)`);
  };

  const columns = [
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="folder">📁</span>
          {row.name}
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Reports"
          subtitle="Generate detailed reports on project for informed decision-making."
        />
        <Box display="flex" alignItems="center" gap={3}>
          <Typography variant="h5" fontWeight="300" whiteSpace="nowrap">
            Extract reports for all projects:
          </Typography>
          <Button
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handleExport("pdf")}
            sx={buttonStyle(colors)}
          >
            PDF
          </Button>
          <Button
            startIcon={<DescriptionIcon />}
            onClick={() => handleExport("word")}
            sx={buttonStyle(colors)}
          >
            Word
          </Button>
          <Button
            startIcon={<TableChartIcon />}
            onClick={() => handleExport("excel")}
            sx={buttonStyle(colors)}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box
        m="-20px 0 0 0"
        height="35vh"
        sx={gridStyles(colors)}
      >
        <DataGrid
          rows={projectsData}
          columns={columns}
          components={{ Toolbar: CustomToolbar }}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          pagination
        />
      </Box>

      {/* Generation Boxes */}
      <Box mt={4}>
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          {["PDF", "Word", "Excel"].map((type, index) => {
            const icons = {
              PDF: <PictureAsPdfIcon sx={{ fontSize: 40 }} />,
              Word: <DescriptionIcon sx={{ fontSize: 40 }} />,
              Excel: <TableChartIcon sx={{ fontSize: 40 }} />,
            };

            return (
              <Box
                key={type}
                gridColumn="span 5"
                backgroundColor={colors.primary[400]}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                padding="10px"
                sx={{ cursor: "pointer" }}
                onClick={() => handleExport(type.toLowerCase())}
              >
                {icons[type]}
                <Typography variant="h5" fontWeight="300" mt={1}>
                  Generate {type}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const buttonStyle = (colors) => ({
  color: colors.grey[100],
  fontSize: "14px",
  fontWeight: "bold",
  padding: "10px 20px",
});

const gridStyles = (colors) => ({
  "& .MuiDataGrid-root": { border: "none" },
  "& .MuiDataGrid-cell": { borderBottom: "none" },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: colors.blueAccent[700],
    borderBottom: "none",
  },
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: colors.primary[400],
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "none",
    backgroundColor: colors.blueAccent[700],
    height: "5px",
    paddingTop: "10px",
  },
  "& .MuiTablePagination-actions": {
    display: "flex",
    flexDirection: "row",
    marginRight: "100px",
    marginTop: "-10px",
  },
  "& .MuiCheckbox-root": {
    color: `${colors.greenAccent[200]} !important`,
  },
  "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
    color: `${colors.grey[100]} !important`,
  },
});

export default Reports;
