const mongoose = require('mongoose');

// Import models
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

// Update workload for all tasks with varied values
const updateTaskWorkloads = async () => {
  try {
    console.log('🔧 Mise à jour des workloads des tâches...\n');
    
    await connectDB();
    
    // Get all tasks
    const tasks = await Task.find({}, 'taskName workload');
    
    console.log(`📊 Nombre total de tâches trouvées: ${tasks.length}\n`);
    
    if (tasks.length === 0) {
      console.log('❌ Aucune tâche trouvée dans la base de données');
      return;
    }
    
    // Update each task with a random workload between 0 and 100
    let updatedCount = 0;
    
    for (const task of tasks) {
      // Generate random workload between 0 and 100
      const newWorkload = Math.floor(Math.random() * 101); // 0 to 100
      
      // Update the task
      await Task.findByIdAndUpdate(task._id, { workload: newWorkload });
      
      console.log(`✅ ${task.taskName}: workload mis à jour à ${newWorkload}%`);
      updatedCount++;
    }
    
    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`  ✅ Tâches mises à jour: ${updatedCount}/${tasks.length}`);
    console.log(`  💡 Workloads assignés: 0% à 100%`);
    
    // Show distribution of workloads
    const updatedTasks = await Task.find({}, 'taskName workload').sort({ workload: 1 });
    
    console.log('\n📈 DISTRIBUTION DES WORKLOADS:');
    
    // Group by workload ranges
    const ranges = {
      'Faible (0-25%)': updatedTasks.filter(t => t.workload >= 0 && t.workload <= 25).length,
      'Modéré (26-50%)': updatedTasks.filter(t => t.workload >= 26 && t.workload <= 50).length,
      'Élevé (51-75%)': updatedTasks.filter(t => t.workload >= 51 && t.workload <= 75).length,
      'Très élevé (76-100%)': updatedTasks.filter(t => t.workload >= 76 && t.workload <= 100).length
    };
    
    Object.entries(ranges).forEach(([range, count]) => {
      const percentage = ((count / updatedTasks.length) * 100).toFixed(1);
      console.log(`  📊 ${range}: ${count} tâches (${percentage}%)`);
    });
    
    // Show some examples
    console.log('\n🎯 EXEMPLES DE TÂCHES AVEC WORKLOADS:');
    updatedTasks.slice(0, 10).forEach(task => {
      const intensity = task.workload <= 25 ? '🟢' : 
                       task.workload <= 50 ? '🟡' : 
                       task.workload <= 75 ? '🟠' : '🔴';
      console.log(`  ${intensity} ${task.taskName}: ${task.workload}%`);
    });
    
    console.log('\n💡 Les workloads sont maintenant variés entre 0% et 100% pour toutes les tâches!');
    console.log('🎨 Cela permettra une meilleure visualisation dans le Staffing Calendar');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des workloads:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  updateTaskWorkloads();
}

module.exports = { updateTaskWorkloads };