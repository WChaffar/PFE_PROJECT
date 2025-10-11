const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const checkCurrentState = async () => {
  try {
    console.log('🔍 Vérification de l\'état actuel de la base...\n');

    // Vérifier avec le bon nom de champ : 'owner' et non 'Owner'
    const assignments = await Assignment.find()
      .populate('project', 'projectName owner')
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

      // Utiliser 'owner' (minuscule) au lieu de 'Owner'
      const projectOwnerId = assignment.project.owner?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      if (projectOwnerId === assignmentOwnerId) {
        validManagerProject++;
      } else {
        invalidManagerProject++;
      }
    }

    console.log('\n🎉 RÉSULTATS ACTUELS:');
    console.log(`✅ Affectations Manager-Projet cohérentes: ${validManagerProject}`);
    console.log(`❌ Affectations Manager-Projet incohérentes: ${invalidManagerProject}`);
    console.log(`🚫 Données manquantes: ${missingData}`);

    const successRate = ((validManagerProject / assignments.length) * 100).toFixed(1);
    console.log(`📈 Taux de cohérence Manager-Projet: ${successRate}%`);

    // Vérifier quelques projets
    console.log('\n📋 EXEMPLES DE PROJETS:');
    const projects = await Project.find().populate('owner', 'fullName').limit(5);
    
    for (const project of projects) {
      const assignmentCount = await Assignment.countDocuments({ project: project._id });
      console.log(`🎯 ${project.projectName}:`);
      console.log(`   Propriétaire: ${project.owner?.fullName || 'Non défini'}`);
      console.log(`   Affectations: ${assignmentCount}`);
    }

    if (validManagerProject > 3000) {
      console.log('\n🎉 EXCELLENT ! La majorité des données sont maintenant cohérentes !');
      console.log('👉 Vous devriez maintenant voir les affectations dans Time & Workload !');
    } else if (validManagerProject > 1000) {
      console.log('\n👍 BIEN ! Une bonne partie des données sont cohérentes !');
    } else {
      console.log('\n⚠️ Il reste encore des corrections à faire...');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkCurrentState();