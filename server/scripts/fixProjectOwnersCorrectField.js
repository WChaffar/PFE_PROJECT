const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const fixProjectOwnersCorrectField = async () => {
  try {
    console.log('🔧 Correction finale avec le bon champ \'owner\'...\n');

    // 1. Analyser qui affecte le plus d'employés à chaque projet
    const assignments = await Assignment.find()
      .populate('project', 'projectName owner')
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
          currentOwner: assignment.project.owner?.toString()
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

    // 2. Mettre à jour avec le bon champ 'owner'
    let projectsUpdated = 0;
    let projectsAlreadyCorrect = 0;

    console.log('\n🔧 Mise à jour des propriétaires (champ \'owner\'):');

    for (const [projectId, stats] of Object.entries(projectManagerStats)) {
      // Trouver le manager avec le plus d'affectations
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

      // Vérifier si déjà correct
      if (stats.currentOwner === bestManagerId) {
        projectsAlreadyCorrect++;
        continue;
      }

      // Mettre à jour avec le bon champ
      await Project.findByIdAndUpdate(projectId, {
        owner: bestManagerId  // 'owner' minuscule !
      });

      projectsUpdated++;

      if (projectsUpdated % 10 === 0) {
        console.log(`📈 Projets mis à jour: ${projectsUpdated}`);
      }
    }

    console.log(`\n✅ Projets déjà corrects: ${projectsAlreadyCorrect}`);
    console.log(`🔄 Projets mis à jour: ${projectsUpdated}`);

    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    
    const finalAssignments = await Assignment.find()
      .populate('project', 'projectName owner')
      .populate('Owner', 'fullName');

    let finalValid = 0;
    let finalInvalid = 0;

    for (const assignment of finalAssignments) {
      if (!assignment.project || !assignment.Owner) continue;

      const projectOwnerId = assignment.project.owner?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      if (projectOwnerId === assignmentOwnerId) {
        finalValid++;
      } else {
        finalInvalid++;
      }
    }

    console.log('\n🎉 RÉSULTATS FINAUX:');
    console.log(`📊 Total affectations: ${finalAssignments.length}`);
    console.log(`✅ Affectations cohérentes: ${finalValid}`);
    console.log(`❌ Affectations incohérentes: ${finalInvalid}`);

    const successRate = ((finalValid / finalAssignments.length) * 100).toFixed(1);
    console.log(`📈 Taux de cohérence: ${successRate}%`);

    if (finalValid > 3500) {
      console.log('\n🎉 FANTASTIQUE ! Presque toutes les données sont cohérentes !');
    } else if (finalValid > 2000) {
      console.log('\n🎉 EXCELLENT ! La majorité des données sont cohérentes !');
    } else if (finalValid > 1000) {
      console.log('\n👍 BIEN ! Une bonne partie des données sont cohérentes !');
    }

    if (finalValid > 1000) {
      console.log('\n👉 Vous devriez maintenant voir les affectations dans :');
      console.log('   - Staffing Calendar (par employé)');
      console.log('   - Time & Workload (par projet)');
      console.log('\n💡 Rechargez votre application et testez !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixProjectOwnersCorrectField();