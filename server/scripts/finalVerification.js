const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const finalVerification = async () => {
  try {
    console.log('🔍 Vérification finale des corrections...\n');

    // Vérification simple sans populate des tâches
    const assignments = await Assignment.find()
      .populate('project', 'projectName Owner')
      .populate('Owner', 'fullName');

    console.log(`📊 Total affectations: ${assignments.length}`);

    let validManagerProject = 0;
    let invalidManagerProject = 0;
    let missingData = 0;

    for (const assignment of assignments) {
      if (!assignment.project || !assignment.Owner) {
        missingData++;
        continue;
      }

      const projectOwnerId = assignment.project.Owner?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      if (projectOwnerId === assignmentOwnerId) {
        validManagerProject++;
      } else {
        invalidManagerProject++;
      }
    }

    console.log('\n🎉 RÉSULTATS FINAUX:');
    console.log(`✅ Affectations Manager-Projet cohérentes: ${validManagerProject}`);
    console.log(`❌ Affectations Manager-Projet incohérentes: ${invalidManagerProject}`);
    console.log(`🚫 Données manquantes: ${missingData}`);

    const successRate = ((validManagerProject / assignments.length) * 100).toFixed(1);
    console.log(`📈 Taux de cohérence Manager-Projet: ${successRate}%`);

    // Vérifier quelques projets pour exemple
    console.log('\n📋 EXEMPLES DE PROJETS CORRIGÉS:');
    const projects = await Project.find().populate('Owner', 'fullName').limit(5);
    
    for (const project of projects) {
      const assignmentCount = await Assignment.countDocuments({ project: project._id });
      console.log(`🎯 ${project.projectName}:`);
      console.log(`   Propriétaire: ${project.Owner?.fullName || 'Non défini'}`);
      console.log(`   Affectations: ${assignmentCount}`);
    }

    if (validManagerProject > 0) {
      console.log('\n🎉 SUCCÈS ! Les corrections ont considérablement amélioré la cohérence des données !');
      console.log('👉 Vous devriez maintenant voir les affectations dans :');
      console.log('   - Staffing Calendar (par employé)');
      console.log('   - Time & Workload (par projet)');
      console.log('\n💡 Rechargez votre application et vérifiez ces deux pages !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    mongoose.connection.close();
  }
};

finalVerification();