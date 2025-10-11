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

// Update budgets to realistic values
const updateBudgets = async () => {
  try {
    console.log('🔧 Mise à jour des budgets vers des valeurs réalistes...\n');
    
    await connectDB();
    
    // --- PROJECTS BUDGETS ---
    // Realistic project budgets: 30-180 days (1-6 months)
    const projects = await Project.find({});
    
    console.log('💼 MISE À JOUR DES BUDGETS PROJETS:');
    let projectsUpdated = 0;
    
    for (const project of projects) {
      // Generate realistic budget based on project type
      let newBudget;
      const projectName = project.projectName.toLowerCase();
      
      if (projectName.includes('plateforme') || projectName.includes('platform')) {
        newBudget = Math.floor(Math.random() * 61) + 120; // 120-180 jours (4-6 mois)
      } else if (projectName.includes('migration') || projectName.includes('warehouse')) {
        newBudget = Math.floor(Math.random() * 46) + 90; // 90-135 jours (3-4.5 mois)
      } else if (projectName.includes('crm') || projectName.includes('banking') || projectName.includes('monitoring')) {
        newBudget = Math.floor(Math.random() * 46) + 75; // 75-120 jours (2.5-4 mois)
      } else {
        newBudget = Math.floor(Math.random() * 31) + 60; // 60-90 jours (2-3 mois)
      }
      
      await Project.findByIdAndUpdate(project._id, { budget: newBudget });
      console.log(`  ✅ ${project.projectName}: ${project.budget} → ${newBudget} jours`);
      projectsUpdated++;
    }
    
    // --- TASKS BUDGETS ---
    // Realistic task budgets: 2-30 days
    const tasks = await Task.find({});
    
    console.log('\n📋 MISE À JOUR DES BUDGETS TÂCHES:');
    let tasksUpdated = 0;
    
    for (const task of tasks) {
      // Generate realistic budget based on task type
      let newBudget;
      const taskName = task.taskName.toLowerCase();
      
      if (taskName.includes('développement') || taskName.includes('development')) {
        newBudget = Math.floor(Math.random() * 16) + 15; // 15-30 jours
      } else if (taskName.includes('tests') || taskName.includes('test')) {
        newBudget = Math.floor(Math.random() * 8) + 5; // 5-12 jours
      } else if (taskName.includes('analyse') || taskName.includes('analysis')) {
        newBudget = Math.floor(Math.random() * 6) + 8; // 8-13 jours
      } else if (taskName.includes('documentation')) {
        newBudget = Math.floor(Math.random() * 5) + 3; // 3-7 jours
      } else if (taskName.includes('support') || taskName.includes('maintenance')) {
        newBudget = Math.floor(Math.random() * 11) + 10; // 10-20 jours
      } else if (taskName.includes('code review')) {
        newBudget = Math.floor(Math.random() * 4) + 2; // 2-5 jours
      } else {
        newBudget = Math.floor(Math.random() * 8) + 5; // 5-12 jours (par défaut)
      }
      
      await Task.findByIdAndUpdate(task._id, { budget: newBudget });
      console.log(`  ✅ ${task.taskName}: ${task.budget} → ${newBudget} jours`);
      tasksUpdated++;
    }
    
    // --- VERIFICATION ---
    console.log('\n🔍 VÉRIFICATION DES NOUVEAUX BUDGETS:');
    
    const updatedProjects = await Project.find({}, 'projectName budget').sort({ budget: -1 });
    const updatedTasks = await Task.find({}, 'taskName budget').sort({ budget: -1 });
    
    const newProjectBudgets = updatedProjects.map(p => p.budget);
    const newTaskBudgets = updatedTasks.map(t => t.budget);
    
    console.log('\n📊 NOUVEAUX BUDGETS PROJETS (triés):');
    updatedProjects.forEach(project => {
      const months = (project.budget / 30).toFixed(1);
      console.log(`  💼 ${project.projectName}: ${project.budget} jours (${months} mois)`);
    });
    
    console.log('\n📊 NOUVEAUX BUDGETS TÂCHES (top 10):');
    updatedTasks.slice(0, 10).forEach(task => {
      console.log(`  📋 ${task.taskName}: ${task.budget} jours`);
    });
    
    console.log('\n📈 NOUVELLES STATISTIQUES:');
    console.log(`  💼 Projets - Min: ${Math.min(...newProjectBudgets)}, Max: ${Math.max(...newProjectBudgets)}, Moyenne: ${(newProjectBudgets.reduce((a,b) => a+b, 0) / newProjectBudgets.length).toFixed(1)} jours`);
    console.log(`  📋 Tâches - Min: ${Math.min(...newTaskBudgets)}, Max: ${Math.max(...newTaskBudgets)}, Moyenne: ${(newTaskBudgets.reduce((a,b) => a+b, 0) / newTaskBudgets.length).toFixed(1)} jours`);
    
    console.log(`\n✅ RÉSUMÉ:`);
    console.log(`  🎯 ${projectsUpdated} projets mis à jour`);
    console.log(`  🎯 ${tasksUpdated} tâches mises à jour`);
    console.log(`  💡 Budgets maintenant réalistes pour une entreprise de développement`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des budgets:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  updateBudgets();
}

module.exports = { updateBudgets };