const Assignment = require("../models/AssignmentModel");
const Team = require("../models/teamModel");
const Project = require("../models/projectModel");
const Task = require("../models/taskModel");
const { check, body, validationResult } = require("express-validator");
const expressAsyncHandler = require("express-async-handler");

// Middleware de validation de l'email
const validateAssignement = [
  check("startDate").isISO8601().withMessage("Start date is required"),
  check("endDate").isISO8601().withMessage("End date is required"),
  // Custom validator for date logic
  body().custom((body) => {
    const { startDate, endDate } = body;
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error("End date cannot be before start date.");
    }
    return true;
  }),
];

// Create a new assignment
const createAssignment = [
  validateAssignement,
  expressAsyncHandler(async (req, res) => {
    try {
      const {
        employee,
        project,
        taskId,
        startDate,
        endDate,
        assignmentType,
        dayDetails,
        totalDays,
      } = req.body;
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
          data: req.body,
        });
      }
      // Validate employee exists
      const employeeFound = await Team.findById(employee);
      if (!employeeFound) {
        throw new Error("Team member not found");
      }

      // Validate project exists
      const projectFound = await Project.findById(project);
      if (!projectFound) {
        throw new Error("Project not found");
      }

      // Validate project exists
      const taskFound = await Task.findById(taskId);
      if (!taskFound) {
        throw new Error("Task not found");
      }

      // Calculate skill match score (simple implementation)
      const employeeSkills = new Set(
        employeeFound.keySkills.map((s) => s.toLowerCase())
      );

      const requiredSkills = new Set(
        taskFound.requiredSkills.map((s) => s.toLowerCase())
      );

      const intersection = new Set(
        [...employeeSkills].filter((s) => requiredSkills.has(s))
      );

      const skillMatchScore = intersection.size / requiredSkills.size;

      // Create assignment
      const assignment = new Assignment({
        Owner: req.user._id,
        employee: employee,
        project: project,
        taskId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        assignmentType,
        totalDays,
        dayDetails: dayDetails,
        skillMatchScore,
        status: "assigned",
        recommendations:
          skillMatchScore < 0.7
            ? "Warning: Employee skills don't fully match project requirements"
            : "Good match: Employee skills align with project needs",
      });

      await assignment.save();

      // Add assignment to employee
      employeeFound.assignments.push(assignment._id);
      await employeeFound.save();

      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }),
];

// Get assignments for a specific employee (like Jeff Bezos in your screenshot)
const getEmployeeAssignments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const assignments = await Assignment.find({ employee: employeeId })
      .populate("project", "client projectName requiredSkills")
      .populate("employee", "fullName keySkills")
      .populate("taskId","taskName")
      .sort({ startDate: 1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update assignment dates or details (like your date pickers)
const updateAssignmentDates = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { startDate, endDate, dayDetails } = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dayDetails: dayDetails.map((detail) => ({
          date: new Date(detail.date),
          period: detail.period,
        })),
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an assignment
const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // 1. Find and validate the assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // 2. Remove assignment reference from the employee
    await Team.findByIdAndUpdate(
      assignment.employee,
      { $pull: { assignments: assignmentId } },
      { new: true }
    );

    // 3. Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({
      message: "Assignment deleted successfully",
      deletedAssignment: assignment,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete assignment",
      details: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getEmployeeAssignments,
  updateAssignmentDates,
  deleteAssignment,
};
