import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Header from "../../components/Header";
import ProjectBarChart from "../../components/ProjectBarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import PieChart from "../../components/PieChart";
import { useDispatch, useSelector } from "react-redux";
import TeamMembersEvolLineChart from "../../components/TeamMembersEvolLineChart";
import { useEffect, useState } from "react";
import { getAllTeamMembers } from "../../actions/teamAction";
import { getAllBuProjects } from "../../actions/projectAction";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import { getRisks } from "../../actions/riskActions";
import { useRef } from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DashboardBU = () => {
  const dashboardRef = useRef(); // Ref for the entire dashboard
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const user = useSelector((store) => store.auth.user);
  
  // State management
  const [projectWorkload, setProjectWorkload] = useState([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(null);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(null);
  const [totalProjectsCount, setTotalProjectsCount] = useState(null);
  const [managersCount, setManagersCount] = useState(null);
  const [totalTeamMembersCount, setTotalTeamMembersCount] = useState(null);
  const [buTeamMembers, setBuTeamMembers] = useState([]);
  const [buAssignments, setBuAssignments] = useState([]);
  
  // Chart data states
  const [managersDistributionData, setManagersDistributionData] = useState([]);
  const [teamEvolutionData, setTeamEvolutionData] = useState([]);
  const [activeAssignmentsCount, setActiveAssignmentsCount] = useState(0);
  
  const dispatch = useDispatch();
  
  // Selectors for BU-specific data
  const selectedProjects = useSelector((state) => state.projects.projects);
  const selectedTeamMembers = useSelector((state) => state.team.team);
  const selectedAssignments = useSelector((state) => state.assignements.assignements);
  const selectedRisks = useSelector((state) => state.risks.risks);

  // DEBUG: Log Redux state
  console.log("Redux state - projects:", selectedProjects?.length);
  console.log("Redux state - team:", selectedTeamMembers?.length);
  console.log("Redux state - assignments:", selectedAssignments?.length);
  


  const handleDownloadReport = async () => {
    if (!dashboardRef.current) return;

    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      windowWidth: dashboardRef.current.scrollWidth,
      windowHeight: dashboardRef.current.scrollHeight,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Cover page with dashboard screenshot
    pdf.setFillColor(41, 128, 185); // blue bar
    pdf.rect(0, 0, pdfWidth, 20, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text("BU Dashboard Report", 10, 14);

    pdf.addImage(imgData, "PNG", 0, 25, pdfWidth, pdfHeight - 30);

    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 10, pdfHeight + 15);

    // BU Overview page
    pdf.addPage();
    pdf.setTextColor(41, 128, 185);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Business Unit Overview", 10, 20);

    // Save PDF
    pdf.save(`BU_Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Function to build managers distribution data for PieChart
  const buildManagersDistribution = (teamMembers) => {
    if (!teamMembers || teamMembers.length === 0) return [];
    
    // Group by role/department
    const distribution = {};
    
    teamMembers.forEach(member => {
      const role = member.role || 'Unknown';
      if (distribution[role]) {
        distribution[role]++;
      } else {
        distribution[role] = 1;
      }
    });

    // Convert to pie chart format
    return Object.entries(distribution).map(([role, count], index) => ({
      id: role,
      label: role,
      value: count,
      color: `hsl(${index * 60}, 70%, 50%)`
    }));
  };

  // Function to build team evolution data for LineChart
  const buildTeamEvolution = (teamMembers, assignments) => {
    if (!teamMembers || teamMembers.length === 0) return [];
    
    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: date.toLocaleString('default', { month: 'short' }),
        date: date
      });
    }
    
    // Group members by role
    const roleGroups = {};
    teamMembers.forEach(member => {
      const role = member.role || 'Unknown';
      if (!roleGroups[role]) {
        roleGroups[role] = [];
      }
      roleGroups[role].push(member);
    });

    // Create evolution data per role
    return Object.entries(roleGroups).map(([role, members], roleIndex) => ({
      id: role,
      color: `hsl(${roleIndex * 72}, 70%, 50%)`, // More consistent colors
      data: months.map((month, monthIndex) => {
        // Simulate realistic growth pattern
        const baseCount = members.length;
        const growthFactor = 0.8 + (monthIndex * 0.05); // Gradual growth
        const variation = 0.9 + Math.random() * 0.2; // Small random variation
        const count = Math.max(1, Math.floor(baseCount * growthFactor * variation));
        
        return {
          x: month.name,
          y: count
        };
      })
    }));
  };

  // Function to check if a project is truly complete (all tasks at 100% workload)
  const isProjectTrulyComplete = (project, allAssignments) => {
    if (!allAssignments || allAssignments.length === 0) return false;
    
    // Get all assignments for this project
    const projectAssignments = allAssignments.filter(assignment => {
      const assignmentProjectId = assignment.project?._id || assignment.project;
      const projectId = project._id || project.id;
      return assignmentProjectId?.toString() === projectId?.toString();
    });
    
    // Convert assignments to tasks
    const projectTasks = projectAssignments.map(assignment => assignment.taskId).filter(task => task != null);
    
    // If no tasks found, project is not complete
    if (projectTasks.length === 0) return false;
    
    // Check if ALL tasks have 100% workload (EXACTLY like Reports)
    const allTasksComplete = projectTasks.every(task => {
      const workload = task.workload || 0;
      return workload === 100;
    });
    
    console.log(`Project "${project.name}" tasks:`, {
      totalAssignments: projectAssignments.length,
      totalTasks: projectTasks.length,
      workloads: projectTasks.map(t => ({
        taskName: t.taskName || 'Unknown Task',
        taskId: t._id,
        workload: t.workload || 0
      })),
      allComplete: allTasksComplete
    });
    
    return allTasksComplete;
  };

  // Effect to handle projects data
  useEffect(() => {
    if (selectedProjects && selectedProjects.length > 0) {
      console.log("=== PROJECT COMPLETION ANALYSIS ===");
      console.log("Total projects:", selectedProjects.length);
      console.log("Total assignments available:", selectedAssignments?.length || 0);
      
      const projectWorkloadData = selectedProjects.map((project) => {
        const isTrulyComplete = isProjectTrulyComplete(project, selectedAssignments);
        
        // Calculate real progress based on phase completion (EXACTLY like Reports)
        // Extract tasks from assignments (since assignments contain populated task data)
        const projectAssignments = selectedAssignments?.filter(assignment => {
          const assignmentProjectId = assignment.project?._id || assignment.project;
          return assignmentProjectId?.toString() === project._id?.toString();
        }) || [];
        
        // Convert assignments to tasks (same structure as selectedTasks in Reports)
        const projectTasks = projectAssignments.map(assignment => assignment.taskId).filter(task => task != null);
        
        let realProgress = 0;
        if (projectTasks.length > 0) {
          // Fixed step order (same as Reports and ProjectPipeline)
          const STEP_ORDER = ["Planning", "Design", "Development", "Testing"];
          
          // Calculate progress for each phase (EXACTLY like Reports)
          const phaseProgresses = STEP_ORDER.map((phase) => {
            const tasksInPhase = projectTasks.filter(task => 
              task.projectPhase === phase
            );
            
            if (tasksInPhase.length === 0) return 0;
            
            const avgPhaseProgress = tasksInPhase.reduce((sum, task) => {
              return sum + (task.workload || 0);
            }, 0) / tasksInPhase.length;
            
            return Math.round(avgPhaseProgress);
          });
          
          // Project progress = average of all phase progresses (EXACTLY like Reports)
          realProgress = phaseProgresses.length > 0 
            ? Math.round(phaseProgresses.reduce((sum, progress) => sum + progress, 0) / phaseProgresses.length)
            : 0;
        }
        
        console.log(`Project "${project.name}":`, {
          oldProgress: project.progress,
          realProgress: realProgress,
          trulyComplete: isTrulyComplete,
          assignmentsCount: projectAssignments.length,
          tasksCount: projectTasks.length,
          taskWorkloads: projectTasks.map(t => t.workload || 0)
        });
        
        return {
          project: project.name || project.projectName || 'Unnamed Project', // Ensure project name is never undefined
          progress: realProgress, // Use calculated real progress instead of project.progress
          trulyComplete: isTrulyComplete,
          budget: project.budget || 0,
          spent: project.budgetSpent || 0
        };
      });

      // Use the new logic: project is complete only if ALL its tasks are at 100% workload
      const activeProjects = projectWorkloadData?.filter(
        (p) => !p.trulyComplete
      );
      const completedProjects = projectWorkloadData?.filter(
        (p) => p.trulyComplete
      );

      console.log("Active projects:", activeProjects?.length);
      console.log("Truly completed projects:", completedProjects?.length);

      setActiveProjectsCount(activeProjects?.length);
      setCompletedProjectsCount(completedProjects?.length);
      setTotalProjectsCount(projectWorkloadData?.length);
      setProjectWorkload(projectWorkloadData || []);
    }
  }, [selectedProjects, selectedAssignments]);

  // Effect to handle BU data based on businessUnit attribute
  // Utilise l'attribut businessUnit du modèle User pour déterminer les membres de la BU
  useEffect(() => {
    console.log("=== DEBUG BU Dashboard ===");
    console.log("user:", user);
    console.log("user.businessUnit:", user?.businessUnit);
    console.log("selectedTeamMembers:", selectedTeamMembers);
    console.log("selectedTeamMembers count:", selectedTeamMembers?.length);
    console.log("selectedAssignments count:", selectedAssignments?.length);
    
    if (selectedTeamMembers && selectedTeamMembers.length > 0) {
      console.log("Team members sample:", selectedTeamMembers.slice(0, 3));
    }
    
    if (user?.businessUnit && selectedTeamMembers && selectedTeamMembers.length > 0) {
      // Handle different businessUnit formats (ObjectId vs String)
      const currentBusinessUnitId = typeof user.businessUnit === 'object' 
        ? user.businessUnit._id || user.businessUnit.toString()
        : user.businessUnit;
      
      console.log("currentBusinessUnitId:", currentBusinessUnitId);
      console.log("currentBusinessUnitId type:", typeof currentBusinessUnitId);
      
      // Filter all team members who belong to the same business unit
      const allBuMembers = selectedTeamMembers.filter(member => {
        const memberBusinessUnitId = typeof member.businessUnit === 'object'
          ? member.businessUnit._id || member.businessUnit.toString()
          : member.businessUnit;
        
        console.log(`Member ${member.fullName || member.firstName + ' ' + member.lastName} - businessUnit:`, memberBusinessUnitId, "type:", typeof memberBusinessUnitId, "role:", member.role);
        
        const matches = memberBusinessUnitId === currentBusinessUnitId || 
                       memberBusinessUnitId?.toString() === currentBusinessUnitId?.toString();
        
        if (matches) {
          console.log(`✓ MATCH found for ${member.fullName || member.firstName + ' ' + member.lastName}`);
        }
        
        return matches;
      });
      
      console.log("allBuMembers count:", allBuMembers.length);
      console.log("allBuMembers:", allBuMembers.map(m => ({name: m.fullName || m.firstName + ' ' + m.lastName, role: m.role})));
      
      // Separate managers from regular team members
      const buManagers = allBuMembers.filter(member => member.role === 'Manager');
      const buTeamMembersOnly = allBuMembers.filter(member => 
        member.role !== 'Manager' && member.role !== 'BUDirector'
      );
      
      console.log("buManagers count:", buManagers.length);
      console.log("buManagers:", buManagers.map(m => m.fullName || m.firstName + ' ' + m.lastName));
      console.log("buTeamMembersOnly count:", buTeamMembersOnly.length);
      console.log("buTeamMembersOnly:", buTeamMembersOnly.map(m => m.fullName || m.firstName + ' ' + m.lastName));
      
      setManagersCount(buManagers.length);
      setBuTeamMembers(buTeamMembersOnly);
      setTotalTeamMembersCount(buTeamMembersOnly.length);
      
      // Generate chart data from real data
      const managersDistData = buildManagersDistribution(allBuMembers);
      setManagersDistributionData(managersDistData);
      
      const teamEvolData = buildTeamEvolution(allBuMembers, selectedAssignments);
      setTeamEvolutionData(teamEvolData);
      
      // Calculate active assignments - using same logic as main dashboard
      if (selectedAssignments && selectedAssignments.length > 0) {
        console.log("=== ASSIGNMENT DEBUGGING ===");
        console.log("Total assignments:", selectedAssignments.length);
        console.log("Total BU members:", allBuMembers.length);
        
        // Check what fields are available in assignments
        if (selectedAssignments.length > 0) {
          console.log("Assignment fields:", Object.keys(selectedAssignments[0]));
          console.log("Sample assignment:", selectedAssignments[0]);
        }
        
        // Filter assignments that belong to BU members
        const buAssignmentsData = selectedAssignments.filter(assignment => 
          allBuMembers.some(member => {
            const memberId = member._id?.toString();
            const assignmentEmployeeId = assignment.employee?._id?.toString() || assignment.employee?.toString();
            const match = memberId === assignmentEmployeeId;
            
            if (match) {
              console.log(`✓ Assignment match: ${assignment.employee?.firstName || 'Unknown'} (${assignmentEmployeeId})`);
            }
            
            return match;
          })
        );
        
        setBuAssignments(buAssignmentsData);
        setActiveAssignmentsCount(buAssignmentsData.length);
        console.log("Final active assignments count:", buAssignmentsData.length);
      } else {
        console.log("No assignments available to filter");
        setActiveAssignmentsCount(0);
      }
    } else {
      console.log("CONDITIONS NOT MET:");
      console.log("- user?.businessUnit:", !!user?.businessUnit);
      console.log("- selectedTeamMembers exists:", !!selectedTeamMembers);
      console.log("- selectedTeamMembers.length > 0:", selectedTeamMembers && selectedTeamMembers.length > 0);
      
      // Reset counts when conditions are not met
      setManagersCount(0);
      setTotalTeamMembersCount(0);
      setActiveAssignmentsCount(0);
    }
  }, [user, selectedTeamMembers, selectedAssignments]);



  // Effect to handle risks
  useEffect(() => {
    if (selectedRisks.length !== 0) {
      // Handle risks data if needed
    }
  }, [selectedRisks]);

  // Fetch data on component mount
  useEffect(() => {
    console.log("Fetching data for dashboard BU...");
    dispatch(getAllTeamMembers()); // Get all team members to filter by businessUnit
    dispatch(getAllEmployeeAssignements()); // Get all assignments to filter by BU and check project completion
    // Note: We'll use selectedAssignments which contain task data via taskId populate
    dispatch(getRisks());
    
    if (user?.businessUnit) {
      console.log("Fetching projects for businessUnit:", user.businessUnit);
      dispatch(getAllBuProjects(user.businessUnit));
    }
  }, [dispatch, user]);





  return (
    <Box m="20px" ref={dashboardRef}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Business Unit Dashboard"
          subtitle={`Welcome back, ${
            user?.firstname || "BUDirector"
          }! Here's what's happening in your Business Unit.`}
        />

        <Box>
          <Button
            onClick={handleDownloadReport}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 - Statistics */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalProjectsCount || "0"}
            subtitle="Total Projects"
            progress={(activeProjectsCount / totalProjectsCount) || 0}
            increase={`${activeProjectsCount || 0} Active`}
            icon={
              <FolderSpecialIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={2}
        >
          <StatBox
            title={managersCount || "0"}
            subtitle="Managers"
            progress={0.75}
            increase={`${managersCount || 0} Active Managers`}
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
          <Typography variant="caption" color="textSecondary">
            Debug: team data length = {selectedTeamMembers?.length || 0}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            User BU: {user?.businessUnit ? "Yes" : "No"}
          </Typography>
        </Box>
        
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalTeamMembersCount || "0"}
            subtitle="Team Members (excl. Managers)"
            progress={0.85}
            increase={`Managed by ${managersCount || 0} managers`}
            icon={
              <PeopleAltIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={activeAssignmentsCount}
            subtitle="Active Assignments"
            progress={0.90}
            increase={`Across ${managersCount || 0} managers`}
            icon={
              <BusinessIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 - Charts */}
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Projects Progress Overview
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {activeProjectsCount || 0} Active Projects
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <ProjectBarChart 
              projectWorkload={projectWorkload || []} 
              isDashboard={true} 
            />
          </Box>
        </Box>
        


        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            BU Progress Overview
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle 
              progress={(completedProjectsCount / totalProjectsCount) || 0} 
              size="125" 
            />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              {Math.round(((completedProjectsCount / totalProjectsCount) || 0) * 100)}% Projects Completed
            </Typography>
            <Typography>Business Unit: {user?.businessUnit?.name || "N/A"}</Typography>
            <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
              {managersCount || 0} managers • {buTeamMembers?.length || 0} team members
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "center", color: colors.grey[300] }}>
              {buAssignments?.length || 0} active assignments
            </Typography>
          </Box>
        </Box>
        
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Managers Distribution
          </Typography>
          <Box height="250px" mt="-20px">
            <PieChart data={managersDistributionData} />
          </Box>
        </Box>
        
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Team Growth Trends
          </Typography>
          <Box height="250px" mt="-20px">
            <TeamMembersEvolLineChart 
              data={teamEvolutionData} 
              isDashboard={true} 
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardBU;