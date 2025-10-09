const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

async function checkAssignments() {
  try {
    await mongoose.connect('mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster');
    
    const totalAssignments = await Assignment.countDocuments({});
    console.log('📊 STATISTIQUES AFFECTATIONS:');
    console.log(`   • Total affectations: ${totalAssignments}`);
    
    if (totalAssignments === 0) {
      console.log('❌ AUCUNE AFFECTATION TROUVÉE !');
      console.log('   Il faut créer des affectations pour voir les données dans les dashboards');
    } else {
      const assignments = await Assignment.find({})
        .populate('employee', 'fullName jobTitle')
        .populate('project', 'projectName')
        .limit(5);
      
      console.log('\n📋 EXEMPLES D\'AFFECTATIONS:');
      assignments.forEach(assignment => {
        console.log(`   • ${assignment.employee?.fullName} → ${assignment.project?.projectName}`);
        console.log(`     Statut: ${assignment.status} | Dates: ${assignment.startDate.toLocaleDateString()} - ${assignment.endDate.toLocaleDateString()}`);
      });
      
      const statusStats = await Assignment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('\n📈 AFFECTATIONS PAR STATUT:');
      statusStats.forEach(stat => {
        console.log(`   • ${stat._id}: ${stat.count} affectations`);
      });
    }
    
    const totalUsers = await User.countDocuments({});
    const totalProjects = await Project.countDocuments({});
    
    console.log(`\n📊 DONNÉES DISPONIBLES:`);
    console.log(`   • Utilisateurs: ${totalUsers}`);
    console.log(`   • Projets: ${totalProjects}`);
    console.log(`   • Affectations: ${totalAssignments}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkAssignments();