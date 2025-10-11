const mongoose = require('mongoose');

// Import models
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Check current budgets
const checkCurrentBudgets = async () => {
  try {
    console.log('🔍 Vérification des budgets actuels...\n');
    
    await connectDB();
    
    // Get all projects with their budgets
    const projects = await Project.find({}, 'projectName budget');
    console.log('📊 BUDGETS DES PROJETS:');
    projects.forEach(project => {
      console.log(`  💼 ${project.projectName}: ${project.budget} jours`);
    });
    
    // Get all tasks with their budgets
    const tasks = await Task.find({}, 'taskName budget').sort({ budget: -1 });
    console.log('\n📊 BUDGETS DES TÂCHES (triés par budget décroissant):');
    tasks.forEach(task => {
      console.log(`  📋 ${task.taskName}: ${task.budget} jours`);
    });
    
    // Statistics
    const projectBudgets = projects.map(p => p.budget);
    const taskBudgets = tasks.map(t => t.budget);
    
    console.log('\n📈 STATISTIQUES:');
    console.log(`  📊 Projets - Min: ${Math.min(...projectBudgets)}, Max: ${Math.max(...projectBudgets)}, Moyenne: ${(projectBudgets.reduce((a,b) => a+b, 0) / projectBudgets.length).toFixed(1)} jours`);
    console.log(`  📊 Tâches - Min: ${Math.min(...taskBudgets)}, Max: ${Math.max(...taskBudgets)}, Moyenne: ${(taskBudgets.reduce((a,b) => a+b, 0) / taskBudgets.length).toFixed(1)} jours`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  checkCurrentBudgets();
}

module.exports = { checkCurrentBudgets };