const mongoose = require('mongoose');
const Project = require('../models/projectModel');

async function checkBudgets() {
  try {
    await mongoose.connect('mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster');
    
    const projects = await Project.find({})
      .select('projectName budget')
      .limit(10);
    
    console.log('📊 BUDGETS ACTUELS DES PROJETS:');
    projects.forEach(project => {
      console.log(`   • ${project.projectName}: ${project.budget?.toLocaleString()} jours`);
    });
    
    const stats = await Project.aggregate([
      { 
        $group: { 
          _id: null, 
          minBudget: { $min: '$budget' },
          maxBudget: { $max: '$budget' },
          avgBudget: { $avg: '$budget' }
        } 
      }
    ]);
    
    console.log('\n📈 STATISTIQUES BUDGETS:');
    console.log(`   • Budget minimum: ${stats[0]?.minBudget?.toLocaleString()} jours`);
    console.log(`   • Budget maximum: ${stats[0]?.maxBudget?.toLocaleString()} jours`);
    console.log(`   • Budget moyen: ${Math.round(stats[0]?.avgBudget)?.toLocaleString()} jours`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkBudgets();