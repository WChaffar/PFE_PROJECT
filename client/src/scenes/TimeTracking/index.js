import React, { useState } from "react";
import {
Box,
Typography,
Avatar,
TextField,
MenuItem,
useTheme,
IconButton,
Tooltip,
LinearProgress,
} from "@mui/material";
import {
Edit,
ArrowBack,
ArrowForward
} from "@mui/icons-material";
import {
DataGrid,
GridToolbarContainer,
GridToolbarExport,
GridToolbarFilterButton,
GridToolbarColumnsButton,
GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { addDays, format, startOfWeek, endOfWeek } from "date-fns";

const mockProjects = [
{ id: 1, name: "HR project 1", tnf: "25,5 Days", bt: "10 Days" },
{ id: 2, name: "HR project 2", tnf: "15 Days", bt: "8 Days" },
];

const mockTasks = [
{
id: 1,
projectId: 1,
name: "Java developer full-stack",
assignedTo: "Sarah Wilson",
avatar: "https://i.pravatar.cc/40?img=1",
workload: 80,
},
{
id: 2,
projectId: 1,
name: "React developer",
assignedTo: "John Doe",
avatar: "https://i.pravatar.cc/40?img=2",
workload: 60,
},
{
id: 3,
projectId: 1,
name: "Project Manager",
assignedTo: "Alex Arnold",
avatar: "https://i.pravatar.cc/40?img=3)",
workload: 90,
},
{
id: 4,
projectId: 1,
name: "Devops engineer",
assignedTo: null,
avatar: null,
workload: 0,
},
];

const timeStatusColors = {
billable: "#4CAF50",
nonBillable: "#FF9800",
none: "#E0E0E0",
inactive:
"repeating-linear-gradient(45deg, #ccc 0, #ccc 2px, #fff 2px, #fff 4px)",
};

const CustomToolbar = () => ( <GridToolbarContainer> <Box display="flex" gap={1} alignItems="center"> <GridToolbarColumnsButton /> <GridToolbarFilterButton /> <GridToolbarDensitySelector /> <GridToolbarExport /> </Box> </GridToolbarContainer>
);

export default function TimeTracking() {
const theme = useTheme();
const colors = tokens(theme.palette.mode);

const [selectedProject, setSelectedProject] = useState(null);
const [searchTask, setSearchTask] = useState("");
const [searchEmployer, setSearchEmployer] = useState("");
const [startDate, setStartDate] = useState(
startOfWeek(new Date(), { weekStartsOn: 1 })
);
const [viewMode, setViewMode] = useState("Cost");

const daysToShow = 7;
const visibleDays = Array.from({ length: daysToShow }, (_, i) =>
format(addDays(startDate, i), "EE dd")
);
const weekRange = `${format(startDate, "MMM dd")} - ${format(
    endOfWeek(startDate, { weekStartsOn: 1 }),
    "MMM dd"
  )}`;

// Nouveau tableau de données : temps journalier pour chaque tâche
const taskTimeEntries = [
  { taskId: 1, date: "2025-05-05", status: "billable" },
  { taskId: 1, date: "2025-05-06", status: "nonBillable" },
  { taskId: 1, date: "2025-05-07", status: "billable" },
  { taskId: 1, date: "2025-05-08", status: "inactive" },
  { taskId: 1, date: "2025-05-09", status: "none" },
  { taskId: 2, date: "2025-05-05", status: "billable" },
  { taskId: 2, date: "2025-05-06", status: "billable" },
  { taskId: 2, date: "2025-05-07", status: "nonBillable" },
  { taskId: 2, date: "2025-05-08", status: "none" },
  { taskId: 2, date: "2025-05-09", status: "billable" },
  { taskId: 3, date: "2025-05-05", status: "inactive" },
  { taskId: 3, date: "2025-05-06", status: "inactive" },
  { taskId: 3, date: "2025-05-07", status: "billable" },
  { taskId: 3, date: "2025-05-08", status: "nonBillable" },
  { taskId: 3, date: "2025-05-09", status: "billable" },
  // Ajoute les jours et tâches restants selon besoin
];

// Remplace ta fonction getStatus par celle-ci :
const getStatus = (taskId, date) => {
  const entry = taskTimeEntries.find(
    (e) => e.taskId === taskId && e.date === format(date, "yyyy-MM-dd")
  );
  return entry ? entry.status : "none";
};


const projectColumns = [
{
field: "name",
headerName: "Project Name",
flex: 1.5,
renderCell: ({ row }) => ( <Box display="flex" alignItems="center" gap={1}> <span role="img" aria-label="folder">📁</span> <strong>{row.name}</strong> </Box>
),
},
{ field: "tnf", headerName: "TNF (Non-Billable)", flex: 1 },
{ field: "bt", headerName: "BT (Billable)", flex: 1 },
];

const taskColumnsCost = [
{
field: "name",
headerName: "Task Name",
flex: 1.5,
},
{
field: "assignedTo",
headerName: "Assigned Person",
flex: 1.2,
renderCell: (params) => ( <Box display="flex" alignItems="center" gap={1}>
{params.row.avatar ? ( <Avatar src={params.row.avatar} />
) : ( <Avatar>?</Avatar>
)}
{params.row.assignedTo || "Unassigned"} </Box>
),
},
...visibleDays.map((day, i) => {
const dayIndex = i;
return {
field: day,
headerName: day,
flex: 0.5,
sortable: false,
renderCell: (params) => {
const rowIndex = params.api.getRowIndex(params.id);
const taskId = params.row.id;
const date = addDays(startDate, dayIndex);
const status = getStatus(taskId, date);

return ( <Tooltip title={status}>
<Box
width={28}
height={28}
borderRadius="4px"
sx={{
background:
status === "inactive"
? timeStatusColors.inactive
: timeStatusColors[status],
border: "1px solid #ccc",
}}
/> </Tooltip>
);
},
};
}),
];

const taskColumnsWorkload = [
{
field: "name",
headerName: "Task Name",
flex: 1.5,
},
{
field: "assignedTo",
headerName: "Assigned Person",
flex: 1.2,
renderCell: (params) => ( <Box display="flex" alignItems="center" gap={1}>
{params.row.avatar ? ( <Avatar src={params.row.avatar} />
) : ( <Avatar>?</Avatar>
)}
{params.row.assignedTo || "Unassigned"} </Box>
),
},
{
field: "workload",
headerName: "Workload",
flex: 2,
renderCell: (params) => {
const value = params.row.workload;
let barColor = "#2196f3";
if (value >= 90) barColor = "#f44336";
else if (value >= 70) barColor = "#ff9800";
else if (value >= 40) barColor = "#4caf50";
else barColor = "#9e9e9e";
    return (
      <Box width="100%" pr={2}>
        <Tooltip title={`${value}%`}>
          <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                flex: 1,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: barColor,
                },
              }}
            />
            <Typography variant="body2" width={35}>
              {value}%
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    );
  },
},

];

const filteredTasks = selectedProject
? mockTasks.filter(
(t) =>
t.projectId === selectedProject.id &&
t.name.toLowerCase().includes(searchTask.toLowerCase()) &&
(t.assignedTo || "").toLowerCase().includes(searchEmployer.toLowerCase())
)
: [];

const handleNavigate = (direction) => {
const newDate = addDays(startDate, direction * 7);
setStartDate(newDate);
};

return ( <Box p={3}> <Typography variant="h4" fontWeight="bold">
Time Tracking </Typography> <Typography variant="body2" color="textSecondary" mb={2}>
Track employee time per project for efficient planning. </Typography>

  <Box height="35vh" mb={4} sx={{
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
      rowsPerPageOptions={[5]}
      pagination
    />
  </Box>

  {selectedProject && (
    <Box>
      <Box
        mb={2}
        display="flex"
        alignItems="center"
        gap={2}
        justifyContent="space-between"
      >
        <TextField
          select
          size="small"
          label="View"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
        >
          <MenuItem value="Workload">Workload</MenuItem>
          <MenuItem value="Cost">Cost</MenuItem>
        </TextField>

        {viewMode === "Cost" && (
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton  sx={{width:"50px", marginBottom:"-30px"}} onClick={() => handleNavigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Typography sx={{marginBottom:"-30px"}} variant="h6">{weekRange}</Typography>
            <IconButton sx={{width:"50px", marginBottom:"-30px"}} onClick={() => handleNavigate(1)}>
              <ArrowForward />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box height="35vh" sx={{
      "& .MuiDataGrid-root": {
        border: "none",
      },
      "& .MuiDataGrid-cell": {
        borderBottom: "none",
      },
      "& .name-column--cell": {
      },
      "& .MuiDataGrid-columnHeaders": {
        borderBottom: "none",
        backgroundColor: colors.primary[400],
      },
      "& .MuiDataGrid-virtualScroller": {
      },
      "& .MuiDataGrid-footerContainer": {
        borderTop: "b",
        height: "5px",
        paddingTop: "10px",
        backgroundColor: colors.primary[400],
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
      marginTop:"-20px"
    }}>
        <DataGrid
          rows={filteredTasks}
          columns={
            viewMode === "Cost" ? taskColumnsCost : taskColumnsWorkload
          }
          getRowId={(row) => row.id}
          components={{ Toolbar: CustomToolbar }}
          pageSize={7}
          rowsPerPageOptions={[7]}
          pagination
        />
      </Box>

      {viewMode === "Cost" && (
        <Box display="flex" gap={3} mt={1} marginTop="-35px" position="relative" zIndex="1">
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} bgcolor="#4CAF50" />
            <Typography variant="body2">Billable Time</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={12} height={12} bgcolor="#FF9800" />
            <Typography variant="body2">Non-Billable Time</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              width={12}
              height={12}
              sx={{
                background:
                  "repeating-linear-gradient(45deg, #ccc 0, #ccc 2px, #fff 2px, #fff 4px)",
              }}
            />
            <Typography variant="body2">Inactive</Typography>
          </Box>
        </Box>
      )}
    </Box>
  )}
</Box>
);
}
