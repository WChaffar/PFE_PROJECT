const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const checkDatabaseState = async () => {
  try {
    console.log('🔍 Vérification de l\'état de la base de données...\n');

    // Vérifier les utilisateurs
    const users = await User.find({}, 'fullName role manager').populate('manager', 'fullName');
    console.log(`👥 Total utilisateurs: ${users.length}`);
    
    // Afficher les managers et leurs équipes
    const managers = users.filter(user => user.role === 'Manager' || user.role === 'BUDirector');
    console.log(`👨‍💼 Managers: ${managers.length}`);
    
    for (const manager of managers) {
      const teamMembers = users.filter(user => 
        user.manager && user.manager._id.toString() === manager._id.toString()
      );
      console.log(`\n📋 Manager: ${manager.fullName} (${manager.role})`);
      console.log(`   Équipe: ${teamMembers.length} membres`);
      teamMembers.forEach(member => {
        console.log(`   - ${member.fullName}`);
      });
    }

    // Vérifier les affectations
    const assignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('Owner', 'fullName role')
      .populate('project', 'projectName')
      .populate('taskId', 'taskName');

    console.log(`\n📊 Total affectations: ${assignments.length}`);

    if (assignments.length > 0) {
      console.log('\n📋 Détail des affectations:');
      assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. Affectation ID: ${assignment._id}`);
        console.log(`   - Employé: ${assignment.employee?.fullName || 'NON DÉFINI'}`);
        console.log(`   - Owner: ${assignment.Owner?.fullName || 'NON DÉFINI'} (${assignment.Owner?.role || 'N/A'})`);
        console.log(`   - Projet: ${assignment.project?.projectName || 'NON DÉFINI'}`);
        console.log(`   - Tâche: ${assignment.taskId?.taskName || 'NON DÉFINI'}`);
        console.log(`   - Période: ${assignment.startDate} → ${assignment.endDate}`);
        
        if (assignment.employee?.manager) {
          const isConsistent = assignment.employee.manager.toString() === assignment.Owner?._id.toString();
          console.log(`   - Cohérence: ${isConsistent ? '✅' : '❌'}`);
        } else {
          console.log(`   - Cohérence: ❌ (employé sans manager)`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Aucune affectation trouvée dans la base !');
    }

    // Vérifier les projets et tâches
    const Project = require('../models/projectModel');
    const Task = require('../models/taskModel');

    const projects = await Project.find({}, 'projectName');
    const tasks = await Task.find({}, 'taskName');

    console.log(`📁 Total projets: ${projects.length}`);
    console.log(`📋 Total tâches: ${tasks.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkDatabaseState();