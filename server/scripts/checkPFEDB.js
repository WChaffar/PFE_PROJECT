const mongoose = require('mongoose');

// Script pour vérifier les données dans PFEDB (MongoDB Atlas)
async function checkPFEDB() {
  try {
    // Utiliser la même connexion que l'application
    const mongoURI = 'mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster';
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connecté à MongoDB Atlas PFEDB\n');
    
    const User = require('../models/userModel');
    const BusinessUnit = require('../models/BusinessUnitModel');
    const Project = require('../models/projectModel');
    const Task = require('../models/taskModel');
    const Assignment = require('../models/AssignmentModel');
    const Team = require('../models/teamModel');
    
    console.log('🔍 VÉRIFICATION DE PFEDB (MongoDB Atlas)\n');
    
    // Compter les documents
    const counts = {
      businessUnits: await BusinessUnit.countDocuments(),
      users: await User.countDocuments(),
      projects: await Project.countDocuments(),
      tasks: await Task.countDocuments(),
      assignments: await Assignment.countDocuments(),
      teamMembers: await Team.countDocuments()
    };
    
    console.log('📊 DONNÉES DANS PFEDB:');
    console.log(`   📈 Business Units: ${counts.businessUnits}`);
    console.log(`   👥 Utilisateurs: ${counts.users}`);
    console.log(`   🏗️ Projets: ${counts.projects}`);
    console.log(`   📋 Tâches: ${counts.tasks}`);
    console.log(`   📝 Assignments: ${counts.assignments}`);
    console.log(`   👫 Membres d'équipe: ${counts.teamMembers}`);
    
    if (counts.users > 0) {
      console.log('\n✅ LES DONNÉES SONT BIEN PRÉSENTES DANS PFEDB !');
      
      // Afficher quelques exemples
      console.log('\n👥 Exemples d\'utilisateurs BUDirectors:');
      const buDirectors = await User.find({ role: 'BUDirector' })
        .populate('businessUnit', 'name')
        .select('fullName email jobTitle businessUnit');
      
      buDirectors.forEach(director => {
        console.log(`   • ${director.fullName} (${director.email})`);
        console.log(`     Job: ${director.jobTitle}`);
        console.log(`     BU: ${director.businessUnit?.name}`);
        console.log(`     Mot de passe: password123\n`);
      });
      
      console.log('🏗️ Exemples de projets:');
      const projects = await Project.find()
        .populate('owner', 'fullName jobTitle')
        .select('projectName owner projectPriority budget')
        .limit(3);
      
      projects.forEach(project => {
        console.log(`   • ${project.projectName}`);
        console.log(`     Propriétaire: ${project.owner?.fullName} (${project.owner?.jobTitle})`);
        console.log(`     Priorité: ${project.projectPriority} | Budget: ${project.budget.toLocaleString()}€\n`);
      });
      
      console.log('📝 Assignments par statut:');
      const assignmentStats = await Assignment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      assignmentStats.forEach(stat => {
        console.log(`   • ${stat._id}: ${stat.count} assignments`);
      });
      
    } else {
      console.log('\n❌ AUCUNE DONNÉE TROUVÉE DANS PFEDB');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Connexion fermée');
  }
}

checkPFEDB();