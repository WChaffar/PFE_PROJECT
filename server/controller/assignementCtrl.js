const Assignment = require('../models/AssignmentModel');
const Team = require('../models/teamModel');
const Project = require('../models/projectModel');

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { employeeId, projectId, missionName, taskName, startDate, endDate, 
            assignmentType, dayDetails } = req.body;

    // Validate employee exists
    const employee = await Team.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate skill match score (simple implementation)
    const employeeSkills = new Set(employee.skills.map(s => s.toLowerCase()));
    const requiredSkills = new Set(project.requiredSkills.map(s => s.toLowerCase()));
    const intersection = new Set([...employeeSkills].filter(s => requiredSkills.has(s)));
    const skillMatchScore = intersection.size / requiredSkills.size;

    // Create assignment
    const assignment = new Assignment({
      employee: employeeId,
      project: projectId,
      missionName,
      taskName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      assignmentType,
      dayDetails: dayDetails.map(detail => ({
        date: new Date(detail.date),
        period: detail.period
      })),
      skillMatchScore,
      status: 'assigned',
      recommendations: skillMatchScore < 0.7 ? 
        'Warning: Employee skills don\'t fully match project requirements' : 
        'Good match: Employee skills align with project needs'
    });

    await assignment.save();

    // Add assignment to employee
    employee.assignments.push(assignment._id);
    await employee.save();

    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get assignments for a specific employee (like Jeff Bezos in your screenshot)
exports.getEmployeeAssignments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const assignments = await Assignment.find({ employee: employeeId })
      .populate('project', 'client projectName requiredSkills')
      .populate('employee', 'fullName keySkills')
      .sort({ startDate: 1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update assignment dates or details (like your date pickers)
exports.updateAssignmentDates = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { startDate, endDate, dayDetails } = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dayDetails: dayDetails.map(detail => ({
          date: new Date(detail.date),
          period: detail.period
        }))
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Delete an assignment
exports.deleteAssignment = async (req, res) => {
    try {
      const { assignmentId } = req.params;
  
      // 1. Find and validate the assignment exists
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
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
        message: 'Assignment deleted successfully',
        deletedAssignment: assignment
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to delete assignment',
        details: error.message 
      });
    }
  };