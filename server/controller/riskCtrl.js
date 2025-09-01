const Assignment = require("../models/AssignmentModel");
const Risk = require("../models/RiskModel");
const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModel");
const Task = require("../models/taskModel");

// --- Helpers dates ---
function toYMD(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function fromYMD(ymd) {
  return new Date(ymd + "T00:00:00Z");
}
function addDaysYMD(ymd, n) {
  const dt = fromYMD(ymd);
  dt.setUTCDate(dt.getUTCDate() + n);
  return toYMD(dt);
}

// --- Slots par affectation ---
function getAssignmentSlots(assignment) {
  const slotsByDate = {};
  const dayDetailsMap = {};

  if (assignment.dayDetails && assignment.dayDetails.length > 0) {
    assignment.dayDetails.forEach((d) => {
      const dateKey = toYMD(d.date);
      if (!dayDetailsMap[dateKey]) dayDetailsMap[dateKey] = [];
      if (d.period === "Morning") dayDetailsMap[dateKey].push("morning");
      if (d.period === "Afternoon") dayDetailsMap[dateKey].push("afternoon");
    });
  }

  if (assignment.startDate && assignment.endDate) {
    let current = fromYMD(toYMD(assignment.startDate));
    const end = fromYMD(toYMD(assignment.endDate));
    while (current <= end) {
      const dayOfWeek = current.getUTCDay(); // 0 = dimanche, 6 = samedi
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // ignorer samedi & dimanche
        const dateKey = toYMD(current);
        if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];

        if (dayDetailsMap[dateKey]) {
          slotsByDate[dateKey].push(...dayDetailsMap[dateKey]);
        } else {
          slotsByDate[dateKey].push("full");
        }
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
  }

  return slotsByDate;
}

// --- Vérifie surcharge ---
function isOvercharged(slots) {
  const set = new Set(slots);
  if (set.has("morning") && set.has("afternoon") && slots.length === 2)
    return false;
  if (set.size === 1 && slots.length === 1) return false;
  if (set.has("full") && set.size > 1) return true;
  if (slots.length > 2) return true;
  if (slots.length === 2 && slots[0] === slots[1]) return true;
  return false;
}

// --- Groupement dates continues ---
function groupConsecutiveDates(dates) {
  if (dates.length === 0) return [];
  dates.sort();
  const intervals = [];
  let start = dates[0];
  let prev = dates[0];

  for (let i = 1; i < dates.length; i++) {
    const current = dates[i];
    const expectedNext = addDaysYMD(prev, 1);
    if (current !== expectedNext) {
      intervals.push([start, prev]);
      start = current;
    }
    prev = current;
  }
  intervals.push([start, prev]);
  return intervals;
}

// --- API ---
const detectOverchargeRisks = asyncHandler(async (req, res) => {
  try {
    const assignments = await Assignment.find({ Owner: req.user._id }).populate(
      "employee",
      "fullName"
    ); // 🔹 Ajout du fullName

    const schedule = {}; // { empId: { date: [slots] } }
    const newRisks = [];

    for (const a of assignments) {
      const empId = String(a.employee._id);
      const empName = a.employee.fullName; // 🔹 Récupération du fullName
      const slotsByDate = getAssignmentSlots(a);
      if (!schedule[empId]) schedule[empId] = {};
      for (const [date, slots] of Object.entries(slotsByDate)) {
        if (!schedule[empId][date]) schedule[empId][date] = [];
        schedule[empId][date].push(...slots);
      }

      for (const [start, end] of groupConsecutiveDates(
        Object.entries(schedule[empId])
          .filter(([_, slots]) => isOvercharged(slots))
          .map(([date]) => date)
          .filter((date) => {
            const day = fromYMD(date).getUTCDay();
            return day !== 0 && day !== 6;
          })
      )) {
        const description =
          start === end
            ? `Employee ${empName} (ID: ${empId}) is overloaded on ${start}.`
            : `Employee ${empName} (ID: ${empId}) is overloaded from ${start} to ${end}.`; // 🔹 Description modifiée

        const existing = await Risk.findOne({
          responsibleId: req.user._id,
          description,
        });

        if (!existing) {
          const risk = await Risk.create({
            projectId: null,
            responsibleId: req.user._id,
            name: "Salary Overcharge Risk",
            description,
            severity: "Low",
            identificationDate: new Date(),
          });
          newRisks.push(risk);
        }
      }
    }

    res.status(200).json({ newRisksDetected: newRisks.length, newRisks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- API modifiée ---
const getRisksForManager = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const newRisks = [];

    // 1️⃣ Détecter les risques liés aux projets dépassant la deadline
    const projects = await Project.find({ owner: userId });
    for (const project of projects) {
      const tasks = await Task.find({ project: project._id });
      const hasIncompleteTasks = tasks.some((t) => t.workload < 100);

      const now = new Date();
      if (project.endDate < now && hasIncompleteTasks) {
        const riskData = {
          projectId: project._id,
          responsibleId: userId,
          name: "Project Deadline Risk",
          description: `The project "${project.projectName}" has passed its end date and contains incomplete tasks.`,
          severity: "High",
        };

        const exists = await Risk.findOne(riskData); // éviter doublons
        if (!exists) {
          const risk = await Risk.create({
            ...riskData,
            identificationDate: new Date(),
          });
          newRisks.push(risk);
        }
      }
    }

    // 2️⃣ Détecter les risques liés aux tâches dépassant la deadline
    const tasks = await Task.find({ owner: userId }).populate(
      "project",
      "projectName"
    );
    for (const task of tasks) {
      const now = new Date();
      if (task.endDate < now && task.workload < 100) {
        const projectName = task.project?.projectName || "Projet inconnu";

        const riskData = {
          projectId: task.project?._id || null,
          responsibleId: userId,
          name: "Task Deadline Risk",
          description: `The task "${task.taskName}" in project "${projectName}" is overdue and not completed.`,
          severity: "Medium",
        };

        const exists = await Risk.findOne(riskData); // éviter doublons
        if (!exists) {
          const risk = await Risk.create({
            ...riskData,
            identificationDate: new Date(),
          });
          newRisks.push(risk);
        }
      }
    }

    // 3️⃣ Retourner les nouveaux risques détectés + risques existants
    const allRisks = await Risk.find({ responsibleId: userId });
    res.status(200).json(allRisks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { detectOverchargeRisks, getRisksForManager };
