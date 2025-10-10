const mongoose = require('mongoose');

// Script de test pour vérifier les relations entre les données
async function testRelations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/StaffApp');
    
    const User = require('../models/userModel');
    const BusinessUnit = require('../models/BusinessUnitModel');
    const Project = require('../models/projectModel');
    const Task = require('../models/taskModel');
    const Assignment = require('../models/AssignmentModel');
    
    console.log('🔍 Test des relations entre les données...\n');
    
    // 1. Vérifier les Business Units avec leurs utilisateurs
    console.log('📊 Business Units et leurs utilisateurs:');
    const businessUnits = await BusinessUnit.find();
    for (const bu of businessUnits) {
      const usersCount = await User.countDocuments({ businessUnit: bu._id });
      console.log(`   • ${bu.name} (${bu.code}): ${usersCount} utilisateurs`);
    }
    
    // 2. Vérifier les projets avec leurs propriétaires et tâches
    console.log('\n🏗️ Projets avec propriétaires et tâches:');
    const projects = await Project.find().populate('owner', 'fullName jobTitle businessUnit');
    for (const project of projects) {
      const tasksCount = await Task.countDocuments({ project: project._id });
      const assignmentsCount = await Assignment.countDocuments({ project: project._id });
      console.log(`   • ${project.projectName}`);
      console.log(`     - Propriétaire: ${project.owner?.fullName} (${project.owner?.jobTitle})`);
      console.log(`     - Tâches: ${tasksCount}, Assignments: ${assignmentsCount}`);
    }
    
    // 3. Vérifier les assignments par statut
    console.log('\n📝 Assignments par statut:');
    const assignmentStats = await Assignment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    assignmentStats.forEach(stat => {
      console.log(`   • ${stat._id}: ${stat.count} assignments`);
    });
    
    // 4. Vérifier les utilisateurs avec leurs managers et BU
    console.log('\n👥 Hiérarchie des utilisateurs:');
    const buDirectors = await User.find({ role: 'BUDirector' })
      .populate('businessUnit', 'name code')
      .select('fullName role businessUnit');
    
    for (const director of buDirectors) {
      console.log(`   📈 BUDirector: ${director.fullName} (${director.businessUnit?.name})`);
      
      const managers = await User.find({ 
        businessUnit: director.businessUnit._id, 
        role: 'Manager' 
      }).select('fullName role');
      
      for (const manager of managers) {
        console.log(`     👔 Manager: ${manager.fullName}`);
        
        const employees = await User.find({ 
          manager: manager._id 
        }).select('fullName role');
        
        employees.forEach(emp => {
          console.log(`       👤 Employee: ${emp.fullName}`);
        });
      }
    }
    
    // 5. Vérifier les tâches avec workload et assignments
    console.log('\n📋 Tâches avec workload et statut:');
    const tasksWithAssignments = await Task.find()
      .populate('project', 'projectName')
      .select('taskName workload project');
      
    for (const task of tasksWithAssignments) {
      const assignments = await Assignment.find({ taskId: task._id })
        .populate('employee', 'fullName')
        .select('status employee skillMatchScore');
        
      console.log(`   • ${task.taskName} (${task.project?.projectName})`);
      console.log(`     - Workload: ${task.workload}%`);
      
      if (assignments.length > 0) {
        assignments.forEach(assignment => {
          console.log(`     - Assigné à: ${assignment.employee?.fullName} (${assignment.status}, Score: ${assignment.skillMatchScore?.toFixed(2)})`);
        });
      } else {
        console.log(`     - Aucun assignment`);
      }
    }
    
    // 6. Statistiques générales
    console.log('\n📈 Statistiques générales:');
    const stats = {
      totalUsers: await User.countDocuments(),
      totalProjects: await Project.countDocuments(),
      totalTasks: await Task.countDocuments(),
      totalAssignments: await Assignment.countDocuments(),
      activeAssignments: await Assignment.countDocuments({ status: { $in: ['assigned', 'in-progress'] } }),
      averageWorkload: await Task.aggregate([{ $group: { _id: null, avg: { $avg: '$workload' } } }])
    };
    
    console.log(`   • Total utilisateurs: ${stats.totalUsers}`);
    console.log(`   • Total projets: ${stats.totalProjects}`);
    console.log(`   • Total tâches: ${stats.totalTasks}`);
    console.log(`   • Total assignments: ${stats.totalAssignments}`);
    console.log(`   • Assignments actifs: ${stats.activeAssignments}`);
    console.log(`   • Workload moyen: ${stats.averageWorkload[0]?.avg?.toFixed(1) || 0}%`);
    
    console.log('\n✅ Test des relations terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testRelations();