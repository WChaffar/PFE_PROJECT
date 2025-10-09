const mongoose = require('mongoose');

// Script pour afficher tous les détails des données insérées
async function showAllData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/StaffApp');
    
    const User = require('../models/userModel');
    const BusinessUnit = require('../models/BusinessUnitModel');
    const Project = require('../models/projectModel');
    const Task = require('../models/taskModel');
    const Assignment = require('../models/AssignmentModel');
    const Team = require('../models/teamModel');
    
    console.log('🔍 VÉRIFICATION COMPLÈTE DE LA BASE DE DONNÉES\n');
    
    // 1. Business Units
    console.log('📊 BUSINESS UNITS:');
    const businessUnits = await BusinessUnit.find();
    businessUnits.forEach((bu, index) => {
      console.log(`${index + 1}. ${bu.name} (Code: ${bu.code})`);
      console.log(`   Description: ${bu.description}`);
      console.log(`   Créé le: ${bu.createdAt?.toLocaleDateString()}`);
      console.log(`   Statut: ${bu.isActive ? 'Actif' : 'Inactif'}\n`);
    });
    
    // 2. Utilisateurs par BU
    console.log('👥 UTILISATEURS PAR BUSINESS UNIT:');
    for (const bu of businessUnits) {
      const users = await User.find({ businessUnit: bu._id })
        .populate('manager', 'fullName')
        .select('fullName email role jobTitle manager');
      
      console.log(`\n📈 ${bu.name} (${users.length} utilisateurs):`);
      users.forEach(user => {
        const managerInfo = user.manager ? ` - Manager: ${user.manager.fullName}` : '';
        console.log(`   • ${user.fullName} (${user.email})`);
        console.log(`     Role: ${user.role} | Job: ${user.jobTitle}${managerInfo}`);
      });
    }
    
    // 3. Projets détaillés
    console.log('\n\n🏗️ PROJETS DÉTAILLÉS:');
    const projects = await Project.find()
      .populate('owner', 'fullName jobTitle')
      .sort({ createdAt: -1 });
      
    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.projectName}`);
      console.log(`   Propriétaire: ${project.owner?.fullName} (${project.owner?.jobTitle})`);
      console.log(`   Client: ${project.client}`);
      console.log(`   Type: ${project.projectType} | Catégorie: ${project.projectCategory}`);
      console.log(`   Priorité: ${project.projectPriority}`);
      console.log(`   Budget: ${project.budget.toLocaleString()}€ (+${project.additionalFunding}€)`);
      console.log(`   Période: ${project.startDate?.toLocaleDateString()} → ${project.endDate?.toLocaleDateString()}`);
    });
    
    // 4. Tâches par projet
    console.log('\n\n📋 TÂCHES PAR PROJET:');
    for (const project of projects) {
      const tasks = await Task.find({ project: project._id })
        .populate('owner', 'fullName');
        
      if (tasks.length > 0) {
        console.log(`\n🏗️ ${project.projectName} (${tasks.length} tâches):`);
        tasks.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.taskName}`);
          console.log(`      Propriétaire: ${task.owner?.fullName}`);
          console.log(`      Phase: ${task.projectPhase} | Workload: ${task.workload}%`);
          console.log(`      Budget: ${task.budget.toLocaleString()}€`);
          console.log(`      Skills requis: ${task.requiredSkills.join(', ')}`);
        });
      }
    }
    
    // 5. Assignments avec détails
    console.log('\n\n📝 ASSIGNMENTS DÉTAILLÉS:');
    const assignments = await Assignment.find()
      .populate('employee', 'fullName jobTitle')
      .populate('project', 'projectName')
      .populate('taskId', 'taskName')
      .populate('Owner', 'fullName')
      .sort({ createdAt: -1 });
      
    const assignmentsByStatus = {};
    assignments.forEach(assignment => {
      if (!assignmentsByStatus[assignment.status]) {
        assignmentsByStatus[assignment.status] = [];
      }
      assignmentsByStatus[assignment.status].push(assignment);
    });
    
    Object.keys(assignmentsByStatus).forEach(status => {
      console.log(`\n📌 ${status.toUpperCase()} (${assignmentsByStatus[status].length}):`);
      assignmentsByStatus[status].forEach((assignment, index) => {
        console.log(`   ${index + 1}. ${assignment.employee?.fullName} → ${assignment.taskId?.taskName}`);
        console.log(`      Projet: ${assignment.project?.projectName}`);
        console.log(`      Owner: ${assignment.Owner?.fullName}`);
        console.log(`      Période: ${assignment.startDate?.toLocaleDateString()} → ${assignment.endDate?.toLocaleDateString()}`);
        console.log(`      Score compatibilité: ${(assignment.skillMatchScore * 100)?.toFixed(1)}%`);
        console.log(`      Durée: ${assignment.totalDays} jours | Type: ${assignment.assignmentType}`);
      });
    });
    
    // 6. Statistiques finales détaillées
    console.log('\n\n📊 STATISTIQUES DÉTAILLÉES:');
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const projectsByPriority = await Project.aggregate([
      { $group: { _id: '$projectPriority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const tasksByPhase = await Task.aggregate([
      { $group: { _id: '$projectPhase', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n👥 Répartition des utilisateurs par rôle:');
    usersByRole.forEach(item => {
      console.log(`   • ${item._id}: ${item.count} utilisateurs`);
    });
    
    console.log('\n🏗️ Projets par priorité:');
    projectsByPriority.forEach(item => {
      console.log(`   • ${item._id}: ${item.count} projets`);
    });
    
    console.log('\n📋 Tâches par phase:');
    tasksByPhase.forEach(item => {
      console.log(`   • ${item._id}: ${item.count} tâches`);
    });
    
    // 7. Totaux finaux
    const totals = {
      businessUnits: await BusinessUnit.countDocuments(),
      users: await User.countDocuments(),
      projects: await Project.countDocuments(),
      tasks: await Task.countDocuments(),
      assignments: await Assignment.countDocuments(),
      teamMembers: await Team.countDocuments()
    };
    
    console.log('\n📈 TOTAUX FINAUX:');
    console.log(`   📊 Business Units: ${totals.businessUnits}`);
    console.log(`   👥 Utilisateurs: ${totals.users}`);
    console.log(`   🏗️ Projets: ${totals.projects}`);
    console.log(`   📋 Tâches: ${totals.tasks}`);
    console.log(`   📝 Assignments: ${totals.assignments}`);
    console.log(`   👫 Membres d'équipe: ${totals.teamMembers}`);
    
    console.log('\n✅ TOUTES LES DONNÉES SONT BIEN PRÉSENTES DANS LA BASE !');
    
    // 8. Connexion à votre dashboard
    console.log('\n🔐 COMPTES DE TEST POUR LE DASHBOARD:');
    console.log('\n   BUDirectors (utilisez l\'un de ces comptes):');
    const buDirectors = await User.find({ role: 'BUDirector' })
      .populate('businessUnit', 'name')
      .select('fullName email businessUnit');
    
    buDirectors.forEach(director => {
      console.log(`   • Email: ${director.email}`);
      console.log(`     Nom: ${director.fullName}`);
      console.log(`     BU: ${director.businessUnit?.name}`);
      console.log(`     Mot de passe: password123\n`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

showAllData();