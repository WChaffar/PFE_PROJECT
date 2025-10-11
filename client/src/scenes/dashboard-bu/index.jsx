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
import { useEffect, useState, useCallback } from "react";
import { getAllTeamMembers } from "../../actions/teamAction";
import { getAllBuProjects } from "../../actions/projectAction";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import { getRisks } from "../../actions/riskActions";
import { getBU } from "../../actions/businessUnitAction";
import TaskService from "../../services/taskService";
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
  const [allBuTasks, setAllBuTasks] = useState([]);
  const [averageBuProgress, setAverageBuProgress] = useState(0);
  const [managersProgress, setManagersProgress] = useState(0);
  const [teamMembersProgress, setTeamMembersProgress] = useState(0);
  const [assignmentsProgress, setAssignmentsProgress] = useState(0);
  
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
  const selectedBusinessUnits = useSelector((state) => state.businessUnit.businessUnit);

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

  // Function to fetch all tasks for BU projects (similar to Reports approach)
  const fetchAllBuTasks = useCallback(async () => {
    if (!selectedProjects || selectedProjects.length === 0) return [];
    
    try {
      console.log("🔍 Fetching tasks for all BU projects using getBuTaskByProjectID (BusinessUnit filter)...");
      
      // Get all tasks for all BU projects using BU-specific API
      const allTasks = [];
      for (const project of selectedProjects) {
        try {
          // Use BU-specific API to get tasks for all managers in the BU
          const projectTasks = await TaskService.getBuTaskByProjectID(project._id);
          if (projectTasks && projectTasks.length > 0) {
            allTasks.push(...projectTasks);
            console.log(`✅ Found ${projectTasks.length} tasks for project ${project.name || project.projectName}`);
          }
        } catch (error) {
          console.log(`⚠ No tasks found for project ${project.name || project.projectName}:`, error.message);
        }
      }
      
      console.log(`📦 Total BU tasks fetched: ${allTasks.length}`);
      setAllBuTasks(allTasks);
      return allTasks;
    } catch (error) {
      console.error("❌ Error fetching BU tasks:", error);
      return [];
    }
  }, [selectedProjects, setAllBuTasks]);

  // Function to check if a project is truly complete (all tasks at 100% workload)
  const isProjectTrulyComplete = (project, allTasks) => {
    if (!allTasks || allTasks.length === 0) return false;
    
    // Get all tasks for this project (EXACTLY like Reports)
    const projectTasks = allTasks.filter(task => {
      const taskProjectId = task.project?._id || task.project;
      const projectId = project._id || project.id;
      return taskProjectId?.toString() === projectId?.toString();
    });
    
    // If no tasks found, project is not complete
    if (projectTasks.length === 0) return false;
    
    // Check if ALL tasks have 100% workload (EXACTLY like Reports)
    const allTasksComplete = projectTasks.every(task => {
      const workload = task.workload || 0;
      return workload === 100;
    });
    
    console.log(`[Dashboard BU] Project "${project.name || project.projectName}" completion check:`, {
      totalTasks: projectTasks.length,
      workloads: projectTasks.map(t => ({
        taskName: t.taskName || 'Unknown Task',
        taskId: t._id,
        phase: t.projectPhase,
        workload: t.workload || 0
      })),
      allComplete: allTasksComplete
    });
    
    return allTasksComplete;
  };

  // Effect to fetch BU tasks when projects are loaded
  useEffect(() => {
    if (selectedProjects && selectedProjects.length > 0) {
      console.log("🚀 Triggering fetchAllBuTasks for", selectedProjects.length, "projects");
      fetchAllBuTasks();
    } else {
      console.log("⏳ Waiting for selectedProjects...", { 
        hasSelectedProjects: !!selectedProjects, 
        projectsCount: selectedProjects?.length || 0 
      });
    }
  }, [selectedProjects, fetchAllBuTasks]);

  // Effect to handle projects data  
  useEffect(() => {
    console.log("🔄 Projects data effect triggered", {
      hasSelectedProjects: !!selectedProjects,
      projectsCount: selectedProjects?.length || 0,
      hasAllBuTasks: !!allBuTasks,
      buTasksCount: allBuTasks?.length || 0,
      hasAssignments: !!selectedAssignments,
      assignmentsCount: selectedAssignments?.length || 0
    });

    if (selectedProjects && selectedProjects.length > 0) {
      console.log("=== PROJECT COMPLETION ANALYSIS (Dashboard BU) ===");
      console.log("Total BU projects:", selectedProjects.length);
      console.log("Total assignments available:", selectedAssignments?.length || 0);
      console.log("Total BU tasks available:", allBuTasks?.length || 0);
      
      // DEBUG: Compare data sources
      console.log("\n🔍 DATA SOURCE COMPARISON:");
      console.log("Dashboard BU gets projects from: getAllBuProjects(businessUnit)");
      console.log("Reports gets projects from: getAllProjects() + getTasksByManagerId()");
      console.log("Current user businessUnit:", user?.businessUnit);
      console.log("Current user role:", user?.role);
      
      // Show which projects we have
      console.log("\n📋 BU PROJECTS LIST:");
      selectedProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name || project.projectName} (ID: ${project._id})`);
        console.log(`   Owner: ${project.owner?.fullName || project.owner}`);
        console.log(`   Stored Progress: ${project.progress || 0}%`);
      });
      
      // Debug: Show project names
      console.log("BU Projects:", selectedProjects.map(p => ({ id: p._id, name: p.name || p.projectName })));
      
      // Debug: Show which projects have assignments
      if (selectedAssignments && selectedAssignments.length > 0) {
        const projectsWithAssignments = [...new Set(selectedAssignments.map(a => a.project?._id || a.project).filter(Boolean))];
        console.log("Projects with assignments:", projectsWithAssignments.length);
        
        // Check if assignments contain populated task data
        const sampleAssignment = selectedAssignments[0];
        console.log("Sample assignment structure:", {
          hasProject: !!sampleAssignment.project,
          hasTaskId: !!sampleAssignment.taskId,
          taskIdStructure: sampleAssignment.taskId ? Object.keys(sampleAssignment.taskId) : 'null',
          hasWorkload: !!sampleAssignment.taskId?.workload,
          workloadValue: sampleAssignment.taskId?.workload
        });
      }
      
      const projectWorkloadData = selectedProjects.map((project) => {
        // Use allBuTasks if available, otherwise fallback to assignments
        let projectTasks = [];
        
        if (allBuTasks && allBuTasks.length > 0) {
          // Primary approach: Use actual tasks (same as Reports)
          projectTasks = allBuTasks.filter(task => {
            const taskProjectId = task.project?._id || task.project;
            return taskProjectId?.toString() === project._id?.toString();
          });
        } else if (selectedAssignments && selectedAssignments.length > 0) {
          // Fallback approach: Extract tasks from assignments  
          const projectAssignments = selectedAssignments.filter(assignment => {
            const assignmentProjectId = assignment.project?._id || assignment.project;
            return assignmentProjectId?.toString() === project._id?.toString();
          });
          
          projectTasks = projectAssignments.map(assignment => assignment.taskId).filter(task => task != null);
        } else {
          // Last fallback: Use project's own progress if no tasks/assignments available
          console.log(`⚠ No tasks or assignments found for project ${project.name || project.projectName}, using project.progress`);
          projectTasks = []; // Empty, will use project.progress below
        }
        
        const isTrulyComplete = isProjectTrulyComplete(project, allBuTasks.length > 0 ? allBuTasks : 
          selectedAssignments?.map(a => a.taskId).filter(t => t != null) || []);
        
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
        } else {
          // Use project's own progress as fallback
          realProgress = project.progress || 0;
          console.log(`📊 Using fallback progress for ${project.name || project.projectName}: ${realProgress}%`);
        }
        
        // DETAILED DEBUG FOR DATA COMPARISON
        console.log(`\n🔍 [Dashboard BU] DETAILED ANALYSIS - Project "${project.name || project.projectName}":`, {
          projectId: project._id,
          dataSource: allBuTasks.length > 0 ? 'Direct BU Tasks (getBuTaskByProjectID)' : 'Tasks from Assignments',
          
          // Old vs New Progress
          oldProgress: project.progress,
          calculatedProgress: realProgress,
          progressMatch: project.progress === realProgress,
          
          // Task Details
          totalTasks: projectTasks.length,
          tasksByPhase: {
            Planning: projectTasks.filter(t => t.projectPhase === 'Planning').length,
            Design: projectTasks.filter(t => t.projectPhase === 'Design').length,
            Development: projectTasks.filter(t => t.projectPhase === 'Development').length,
            Testing: projectTasks.filter(t => t.projectPhase === 'Testing').length,
          },
          
          // Phase Progress Calculation (like Reports)
          phaseProgresses: (() => {
            const STEP_ORDER = ["Planning", "Design", "Development", "Testing"];
            return STEP_ORDER.map((phase) => {
              const tasksInPhase = projectTasks.filter(task => task.projectPhase === phase);
              if (tasksInPhase.length === 0) return { phase, progress: 0, taskCount: 0 };
              
              const avgProgress = tasksInPhase.reduce((sum, task) => sum + (task.workload || 0), 0) / tasksInPhase.length;
              return { 
                phase, 
                progress: Math.round(avgProgress), 
                taskCount: tasksInPhase.length,
                taskWorkloads: tasksInPhase.map(t => t.workload || 0)
              };
            });
          })(),
          
          // All Task Details
          allTaskDetails: projectTasks.map(t => ({
            taskId: t._id,
            taskName: t.taskName,
            phase: t.projectPhase,
            workload: t.workload || 0,
            projectId: t.project?._id || t.project
          }))
        });
        
        // Compare with what Reports should show
        if (allBuTasks.length > 0) {
          console.log(`\n📊 [Dashboard BU vs Reports] COMPARISON for "${project.name || project.projectName}":`);
          console.log(`Dashboard BU: Uses getBuTaskByProjectID() → filters by BusinessUnit`);
          console.log(`Reports: Uses getTasksByManagerId() → filters by Manager`);
          console.log(`Expected result: SAME progress if project belongs to manager in same BU`);
          console.log(`Calculated Progress: ${realProgress}%`);
          console.log(`Task Count: ${projectTasks.length}`);
          console.log(`Has all phases: ${['Planning', 'Design', 'Development', 'Testing'].every(phase => 
            projectTasks.some(t => t.projectPhase === phase)
          )}`);
        }
        
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
      
      // Calculate average BU progress (mean of all project progresses)
      const totalProgress = projectWorkloadData.reduce((sum, project) => sum + project.progress, 0);
      const avgProgress = projectWorkloadData.length > 0 ? totalProgress / projectWorkloadData.length : 0;
      setAverageBuProgress(Math.round(avgProgress));
      
      console.log("📊 ProjectWorkload data for charts:", projectWorkloadData?.map(p => ({
        project: p.project,
        progress: p.progress,
        dataAvailable: p.progress > 0
      })));
      
      console.log("📊 BU Progress Summary:", {
        totalProjects: projectWorkloadData.length,
        activeProjects: activeProjects?.length,
        completedProjects: completedProjects?.length,
        averageProgress: Math.round(avgProgress) + '%',
        completionRatio: Math.round(((completedProjects?.length / projectWorkloadData.length) || 0) * 100) + '%'
      });
    }
  }, [selectedProjects, selectedAssignments, allBuTasks, user?.businessUnit, user?.role]);

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
      
      // Calculate progress metrics for StatBoxes
      const totalBuMembers = allBuMembers.length;
      const managersRatio = totalBuMembers > 0 ? buManagers.length / totalBuMembers : 0;
      const teamMembersRatio = totalBuMembers > 0 ? buTeamMembersOnly.length / totalBuMembers : 0;
      
      setManagersProgress(managersRatio);
      setTeamMembersProgress(teamMembersRatio);
      
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
        
        // Calculate assignments progress (active vs total possible)
        const totalPossibleAssignments = allBuMembers.length * 2; // Assume each member could have ~2 assignments
        const assignmentsRatio = totalPossibleAssignments > 0 ? buAssignmentsData.length / totalPossibleAssignments : 0;
        setAssignmentsProgress(Math.min(assignmentsRatio, 1)); // Cap at 100%
        
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
    dispatch(getBU()); // Get all business units to resolve BU names
    
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
            progress={managersProgress}
            icon={
              <PersonAddIcon
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
            title={totalTeamMembersCount || "0"}
            subtitle="Team Members (excl. Managers)"
            progress={teamMembersProgress}
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
            progress={assignmentsProgress}
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
              projectWorkload={projectWorkload && projectWorkload.length > 0 ? projectWorkload : [
                { project: "Loading...", progress: 0 }
              ]} 
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
              progress={averageBuProgress / 100} 
              size="125" 
            />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              {averageBuProgress}% Average Progress
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "center", color: colors.grey[300] }}>
              {completedProjectsCount} of {totalProjectsCount} projects completed
            </Typography>
            <Typography>Business Unit: {selectedBusinessUnits?.find(bu => 
              bu._id === (typeof user?.businessUnit === 'object' ? user?.businessUnit?._id : user?.businessUnit)
            )?.name || user?.businessUnit?.name || "N/A"}</Typography>
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
            Hierarchical Distribution
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