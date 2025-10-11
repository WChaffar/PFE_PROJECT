const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const fixProjectOwnersBasedOnAssignments = async () => {
  try {
    console.log('🔧 Correction des propriétaires de projets basée sur les affectations...\n');

    // 1. Analyser qui affecte le plus d'employés à chaque projet
    const assignments = await Assignment.find()
      .populate('project', 'projectName Owner')
      .populate('Owner', 'fullName');

    console.log(`📊 Analyse de ${assignments.length} affectations...`);

    // Grouper par projet et compter les affectations par manager
    const projectManagerStats = {};

    for (const assignment of assignments) {
      if (!assignment.project || !assignment.Owner) continue;

      const projectId = assignment.project._id.toString();
      const managerId = assignment.Owner._id.toString();
      const managerName = assignment.Owner.fullName;
      const projectName = assignment.project.projectName;

      if (!projectManagerStats[projectId]) {
        projectManagerStats[projectId] = {
          projectName,
          managers: {},
          currentOwner: assignment.project.Owner?.toString()
        };
      }

      if (!projectManagerStats[projectId].managers[managerId]) {
        projectManagerStats[projectId].managers[managerId] = {
          name: managerName,
          count: 0
        };
      }

      projectManagerStats[projectId].managers[managerId].count++;
    }

    // 2. Déterminer le manager qui devrait être propriétaire de chaque projet
    let projectsToUpdate = 0;
    let correctOwners = 0;

    console.log('\n📋 Analyse des propriétaires de projets:');

    for (const [projectId, stats] of Object.entries(projectManagerStats)) {
      // Trouver le manager avec le plus d'affectations sur ce projet
      let maxCount = 0;
      let bestManagerId = null;
      let bestManagerName = '';

      for (const [managerId, managerData] of Object.entries(stats.managers)) {
        if (managerData.count > maxCount) {
          maxCount = managerData.count;
          bestManagerId = managerId;
          bestManagerName = managerData.name;
        }
      }

      // Vérifier si le propriétaire actuel est correct
      if (stats.currentOwner === bestManagerId) {
        correctOwners++;
      } else {
        projectsToUpdate++;
        console.log(`🔄 ${stats.projectName}:`);
        console.log(`   Propriétaire actuel: ${stats.currentOwner || 'undefined'}`);
        console.log(`   Devrait être: ${bestManagerName} (${maxCount} affectations)`);

        // Mettre à jour le propriétaire du projet
        await Project.findByIdAndUpdate(projectId, {
          Owner: bestManagerId
        });
      }
    }

    console.log(`\n✅ Propriétaires corrects: ${correctOwners}`);
    console.log(`🔄 Projets mis à jour: ${projectsToUpdate}`);

    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    
    const finalAssignments = await Assignment.find()
      .populate('taskId', 'taskName project')
      .populate('project', 'projectName Owner')
      .populate('Owner', 'fullName');

    let finalValid = 0;
    let finalTaskProjectIssues = 0;
    let finalManagerProjectIssues = 0;

    for (const assignment of finalAssignments) {
      if (!assignment.taskId || !assignment.project || !assignment.Owner) {
        continue;
      }

      const taskProjectId = assignment.taskId.project?.toString();
      const assignmentProjectId = assignment.project._id.toString();
      const projectOwnerId = assignment.project.Owner?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      const hasTaskProjectIssue = taskProjectId !== assignmentProjectId;
      const hasManagerProjectIssue = projectOwnerId !== assignmentOwnerId;

      if (hasTaskProjectIssue) {
        finalTaskProjectIssues++;
      } else if (hasManagerProjectIssue) {
        finalManagerProjectIssues++;
      } else {
        finalValid++;
      }
    }

    console.log('\n🎉 RÉSULTATS FINAUX:');
    console.log(`📊 Total affectations: ${finalAssignments.length}`);
    console.log(`✅ Affectations cohérentes: ${finalValid}`);
    console.log(`❌ Incohérences Task-Projet: ${finalTaskProjectIssues}`);
    console.log(`❌ Incohérences Manager-Projet: ${finalManagerProjectIssues}`);

    const successRate = ((finalValid / finalAssignments.length) * 100).toFixed(1);
    console.log(`📈 Taux de réussite: ${successRate}%`);

    if (finalValid > 0) {
      console.log('\n🎉 SUCCÈS ! Les données sont maintenant plus cohérentes !');
      console.log('👉 Vous pouvez maintenant voir les affectations dans Time & Workload par projet.');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixProjectOwnersBasedOnAssignments();