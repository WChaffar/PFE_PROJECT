import { Box } from "@mui/material";
import { DataGrid, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarColumnsButton, GridToolbarDensitySelector } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { projectsData } from "../../data/ProjectsData";

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <Box display="flex" flexDirection="row" gap={2} alignItems="center">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
};

const Projects = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          px={1.5}
          py={0.5}
          borderRadius="8px"
          bgcolor={row.status === "Completed" ? "limegreen" : "lightgray"}
          color={row.status === "Completed" ? "white" : "black"}
          fontWeight="bold"
          width="fit-content"
        >
          {row.status}
        </Box>
      ),
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const percent = Math.round((row.daysUsed / row.budgetDays) * 100);
        return (
          <Box width="100%" mr={1}>
            <Box height="10px" bgcolor="#e0e0e0" borderRadius="4px">
              <Box
                height="100%"
                width={`${percent}%`}
                bgcolor="#555"
                borderRadius="4px"
              />
            </Box>
          </Box>
        );
      },
    },
    {
      field: "budget",
      headerName: "Budget",
      flex: 1,
      valueGetter: ({ row }) => `${row.daysUsed}/${row.budgetDays} days`,
    },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 1,
    },
    {
      field: "team",
      headerName: "Team",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center">
          {row.team.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt={`avatar-${index}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid white",
                marginLeft: index !== 0 ? -8 : 0,
              }}
            />
          ))}
          {row.extraMembers > 0 && (
            <Box
              width={32}
              height={32}
              display="flex"
              justifyContent="center"
              alignItems="center"
              bgcolor="#d3d3d3"
              borderRadius="50%"
              ml={-1}
              fontSize="0.8rem"
              fontWeight="bold"
            >
              +{row.extraMembers}
            </Box>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" >
        <Header
          title="Project Management"
          subtitle="Centralize project management for better control and productivity."
        />
      </Box>
      <Box 
              m="-20px 0 0 0"
              height="35vh"
              sx={{
                  "& .MuiDataGrid-root": {
                    border: "none",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "none",
                  },
                  "& .name-column--cell": {
                    color: colors.greenAccent[300],
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.blueAccent[700],
                    borderBottom: "none",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "b",
                    backgroundColor: colors.blueAccent[700],
                    height:"5px",
                    paddingTop:"10px"
                  },"& .MuiTablePagination-actions":{
                      display:"flex",
                      flexDirection:"row",
                      marginRight:"100px",
                      marginTop:"-10px"
                  },
                  "& .css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input":{
                      marginTop:"-15px"
                  },
                  "& .css-oatl8s-MuiSvgIcon-root-MuiSelect-icon":{
                       marginTop:"-8px"
                  },
                  "& .MuiCheckbox-root": {
                    color: `${colors.greenAccent[200]} !important`,
                  },
                  "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                    color: `${colors.grey[100]} !important`,
                  },
                }}         
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
    </Box>
  );
};

export default Projects;
