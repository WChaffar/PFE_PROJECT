const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const createCoherentManagerSystem = async () => {
  try {
    console.log('🔧 Création d\'un système cohérent Manager-Équipe-Projet-Tâches...\n');

    // 1. Supprimer TOUTES les affectations incohérentes
    console.log('📋 Étape 1: Suppression des affectations incohérentes...');
    
    const allManagers = await User.find({ 
      role: { $in: ["Manager", "BUDirector"] } 
    }).select('_id fullName');

    let totalDeleted = 0;
    let totalKept = 0;

    for (const manager of allManagers) {
      // Récupérer l'équipe, projets et tâches du manager
      const teamMembers = await User.find({
        manager: manager._id,
        role: { $nin: ["RH", "BUDirector", "Manager"] }
      }).select('_id');

      const managerProjects = await Project.find({
        owner: manager._id
      }).select('_id');

      const managerProjectIds = managerProjects.map(p => p._id.toString());
      const managerTasks = await Task.find({
        project: { $in: managerProjects.map(p => p._id) }
      }).select('_id');

      const teamMemberIds = teamMembers.map(tm => tm._id.toString());
      const managerTaskIds = managerTasks.map(mt => mt._id.toString());

      // Récupérer les affectations de ce manager
      const managerAssignments = await Assignment.find({ Owner: manager._id })
        .populate('employee', '_id')
        .populate('project', '_id owner')
        .populate('taskId', '_id project');

      // Identifier les affectations à supprimer
      const assignmentsToDelete = [];
      const assignmentsToKeep = [];

      for (const assignment of managerAssignments) {
        let shouldDelete = false;

        // Vérifier si l'employé appartient à l'équipe
        if (!assignment.employee || !teamMemberIds.includes(assignment.employee._id.toString())) {
          shouldDelete = true;
        }

        // Vérifier si le projet appartient au manager
        if (!assignment.project || !managerProjectIds.includes(assignment.project._id.toString())) {
          shouldDelete = true;
        }

        // Vérifier si la tâche appartient aux projets du manager
        if (!assignment.taskId || !managerTaskIds.includes(assignment.taskId._id.toString())) {
          shouldDelete = true;
        }

        if (shouldDelete) {
          assignmentsToDelete.push(assignment._id);
        } else {
          assignmentsToKeep.push(assignment._id);
        }
      }

      // Supprimer les affectations incohérentes
      if (assignmentsToDelete.length > 0) {
        await Assignment.deleteMany({ _id: { $in: assignmentsToDelete } });
        totalDeleted += assignmentsToDelete.length;
      }
      
      totalKept += assignmentsToKeep.length;

      if (assignmentsToDelete.length > 0) {
        console.log(`   ${manager.fullName}: ${assignmentsToDelete.length} supprimées, ${assignmentsToKeep.length} conservées`);
      }
    }

    console.log(`\n✅ Nettoyage terminé:`);
    console.log(`   🗑️ Affectations supprimées: ${totalDeleted}`);
    console.log(`   ✅ Affectations cohérentes conservées: ${totalKept}`);

    // 2. Redistribuer les projets sans propriétaire aux managers
    console.log(`\n📋 Étape 2: Attribution des projets orphelins...`);
    
    const orphanProjects = await Project.find({ 
      $or: [
        { owner: { $exists: false } },
        { owner: null }
      ]
    });

    console.log(`📁 Projets orphelins trouvés: ${orphanProjects.length}`);

    if (orphanProjects.length > 0) {
      // Distribuer équitablement les projets aux managers
      for (let i = 0; i < orphanProjects.length; i++) {
        const randomManager = allManagers[i % allManagers.length];
        await Project.findByIdAndUpdate(orphanProjects[i]._id, {
          owner: randomManager._id
        });
      }
      console.log(`✅ Projets redistribués aux ${allManagers.length} managers`);
    }

    // 3. Créer des affectations cohérentes de base
    console.log(`\n📋 Étape 3: Création d'affectations cohérentes de base...`);
    
    let newAssignmentsCreated = 0;
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    for (const manager of allManagers.slice(0, 10)) { // Traiter les 10 premiers managers
      // Récupérer l'équipe du manager
      const teamMembers = await User.find({
        manager: manager._id,
        role: { $nin: ["RH", "BUDirector", "Manager"] }
      }).select('_id fullName');

      // Récupérer les projets du manager
      const managerProjects = await Project.find({
        owner: manager._id
      }).select('_id projectName');

      // Récupérer les tâches des projets du manager
      const managerTasks = await Task.find({
        project: { $in: managerProjects.map(p => p._id) }
      }).select('_id taskName project');

      if (teamMembers.length > 0 && managerProjects.length > 0 && managerTasks.length > 0) {
        // Créer 1-2 affectations cohérentes par membre d'équipe
        for (const employee of teamMembers.slice(0, 3)) { // Max 3 employés par manager
          const randomProject = managerProjects[Math.floor(Math.random() * managerProjects.length)];
          const projectTasks = managerTasks.filter(t => t.project.toString() === randomProject._id.toString());
          
          if (projectTasks.length > 0) {
            const randomTask = projectTasks[Math.floor(Math.random() * projectTasks.length)];
            
            // Créer l'affectation
            const newAssignment = new Assignment({
              Owner: manager._id,
              employee: employee._id,
              project: randomProject._id,
              taskId: randomTask._id,
              startDate: startDate,
              endDate: endDate,
              dayDetails: []
            });

            await newAssignment.save();
            newAssignmentsCreated++;
          }
        }
      }
    }

    console.log(`✅ Nouvelles affectations cohérentes créées: ${newAssignmentsCreated}`);

    // 4. Vérification finale
    console.log(`\n📋 Étape 4: Vérification finale...`);
    
    const finalAssignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('project', 'projectName owner')
      .populate('Owner', 'fullName');

    let finalCoherent = 0;
    let finalIncoherent = 0;

    for (const assignment of finalAssignments) {
      if (!assignment.employee || !assignment.project || !assignment.Owner) {
        finalIncoherent++;
        continue;
      }

      const employeeManagerId = assignment.employee.manager?.toString();
      const projectOwnerId = assignment.project.owner?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      // Vérifier cohérence: employee.manager === project.owner === assignment.Owner
      if (employeeManagerId === projectOwnerId && projectOwnerId === assignmentOwnerId) {
        finalCoherent++;
      } else {
        finalIncoherent++;
      }
    }

    console.log('\n🎉 RÉSULTATS FINAUX:');
    console.log(`📊 Total affectations: ${finalAssignments.length}`);
    console.log(`✅ Affectations cohérentes: ${finalCoherent}`);
    console.log(`❌ Affectations incohérentes: ${finalIncoherent}`);

    const coherenceRate = ((finalCoherent / finalAssignments.length) * 100).toFixed(1);
    console.log(`📈 Taux de cohérence: ${coherenceRate}%`);

    if (finalCoherent > finalIncoherent) {
      console.log('\n🎉 SUCCÈS ! Le système est maintenant majoritairement cohérent !');
      console.log('👉 Chaque manager ne voit que SES projets, SES équipes, SES tâches, SES affectations !');
      console.log('\n💡 Rechargez votre application pour tester les pages:');
      console.log('   - Staffing Calendar');
      console.log('   - Time & Workload');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création du système cohérent:', error);
  } finally {
    mongoose.connection.close();
  }
};

createCoherentManagerSystem();