const Assignment = require("../models/AssignmentModel");
const User = require("../models/userModel");
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
      const employeeFound = await User.findById(employee);
      if (!employeeFound) {
        throw new Error("User member not found");
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
      .populate("employee", "fullName keySkills jobTitle dateOfJoining yearsOfExperience")
      .populate("taskId", "taskName workload")
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

const updateAssignmentTimeEntry = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { date, durationInDays = 1, timeType } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    // Check if an entry already exists for the given date
    const entryIndex = assignment.timeEntries.findIndex(
      (entry) =>
        entry.date.toISOString().split("T")[0] ===
        new Date(date).toISOString().split("T")[0]
    );

    if (entryIndex !== -1) {
      // Entry exists, update it
      assignment.timeEntries[entryIndex].durationInDays = durationInDays;
      assignment.timeEntries[entryIndex].timeType = timeType;
    } else {
      // Entry does not exist, create new
      const newTimeEntry = {
        date: new Date(date),
        durationInDays,
        timeType,
      };
      assignment.timeEntries.push(newTimeEntry);
    }
    await assignment.save();

    res
      .status(200)
      .json({ message: "Time entry updated successfully", assignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const updateAssignmentTimeEntries = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const entries = req.body; // Expecting array of { date, durationInDays, timeType }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    entries.forEach(({ date, durationInDays = 1, timeType }) => {
      const normalizedDate = new Date(date).toISOString().split("T")[0];

      const entryIndex = assignment.timeEntries.findIndex(
        (entry) => entry.date.toISOString().split("T")[0] === normalizedDate
      );

      if (entryIndex !== -1) {
        // Update existing entry
        assignment.timeEntries[entryIndex].durationInDays = durationInDays;
        assignment.timeEntries[entryIndex].timeType = timeType;
      } else {
        // Add new entry
        assignment.timeEntries.push({
          date: new Date(date),
          durationInDays,
          timeType,
        });
      }
    });

    await assignment.save();

    res.status(200).json({
      message: "Time entries updated successfully",
      assignment,
    });
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

// Get assignments for a specific employee (like Jeff Bezos in your screenshot)
const getAllEmployeesAssignments = async (req, res) => {
  try {
    let query = {};
    const currentUser = req.user;

    // Si l'utilisateur est Manager, retourner seulement les affectations de SES employés
    if (currentUser.role === "Manager") {
      // Trouver tous les employés qui ont ce manager
      const teamMembers = await User.find({
        manager: currentUser._id,
        role: { $nin: ["RH", "BUDirector", "Manager"] }
      }).select("_id");
      
      const employeeIds = teamMembers.map(emp => emp._id);
      query.employee = { $in: employeeIds };
    }
    // Si l'utilisateur est DirecteurBU, retourner les affectations de sa Business Unit
    else if (currentUser.role === "BUDirector") {
      // Trouver tous les managers qui appartiennent à la même Business Unit
      const managersInSameBU = await User.find({
        businessUnit: currentUser.businessUnit,
        role: "Manager"
      }).select("_id");
      
      // Trouver tous les employés de ces managers
      const employeesInBU = await User.find({
        manager: { $in: managersInSameBU.map(m => m._id) },
        role: { $nin: ["RH", "BUDirector", "Manager"] }
      }).select("_id");
      
      const employeeIds = employeesInBU.map(emp => emp._id);
      query.employee = { $in: employeeIds };
    }
    // Pour les autres rôles (Admin, etc.), retourner toutes les affectations
    // Si aucune condition n'est remplie, query reste vide = toutes les affectations

    const assignments = await Assignment.find(query)
      .populate("project")
      .populate("employee", "fullName keySkills profilePicture jobTitle dateOfJoining yearsOfExperience")
      .populate("taskId")
      .sort({ startDate: 1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments for a specific employee (like Jeff Bezos in your screenshot)
const getAssignmentsForEmployee = async (req, res) => {
  try {
    const assignments = await Assignment.find({ employee: req.user._id })
      .populate("project", "client projectName requiredSkills")
      .populate("employee", "fullName keySkills jobTitle dateOfJoining yearsOfExperience")
      .populate("taskId", "taskName workload")
      .sort({ startDate: 1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update assignment dates or details (like your date pickers)
const updateAssignement = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndUpdate(
      { _id: id },
      req.body,
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

module.exports = {
  createAssignment,
  getEmployeeAssignments,
  updateAssignmentDates,
  deleteAssignment,
  getAllEmployeesAssignments,
  getAssignmentsForEmployee,
  updateAssignmentTimeEntry,
  updateAssignmentTimeEntries,
  updateAssignement,
};
