const Project = require("../models/projectModel");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
const Assignment = require("../models/AssignmentModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// Generate individual project report
const generateProjectReport = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;

    validateMongoDbId(id);

    // Find the project with populated data
    const project = await Project.findOne({
      _id: id,
      owner: req.user?._id,
    }).populate('owner', 'fullName');

    if (!project) {
      return res.status(404).json({ message: "Project not found or access denied." });
    }

    // Get related tasks and assignments with more detailed population
    const tasks = await Task.find({ project: id })
      .populate('owner', 'fullName');

    const assignments = await Assignment.find({ project: id })
      .populate('employee', 'fullName jobTitle department')
      .populate('Owner', 'fullName');

    // Calculate detailed project statistics and KPIs
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      overdueTasks: tasks.filter(task => new Date(task.endDate) < new Date() && task.status !== 'completed').length,
      totalAssignments: assignments.length,
      activeAssignments: assignments.filter(assignment => assignment.status === 'active').length,
      completedAssignments: assignments.filter(assignment => assignment.status === 'completed').length,
    };

    // Calculate time-based KPIs
    const projectDuration = Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
    const timeElapsed = Math.ceil((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
    const timeRemaining = Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    // Budget and resource KPIs
    const budgetUtilization = assignments.reduce((total, assignment) => {
      return total + (assignment.timeEntries ? assignment.timeEntries.reduce((sum, entry) => sum + (entry.durationInDays || 0), 0) : 0);
    }, 0);

    const kpis = {
      taskCompletionRate: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0,
      assignmentCompletionRate: stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0,
      budgetUtilizationRate: project.budget > 0 ? Math.round((budgetUtilization / project.budget) * 100) : 0,
      schedulePerformance: projectDuration > 0 ? Math.round((timeElapsed / projectDuration) * 100) : 0,
      onTimeDeliveryRisk: timeRemaining < 0 ? 'High' : timeRemaining < 7 ? 'Medium' : 'Low',
      teamSize: assignments.length,
      averageTaskDuration: tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => {
        const taskDuration = Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24));
        return sum + taskDuration;
      }, 0) / tasks.length) : 0,
    };

    // Team composition analysis
    const teamComposition = assignments.reduce((acc, assignment) => {
      const member = assignment.employee; // Utiliser seulement 'employee' qui existe dans le modèle
      if (member) {
        const department = member.department || 'Non assigné';
        const jobTitle = member.jobTitle || 'Non spécifié';
        
        if (!acc.byDepartment[department]) acc.byDepartment[department] = 0;
        if (!acc.byJobTitle[jobTitle]) acc.byJobTitle[jobTitle] = 0;
        
        acc.byDepartment[department]++;
        acc.byJobTitle[jobTitle]++;
      }
      return acc;
    }, { byDepartment: {}, byJobTitle: {} });

    // Calculate project progress
    const progress = calculateProjectProgress(project);
    const status = getProjectStatus(project);

    // Debug - Check raw assignment data from database
    console.log('Raw assignments from DB:');
    const rawAssignments = await Assignment.find({ project: id });
    rawAssignments.forEach((assignment, index) => {
      console.log(`Raw Assignment ${index}:`, {
        id: assignment._id,
        employee: assignment.employee,
        Owner: assignment.Owner,
        project: assignment.project
      });
    });

    // Prepare comprehensive report data
    const reportData = {
      project: {
        id: project._id,
        name: project.projectName,
        description: project.description,
        client: project.client,
        type: project.projectType,
        category: project.projectCategory,
        priority: project.projectPriority,
        budget: project.budget, // En jours
        additionalFunding: project.additionalFunding,
        startDate: project.startDate,
        endDate: project.endDate,
        deliveryDate: project.deliveryDate,
        owner: project.owner,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      stats,
      kpis,
      progress,
      status,
      timeline: {
        projectDuration,
        timeElapsed,
        timeRemaining,
        budgetUtilization,
      },
      teamComposition,
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.taskName, // Le champ s'appelle taskName dans le modèle
        description: task.description,
        status: 'pending', // Valeur par défaut car pas de status dans le modèle Task
        priority: 'medium', // Valeur par défaut car pas de priority dans le modèle Task
        assignedTo: null, // Les tâches ne sont pas directement assignées, c'est via Assignment
        owner: task.owner,
        startDate: task.startDate,
        endDate: task.endDate,
        estimatedDuration: Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)),
        isOverdue: new Date(task.endDate) < new Date(),
        projectPhase: task.projectPhase,
        budget: task.budget,
        requiredSkills: task.requiredSkills,
      })),
      assignments: assignments.map(assignment => ({
        id: assignment._id,
        assignedTo: assignment.employee, // Le champ correct est 'employee'
        role: assignment.role || 'Member', // Valeur par défaut
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        status: assignment.status || 'active', // Valeur par défaut
        timeEntries: assignment.timeEntries || [],
        totalDaysWorked: assignment.timeEntries ? assignment.timeEntries.reduce((sum, entry) => sum + (entry.durationInDays || 0), 0) : 0,
        Owner: assignment.Owner,
        // Données brutes pour debug côté client
        employeeId: assignment.employee?._id || assignment.employee,
        ownerId: assignment.Owner?._id || assignment.Owner
      })),
      generatedAt: new Date(),
      format: format || 'json',
    };

    // Return the report data
    res.status(200).json({
      message: "Project report generated successfully",
      data: reportData,
      reportId: `project_${project._id}_${Date.now()}`,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate bulk projects report
const generateBulkReport = asyncHandler(async (req, res) => {
  try {
    const { format } = req.query;
    const { projectIds } = req.query;

    let query = { owner: req.user?._id };
    
    // If specific project IDs are provided, filter by them
    if (projectIds) {
      const ids = projectIds.split(',');
      query._id = { $in: ids };
    }

    // Find all projects for the user
    const projects = await Project.find(query).populate('owner', 'fullName');

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found." });
    }

    // Generate comprehensive report for each project
    const reportData = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id })
          .populate('owner', 'fullName');
        const assignments = await Assignment.find({ project: project._id })
          .populate('employee', 'fullName jobTitle department')
          .populate('Owner', 'fullName');

        // Debug logs for bulk report
        if (assignments.length > 0) {
          console.log(`Project ${project.projectName} - assignments:`, assignments.length);
          console.log('Assignment sample:', assignments[0]?.employee?.fullName);
        }



        // Calculate detailed stats
        const stats = {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(task => task.status === 'completed').length,
          inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
          overdueTasks: tasks.filter(task => new Date(task.endDate) < new Date() && task.status !== 'completed').length,
          totalAssignments: assignments.length,
          activeAssignments: assignments.filter(assignment => assignment.status === 'active').length,
        };

        // Calculate KPIs
        const budgetUtilization = assignments.reduce((total, assignment) => {
          return total + (assignment.timeEntries ? assignment.timeEntries.reduce((sum, entry) => sum + (entry.durationInDays || 0), 0) : 0);
        }, 0);

        const projectDuration = Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
        const timeElapsed = Math.ceil((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24));

        const kpis = {
          taskCompletionRate: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0,
          budgetUtilizationRate: project.budget > 0 ? Math.round((budgetUtilization / project.budget) * 100) : 0,
          schedulePerformance: projectDuration > 0 ? Math.round((timeElapsed / projectDuration) * 100) : 0,
          teamSize: assignments.length,
        };

        // Team composition
        const teamComposition = assignments.reduce((acc, assignment) => {
          const member = assignment.employee; // Utiliser seulement 'employee'
          if (member) {
            const department = member.department || 'Non assigné';
            if (!acc[department]) acc[department] = 0;
            acc[department]++;
          }
          return acc;
        }, {});

        return {
          id: project._id,
          name: project.projectName,
          description: project.description,
          client: project.client,
          type: project.projectType,
          category: project.projectCategory,
          priority: project.projectPriority,
          budget: project.budget, // En jours
          startDate: project.startDate,
          endDate: project.endDate,
          deliveryDate: project.deliveryDate,
          progress: calculateProjectProgress(project),
          status: getProjectStatus(project),
          stats,
          kpis,
          teamComposition,
          tasks: tasks.length,
          assignments: assignments.length,
          budgetUtilization,
          createdAt: project.createdAt,
        };
      })
    );

    // Calculate comprehensive summary statistics
    const summary = {
      totalProjects: reportData.length,
      totalBudget: reportData.reduce((sum, project) => sum + project.budget, 0), // En jours
      totalBudgetUtilized: reportData.reduce((sum, project) => sum + project.budgetUtilization, 0),
      averageBudgetUtilization: Math.round(reportData.reduce((sum, project) => sum + project.kpis.budgetUtilizationRate, 0) / reportData.length),
      averageTaskCompletion: Math.round(reportData.reduce((sum, project) => sum + project.kpis.taskCompletionRate, 0) / reportData.length),
      totalTeamMembers: reportData.reduce((sum, project) => sum + project.kpis.teamSize, 0),
      projectsByType: reportData.reduce((acc, project) => {
        acc[project.type] = (acc[project.type] || 0) + 1;
        return acc;
      }, {}),
      projectsByStatus: reportData.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {}),
      projectsByPriority: reportData.reduce((acc, project) => {
        acc[project.priority] = (acc[project.priority] || 0) + 1;
        return acc;
      }, {}),
      projectsByCategory: reportData.reduce((acc, project) => {
        acc[project.category] = (acc[project.category] || 0) + 1;
        return acc;
      }, {}),
      overallKpis: {
        projectsOnTime: reportData.filter(p => p.kpis.schedulePerformance <= 100).length,
        projectsOverBudget: reportData.filter(p => p.kpis.budgetUtilizationRate > 100).length,
        highRiskProjects: reportData.filter(p => p.progress < 50 && p.kpis.schedulePerformance > 75).length,
      }
    };

    res.status(200).json({
      message: "Bulk report generated successfully",
      data: {
        projects: reportData,
        summary,
        generatedAt: new Date(),
        format: format || 'json',
        user: {
          id: req.user._id,
          name: req.user.fullName || 'Utilisateur',
        },
      },
      reportId: `bulk_projects_${Date.now()}`,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper function to calculate project progress
function calculateProjectProgress(project) {
  const now = new Date();
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  
  if (now < startDate) return 0;
  if (now > endDate) return 100;
  
  const totalDuration = endDate - startDate;
  const elapsed = now - startDate;
  return Math.round((elapsed / totalDuration) * 100);
}

// Helper function to determine project status
function getProjectStatus(project) {
  const now = new Date();
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  
  if (now < startDate) return 'Not Started';
  if (now > endDate) return 'Completed';
  return 'In Progress';
}

module.exports = {
  generateProjectReport,
  generateBulkReport,
};