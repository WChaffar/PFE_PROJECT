const mongoose = require("mongoose");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
const Project = require("../models/projectModel");

// MongoDB connection
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function analyzeAndFixTaskBudgets() {
  try {
    console.log("🔍 Analyzing task budgets...\n");

    // Get all tasks
    const tasks = await Task.find().populate("project", "projectName").populate("owner", "fullName");
    console.log(`Found ${tasks.length} tasks total\n`);

    // Analyze budget distribution
    const budgets = tasks.map(t => t.budget).sort((a, b) => a - b);
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);
    const avgBudget = budgets.reduce((sum, b) => sum + b, 0) / budgets.length;
    
    console.log("📊 Budget statistics:");
    console.log(`   Min budget: ${minBudget} days`);
    console.log(`   Max budget: ${maxBudget} days`);
    console.log(`   Average budget: ${avgBudget.toFixed(2)} days`);
    console.log(`   Median budget: ${budgets[Math.floor(budgets.length / 2)]} days\n`);

    // Find tasks with unusually high budgets
    const highBudgetThreshold = 50; // Consider budgets over 50 days as high
    const veryHighBudgetThreshold = 100; // Consider budgets over 100 days as very high

    const highBudgetTasks = tasks.filter(t => t.budget > highBudgetThreshold);
    const veryHighBudgetTasks = tasks.filter(t => t.budget > veryHighBudgetThreshold);

    console.log(`📈 High budget analysis:`);
    console.log(`   Tasks with budget > ${highBudgetThreshold} days: ${highBudgetTasks.length}`);
    console.log(`   Tasks with budget > ${veryHighBudgetThreshold} days: ${veryHighBudgetTasks.length}\n`);

    if (veryHighBudgetTasks.length > 0) {
      console.log("🚨 Tasks with very high budgets (>100 days):");
      veryHighBudgetTasks.forEach((task, index) => {
        console.log(`${index + 1}. "${task.taskName}"`);
        console.log(`   Budget: ${task.budget} days`);
        console.log(`   Project: ${task.project.projectName}`);
        console.log(`   Owner: ${task.owner.fullName}`);
        console.log(`   Phase: ${task.projectPhase}`);
        console.log("");
      });
    }

    if (highBudgetTasks.length > 0) {
      console.log("⚠️  Tasks with high budgets (50-100 days):");
      const moderateHighTasks = highBudgetTasks.filter(t => t.budget <= veryHighBudgetThreshold);
      moderateHighTasks.forEach((task, index) => {
        console.log(`${index + 1}. "${task.taskName}" - ${task.budget} days (${task.project.projectName})`);
      });
      console.log("");
    }

    // Propose corrections
    console.log("🔧 Correction recommendations:");
    
    const corrections = [];
    
    // For very high budget tasks (>100 days), reduce to reasonable ranges
    veryHighBudgetTasks.forEach(task => {
      let newBudget;
      
      // Assign budget based on phase
      switch (task.projectPhase) {
        case "Planning":
          newBudget = Math.floor(Math.random() * 10) + 5; // 5-14 days
          break;
        case "Design":
          newBudget = Math.floor(Math.random() * 15) + 10; // 10-24 days
          break;
        case "Development":
          newBudget = Math.floor(Math.random() * 20) + 15; // 15-34 days
          break;
        case "Testing":
          newBudget = Math.floor(Math.random() * 12) + 8; // 8-19 days
          break;
        default:
          newBudget = Math.floor(Math.random() * 15) + 10; // 10-24 days
      }
      
      corrections.push({
        taskId: task._id,
        taskName: task.taskName,
        oldBudget: task.budget,
        newBudget: newBudget,
        reason: `Very high budget (${task.budget} days) reduced to reasonable ${task.projectPhase} phase budget`
      });
    });

    // For moderately high budget tasks (50-100 days), reduce more conservatively
    const moderateHighTasks = highBudgetTasks.filter(t => t.budget <= veryHighBudgetThreshold && t.budget > 50);
    moderateHighTasks.forEach(task => {
      let newBudget;
      
      // Reduce by 30-50% but keep reasonable for phase
      const reductionFactor = 0.3 + Math.random() * 0.2; // 30-50% reduction
      let reducedBudget = Math.floor(task.budget * (1 - reductionFactor));
      
      // Ensure minimum reasonable budget based on phase
      switch (task.projectPhase) {
        case "Planning":
          newBudget = Math.max(reducedBudget, 5);
          break;
        case "Design":
          newBudget = Math.max(reducedBudget, 10);
          break;
        case "Development":
          newBudget = Math.max(reducedBudget, 15);
          break;
        case "Testing":
          newBudget = Math.max(reducedBudget, 8);
          break;
        default:
          newBudget = Math.max(reducedBudget, 10);
      }
      
      // Cap at reasonable maximum (40 days)
      newBudget = Math.min(newBudget, 40);
      
      if (newBudget !== task.budget) {
        corrections.push({
          taskId: task._id,
          taskName: task.taskName,
          oldBudget: task.budget,
          newBudget: newBudget,
          reason: `High budget (${task.budget} days) reduced by ${Math.round((1 - newBudget/task.budget) * 100)}%`
        });
      }
    });

    if (corrections.length === 0) {
      console.log("✅ No budget corrections needed!");
      return;
    }

    console.log(`📝 Proposed corrections for ${corrections.length} tasks:`);
    corrections.forEach((correction, index) => {
      console.log(`${index + 1}. "${correction.taskName}"`);
      console.log(`   ${correction.oldBudget} days → ${correction.newBudget} days`);
      console.log(`   Reason: ${correction.reason}\n`);
    });

    // Apply corrections
    console.log("🔧 Applying corrections...");
    let successCount = 0;
    
    for (const correction of corrections) {
      try {
        await Task.findByIdAndUpdate(correction.taskId, { 
          budget: correction.newBudget 
        });
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update task ${correction.taskName}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${successCount}/${corrections.length} tasks!`);

    // Final verification
    console.log("\n🔍 Final verification...");
    const updatedTasks = await Task.find();
    const newBudgets = updatedTasks.map(t => t.budget).sort((a, b) => a - b);
    const newMaxBudget = Math.max(...newBudgets);
    const newAvgBudget = newBudgets.reduce((sum, b) => sum + b, 0) / newBudgets.length;
    const newHighBudgetCount = updatedTasks.filter(t => t.budget > 50).length;

    console.log("📊 New budget statistics:");
    console.log(`   Max budget: ${newMaxBudget} days (was ${maxBudget})`);
    console.log(`   Average budget: ${newAvgBudget.toFixed(2)} days (was ${avgBudget.toFixed(2)})`);
    console.log(`   Tasks with budget > 50 days: ${newHighBudgetCount} (was ${highBudgetTasks.length})`);

  } catch (error) {
    console.error("❌ Error during analysis:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the analysis
analyzeAndFixTaskBudgets();