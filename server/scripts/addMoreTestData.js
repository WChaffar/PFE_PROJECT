const mongoose = require('mongoose');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const Assignment = require('../models/AssignmentModel');

// Script pour ajouter des données supplémentaires
async function addMoreData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/StaffApp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('📈 Ajout de données supplémentaires...');
    
    // Récupérer les utilisateurs existants
    const users = await User.find();
    const projects = await Project.find();
    
    // Ajouter plus d'assignments avec différents statuts
    const additionalAssignments = [];
    
    // Créer des assignments avec statut 'completed'
    const completedTasks = await Task.find().limit(3);
    for (let i = 0; i < completedTasks.length; i++) {
      const task = completedTasks[i];
      const randomEmployee = users[Math.floor(Math.random() * users.length)];
      const manager = users.find(u => u.role === 'Manager');
      
      additionalAssignments.push({
        Owner: manager._id,
        employee: randomEmployee._id,
        project: task.project,
        taskId: task._id,
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-31'),
        assignmentType: 'enduring - long period',
        totalDays: 180,
        status: 'completed',
        skillMatchScore: 0.75 + Math.random() * 0.25,
        recommendations: 'Successfully completed assignment'
      });
    }
    
    // Créer des assignments avec statut 'cancelled'
    const cancelledTasks = await Task.find().limit(2);
    for (let i = 0; i < 2; i++) {
      const task = cancelledTasks[i];
      const randomEmployee = users[Math.floor(Math.random() * users.length)];
      const manager = users.find(u => u.role === 'Manager');
      
      additionalAssignments.push({
        Owner: manager._id,
        employee: randomEmployee._id,
        project: task.project,
        taskId: task._id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
        assignmentType: 'short-term',
        totalDays: 150,
        status: 'cancelled',
        skillMatchScore: 0.60,
        recommendations: 'Assignment cancelled due to project changes'
      });
    }
    
    // Insérer les nouveaux assignments
    const Assignment = require('../models/AssignmentModel');
    const createdAssignments = await Assignment.insertMany(additionalAssignments);
    
    console.log(`✅ ${createdAssignments.length} assignments supplémentaires créés`);
    
    // Mettre à jour quelques tâches avec plus de workload
    const tasksToUpdate = await Task.find().limit(5);
    for (const task of tasksToUpdate) {
      task.workload = Math.floor(Math.random() * 40) + 60; // Entre 60 et 100
      await task.save();
    }
    
    console.log('✅ Workload des tâches mis à jour');
    
    // Ajouter des expériences aux utilisateurs
    const usersToUpdate = await User.find().limit(8);
    for (const user of usersToUpdate) {
      if (!user.experience || user.experience.length === 0) {
        user.experience = [
          {
            companyName: 'Previous Company Inc.',
            jobTitle: `Previous ${user.jobTitle}`,
            startDate: new Date('2020-01-01'),
            endDate: new Date('2022-12-31'),
            responsibilities: 'Led development projects and mentored junior developers'
          }
        ];
        await user.save();
      }
    }
    
    console.log('✅ Expériences utilisateurs ajoutées');
    
    // Statistiques finales
    const finalStats = {
      users: await User.countDocuments(),
      projects: await Project.countDocuments(),
      tasks: await Task.countDocuments(),
      assignments: await Assignment.countDocuments(),
      assignmentsInProgress: await Assignment.countDocuments({ status: 'in-progress' }),
      assignmentsCompleted: await Assignment.countDocuments({ status: 'completed' }),
      assignmentsCancelled: await Assignment.countDocuments({ status: 'cancelled' }),
      assignmentsAssigned: await Assignment.countDocuments({ status: 'assigned' })
    };
    
    console.log('\n📊 Statistiques finales :');
    console.log(`   • Utilisateurs: ${finalStats.users}`);
    console.log(`   • Projets: ${finalStats.projects}`);
    console.log(`   • Tâches: ${finalStats.tasks}`);
    console.log(`   • Total assignments: ${finalStats.assignments}`);
    console.log(`   • En cours: ${finalStats.assignmentsInProgress}`);
    console.log(`   • Terminés: ${finalStats.assignmentsCompleted}`);
    console.log(`   • Annulés: ${finalStats.assignmentsCancelled}`);
    console.log(`   • Assignés: ${finalStats.assignmentsAssigned}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addMoreData();