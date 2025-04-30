import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarColumnsButton,
    GridToolbarDensitySelector,
  } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { mockTasks, mockProjects } from "../../data/mockData"; // You'll define these
import { useNavigate } from "react-router-dom";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { tokens } from "../../theme";

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

const TasksManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
    const colors = tokens(theme.palette.mode);

  const projectColumns = [
    {
          field: "name",
          headerName: "Project Name",
          flex: 1,
          renderCell: ({ row }) => (
            <Box display="flex" alignItems="center" gap={1}>
              <span role="img" aria-label="folder">
                📁
              </span>
              {row.name}
            </Box>
          ),
        },
    { field: "taskCount", headerName: "Taks Number", flex: 1 },
    { field: "completed", headerName: "Completed", flex: 1 },
    { field: "active", headerName: "Active Taks", flex: 1 },
    { field: "overdue", headerName: "Overdue Tasks", flex: 1 },
  ];

  const taskColumns = [
    { field: "name", headerName: "Task Name", flex: 1.5 },
    {
      field: "skills",
      headerName: "Required skills",
      flex: 2,
      renderCell: (params) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {params.row.skills.map((skill, i) => (
            <Chip key={i} label={skill} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1.5,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={params.row.avatar} />
          <Typography fontWeight="bold">{params.row.assignedTo}</Typography>
        </Box>
      ),
    },
    {
      field: "experience",
      headerName: "Required Experience",
      flex: 1,
      renderCell: (params) => (
        <Typography>⏱ {params.row.experience} years</Typography>
      ),
    },
    { field: "phase", headerName: "Project Phase", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: ({ row }) => <ActionsMenu row={row} />,
    },
  ];

  const filteredTasks = selectedProject
    ? mockTasks.filter((task) => task.projectId === selectedProject.id)
    : [];


    const ActionsMenu = ({ row }) => {
        const [anchorEl, setAnchorEl] = React.useState(null);
        const open = Boolean(anchorEl);
        const handleClick = (event) => {
          setAnchorEl(event.currentTarget);
        };
        const handleClose = (action) => {
          if(action==="Edit"){
          }
          if(action==="Details"){
          }
          setAnchorEl(null);
        };
    
        return (
          <>
            <IconButton onClick={handleClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
               <MenuItem onClick={() => handleClose("Edit")}>✏️ Edit</MenuItem>
               <MenuItem onClick={() => handleClose("Delete")}>🗑️ Delete</MenuItem>
               <MenuItem onClick={() => handleClose("Details")}>🔍 Details</MenuItem>
            </Menu>
          </>
        );
      };
    

  return (
    <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
            {/* Header */}
            <Typography variant="h4" fontWeight="bold">
            Tasks Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Task management optimizes workloads and ensures deadlines are met
          </Typography>
            </Box>
            <Box>
                <Button
                  sx={{
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                    fontSize: "14px",
                    fontWeight: "bold",
                    padding: "10px 20px",
                  }}
                  onClick={()=> {
                    navigate("/team/create");
                  }}
                >
                  + Add Task
                </Button>
              </Box>
    </Box>
      {/* Project Table */}
      <Box m="-20px 0 0 0"
        height="35vh"
        marginTop="10px"
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
            height: "5px",
            paddingTop: "10px",
          },
          "& .MuiTablePagination-actions": {
            display: "flex",
            flexDirection: "row",
            marginRight: "100px",
            marginTop: "-10px",
          },
          "& .css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input":
            {
              marginTop: "-15px",
            },
          "& .css-oatl8s-MuiSvgIcon-root-MuiSelect-icon": {
            marginTop: "-8px",
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}>
        <DataGrid
          rows={mockProjects}
          columns={projectColumns}
          onRowClick={(params) => setSelectedProject(params.row)}
          components={{ Toolbar: CustomToolbar }}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          pagination
        />
      </Box>
      {/* Tasks Table */}
      {selectedProject && (
        <Box
          borderRadius="8px"
          overflow="hidden"
          border="1px solid #ddd"
          bgcolor="background.paper"
          marginTop='25px'
        >
          <Typography variant="h6" p={2}>
            Tasks
          </Typography>
          <Box 
          m="-20px 0 0 0"
          height="40vh"
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
          "& .MuiTablePagination-actions": {
            display: "flex",
            flexDirection: "row",
            marginRight: "100px",
            marginTop: "-10px",
          },
          "& .css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input":
            {
              marginTop: "-15px",
            },
          "& .css-oatl8s-MuiSvgIcon-root-MuiSelect-icon": {
            marginTop: "-8px",
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}>
          <DataGrid
            rows={filteredTasks}
            columns={taskColumns}
            components={{ Toolbar: CustomToolbar }}
            sx={{ border: "none" }}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            pagination
          />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TasksManagement;
