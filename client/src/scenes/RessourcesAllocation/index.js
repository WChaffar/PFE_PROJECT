import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
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
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import {
  startOfQuarter,
  endOfQuarter,
  format,
  addDays,
} from "date-fns";
import { getAllBuManagers, getTeamForManagerInBu } from "../../actions/teamAction";
import TeamMembersEvolLineChart from "../../components/TeamMembersEvolLineChart";
import TeamExpertisePie from "../../components/TeamExpertisePie";

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

const RessourcesAllocation = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  
  // Redux state
  const businessUnitManagers = useSelector((state) => state.team.managers);
  const teamMembers = useSelector((state) => state.team.team); // Correction: c'est 'team' pas 'teamMembers'
  const selectedAssignements = useSelector((state) => state.assignements.assignements);
  
  // Local state
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerTeamMembers, setManagerTeamMembers] = useState([]); // Pour Team Expertise (rapports directs seulement)
  const [managerAssignments, setManagerAssignments] = useState([]);
  const [teamExpertise, setTeamExpertise] = useState(null);
  const detailsRef = useRef(null);

  // Helper functions
  function getExperienceYears(joinDate) {
    if (!joinDate) return 0;
    const start = new Date(joinDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return years + months / 12;
  }

  function addPeriods(p1, p2) {
    return (p1 || 0) + (p2 || 0);
  }

  function generateQuarters(rangeInYears = 2) {
    const periods = [];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - rangeInYears;
    const endYear = currentYear + rangeInYears;

    for (let year = startYear; year <= endYear; year++) {
      for (let q = 0; q < 4; q++) {
        const date = new Date(year, q * 3, 1);
        periods.push(date);
      }
    }
    return periods;
  }

  function buildTeamCompositionByJobTitle(assignments) {
    const chartColors = [
      "hsl(211, 70%, 50%)",
      "hsl(32, 90%, 55%)",
      "hsl(145, 63%, 45%)",
      "hsl(270, 60%, 60%)",
      "hsl(0, 80%, 60%)",
    ];

    if (!assignments || assignments.length === 0) {
      return [];
    }

    const periods = generateQuarters(1);
    const jobTitles = [...new Set(assignments.map(a => a.employee?.jobTitle).filter(Boolean))];

    return jobTitles.map((title, i) => ({
      id: title,
      color: chartColors[i % chartColors.length],
      data: periods.map((period) => {
        const quarterStart = startOfQuarter(period);
        const quarterEnd = endOfQuarter(period);

        const employeesInQuarter = new Set(
          assignments
            .filter(assign =>
              assign.employee?.jobTitle === title &&
              assign.startDate &&
              new Date(assign.startDate) <= quarterEnd &&
              (!assign.endDate || new Date(assign.endDate) >= quarterStart)
            )
            .map(assign => assign.employee?._id)
            .filter(Boolean)
        );

        return {
          x: format(quarterStart, "MMM yyyy"),
          y: employeesInQuarter.size,
        };
      }),
    }));
  }

  // Calculate team expertise for selected manager
  useEffect(() => {
    
    if (managerTeamMembers.length > 0) {
      const categories = {
        beginner: 0,
        competent: 0,
        proficient: 0,
        expert: 0,
      };

      managerTeamMembers.forEach((member) => {
        const internYearsOfExp = getExperienceYears(member.dateOfJoining);
        const totalExperience = addPeriods(internYearsOfExp, member.yearsOfExperience);
        const exp = parseFloat(totalExperience);
        
        if (exp >= 0 && exp < 2) {
          categories.beginner++;
        } else if (exp >= 2 && exp < 5) {
          categories.competent++;
        } else if (exp >= 5 && exp < 10) {
          categories.proficient++;
        } else if (exp >= 10) {
          categories.expert++;
        }
      });
      
      setTeamExpertise(categories);
    } else {
      setTeamExpertise(null);
    }
  }, [managerTeamMembers]);

  // Calculate manager-specific data when a manager is selected
  useEffect(() => {
    if (selectedManager) {
      console.log("🚀 Fetching direct reports for Team Expertise:", selectedManager.fullName);
      // Fetch the direct team members from API for Team Expertise Structure
      dispatch(getTeamForManagerInBu(selectedManager._id));
    } else {
      setManagerTeamMembers([]);
    }
  }, [selectedManager, dispatch]);

  // Update team members when teamMembers from Redux changes
  useEffect(() => {
    console.log("🔍 Redux teamMembers changed:", {
      selectedManager: selectedManager?.fullName,
      teamMembersLength: teamMembers?.length || 0,
      teamMembersData: teamMembers
    });
    
    if (selectedManager && teamMembers && teamMembers.length > 0) {
      console.log("📊 Direct team members received from API:", teamMembers.length);
      setManagerTeamMembers(teamMembers); // Ces données sont SEULEMENT pour Team Expertise Structure
    } else if (!selectedManager) {
      setManagerTeamMembers([]);
    } else {
      console.log("🔍 No team members found for manager:", selectedManager?.fullName);
    }
  }, [teamMembers, selectedManager]);

  // Calculate assignments (includes both direct reports + project workers)
  useEffect(() => {
    if (selectedManager && selectedAssignements.length > 0) {
      const uniqueEmployees = new Map();
      
      selectedAssignements.forEach(assignment => {
        const employee = assignment.employee;
        if (employee && employee._id && !uniqueEmployees.has(employee._id)) {
          let includeEmployee = false;
          
          // Method 1: Check if employee has manager attribute (direct report)
          if (employee.manager) {
            if (typeof employee.manager === 'string') {
              includeEmployee = employee.manager === selectedManager._id;
            } else if (typeof employee.manager === 'object' && employee.manager._id) {
              includeEmployee = employee.manager._id === selectedManager._id;
            }
          }
          
          // Method 2: Check if working on manager's project
          if (!includeEmployee && assignment.project?.owner) {
            const projectOwner = assignment.project.owner;
            if (typeof projectOwner === 'string') {
              includeEmployee = projectOwner === selectedManager._id;
            } else if (typeof projectOwner === 'object' && projectOwner._id) {
              includeEmployee = projectOwner._id === selectedManager._id;
            }
          }
          
          if (includeEmployee) {
            uniqueEmployees.set(employee._id, employee);
          }
        }
      });
      
      // Filter assignments for display (includes both direct reports + project assignments)
      const managerAssignments = selectedAssignements.filter(assignment => {
        const employee = assignment.employee;
        const project = assignment.project;
        
        // Include if employee is in the extended team
        if (employee && uniqueEmployees.has(employee._id)) {
          return true;
        }
        
        // Include if project is owned by this manager
        if (project?.owner) {
          const projectOwner = project.owner;
          if (typeof projectOwner === 'string') {
            return projectOwner === selectedManager._id;
          } else if (typeof projectOwner === 'object' && projectOwner._id) {
            return projectOwner._id === selectedManager._id;
          }
        }
        
        return false;
      });
      
      setManagerAssignments(managerAssignments);
    } else {
      setManagerAssignments([]);
    }
  }, [selectedManager, selectedAssignements]);

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllEmployeeAssignements());
    dispatch(getAllBuManagers());
  }, [dispatch]);

  // Manager columns for the table
  const managerColumns = [
    {
      field: "fullName",
      headerName: "Manager Name",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="person">👤</span>
          {row.fullName}
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "businessUnit",
      headerName: "Business Unit",
      flex: 1,
      renderCell: ({ row }) => row.businessUnit?.name || "N/A",
    }
  ];

  // Assignment columns for the assignment table
  const assignmentColumns = [
    {
      field: "employee",
      headerName: "Employee",
      flex: 1,
      renderCell: (params) => params.row.employee?.fullName || "Unknown",
    },
    {
      field: "endDate",
      headerName: "Assignment End Date",
      flex: 1,
      renderCell: (params) => {
        if (!params.row.endDate) return "N/A";
        return format(new Date(params.row.endDate), "yyyy-MM-dd");
      },
    },
    {
      field: "availableFrom",
      headerName: "Available From",
      flex: 1,
      renderCell: (params) => {
        if (!params.row.endDate) return "N/A";
        const nextDay = addDays(new Date(params.row.endDate), 1);
        return format(nextDay, "yyyy-MM-dd");
      },
    },
    {
      field: "task",
      headerName: "Task",
      flex: 1,
      renderCell: (params) => params.row.taskId?.taskName || "Unknown Task",
    },
  ];

  // Filter managers with role "Manager" or "BUDirector"
  const managers = businessUnitManagers.filter(member => 
    member.role === 'Manager' || member.role === 'BUDirector'
  );

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Overview of Resource Allocation"
          subtitle="Comprehensive Overview of Resource Allocation Strategies for Optimizing Efficiency and Productivity"
        />
      </Box>

      {/* Managers Table */}
      <Box
        m="20px 0"
        height="40vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
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
          rows={managers}
          columns={managerColumns}
          components={{ Toolbar: CustomToolbar }}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          pagination
          onRowClick={(params) => {
            setSelectedManager(params.row);
            
            setTimeout(() => {
              detailsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 500);
          }}
          getRowId={(row) => row._id}
        />
      </Box>

      {/* Manager Details */}
      {selectedManager && (
        <Box ref={detailsRef}>
          <Box mb={2}>
            <Typography variant="h4" fontWeight="600">
              Manager: {selectedManager.fullName}
            </Typography>
            <Typography variant="body1" color={colors.grey[300]}>
              Team Size: {managerTeamMembers.length} members | Active Assignments: {managerAssignments.length}
            </Typography>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="135px"
            gap="15px"
          >
            {/* Team Expertise Chart */}
            <Box
              gridColumn="span 6"
              gridRow="span 2"
              backgroundColor={colors.primary[400]}
              p="15px"
            >
              <Typography variant="h6" fontWeight="600" mb={1}>
                Team Expertise Structure
              </Typography>
              <Box display="flex" flexDirection="column" alignItems="center" height="200px">
                {teamExpertise && (teamExpertise.beginner > 0 || teamExpertise.competent > 0 || teamExpertise.proficient > 0 || teamExpertise.expert > 0) ? (
                  <Box height="160px" width="100%">
                    <TeamExpertisePie employeesExperienceMap={teamExpertise} />
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="160px">
                    <Typography variant="body2" color={colors.grey[300]}>
                      {managerTeamMembers.length === 0 ? "No team members found" : "No expertise data available"}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" color={colors.greenAccent[500]} mt={1} textAlign="center">
                  Manager's Team Expertise Overview ({managerTeamMembers.length} members)
                </Typography>
              </Box>
            </Box>

            {/* Team Assignments */}
            <Box
              gridColumn="span 6"
              gridRow="span 2"
              backgroundColor={colors.primary[400]}
              p="15px"
            >
              <Typography variant="h6" fontWeight="600" mb={1}>
                Manager's Team Members Assignments
              </Typography>
              <Box height="220px">
                <DataGrid
                  rows={managerAssignments.map((assignment, index) => ({
                    id: index,
                    ...assignment
                  }))}
                  columns={assignmentColumns}
                  hideFooter
                  sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { borderBottom: "none", fontSize: "0.8rem" },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: colors.grey[700],
                      borderBottom: "none",
                      fontSize: "0.8rem",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      backgroundColor: colors.primary[400],
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Team Composition Growth Chart */}
            <Box
              gridColumn="span 12"
              gridRow="span 2"
              backgroundColor={colors.primary[400]}
              p="15px"
              sx={{ minHeight: "350px" }}
            >
              <Typography variant="h6" fontWeight="600" mb={1}>
                Manager's Team Assignements Over Time
              </Typography>
              <Box height="300px">
                {managerAssignments.length > 0 ? (
                  <TeamMembersEvolLineChart
                    isDashboard={true}
                    data={buildTeamCompositionByJobTitle(managerAssignments)}
                  />
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color={colors.grey[300]}>
                      {managerTeamMembers.length === 0 
                        ? "No team members found for this manager" 
                        : "No assignment data available for team composition chart"
                      }
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RessourcesAllocation;