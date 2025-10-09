const mongoose = require('mongoose');

// Script rapide pour vérifier et afficher les données existantes
async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/StaffApp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const User = require('../models/userModel');
    const BusinessUnit = require('../models/BusinessUnitModel');
    const Project = require('../models/projectModel');
    const Task = require('../models/taskModel');
    const Assignment = require('../models/AssignmentModel');
    const Team = require('../models/teamModel');
    
    console.log('📊 État actuel de la base de données :');
    console.log(`Business Units: ${await BusinessUnit.countDocuments()}`);
    console.log(`Utilisateurs: ${await User.countDocuments()}`);
    console.log(`Projets: ${await Project.countDocuments()}`);
    console.log(`Tâches: ${await Task.countDocuments()}`);
    console.log(`Assignments: ${await Assignment.countDocuments()}`);
    console.log(`Membres d'équipe: ${await Team.countDocuments()}`);
    
    // Afficher quelques exemples de données
    const sampleUsers = await User.find().limit(3).select('fullName email role businessUnit');
    console.log('\n👥 Exemples d\'utilisateurs :');
    sampleUsers.forEach(user => {
      console.log(`   • ${user.fullName} (${user.email}) - ${user.role}`);
    });
    
    const sampleProjects = await Project.find().limit(3).select('projectName owner');
    console.log('\n🏗️ Exemples de projets :');
    sampleProjects.forEach(project => {
      console.log(`   • ${project.projectName}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkData();