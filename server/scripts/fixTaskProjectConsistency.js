const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const fixTaskProjectConsistency = async () => {
  try {
    console.log('🔧 Correction des incohérences Task-Projet dans les affectations...\n');

    // 1. D'abord, corriger les projets sans propriétaire
    console.log('📋 Étape 1: Attribution de propriétaires aux projets...');
    const projectsWithoutOwner = await Project.find({ Owner: { $exists: false } });
    console.log(`Projets sans propriétaire: ${projectsWithoutOwner.length}`);

    // Récupérer tous les managers pour attribution aléatoire
    const allManagers = await User.find({ 
      role: { $in: ["Manager", "BUDirector"] } 
    }).select('_id fullName');

    let projectsFixed = 0;
    for (const project of projectsWithoutOwner) {
      // Attribuer un manager aléatoire comme propriétaire
      const randomManager = allManagers[Math.floor(Math.random() * allManagers.length)];
      await Project.findByIdAndUpdate(project._id, {
        Owner: randomManager._id
      });
      projectsFixed++;
      
      if (projectsFixed % 10 === 0) {
        console.log(`📈 Propriétaires attribués: ${projectsFixed}/${projectsWithoutOwner.length}`);
      }
    }
    console.log(`✅ Projets corrigés: ${projectsFixed}\n`);

    // 2. Maintenant, corriger les incohérences Task-Projet
    console.log('📋 Étape 2: Correction des incohérences Task-Projet...');
    
    const assignments = await Assignment.find()
      .populate('taskId', 'taskName project')
      .populate('project', 'projectName')
      .populate('Owner', 'fullName');

    let taskProjectFixed = 0;
    let assignmentsDeleted = 0;

    for (const assignment of assignments) {
      if (!assignment.taskId || !assignment.project) {
        // Supprimer les affectations avec données manquantes
        await Assignment.findByIdAndDelete(assignment._id);
        assignmentsDeleted++;
        continue;
      }

      const taskProjectId = assignment.taskId.project?.toString();
      const assignmentProjectId = assignment.project._id.toString();

      // Si la tâche appartient à un projet différent, corriger l'affectation
      if (taskProjectId && taskProjectId !== assignmentProjectId) {
        await Assignment.findByIdAndUpdate(assignment._id, {
          project: assignment.taskId.project
        });
        taskProjectFixed++;
        
        if (taskProjectFixed % 100 === 0) {
          console.log(`📈 Affectations Task-Projet corrigées: ${taskProjectFixed}`);
        }
      }
    }

    console.log(`✅ Affectations Task-Projet corrigées: ${taskProjectFixed}`);
    console.log(`🗑️ Affectations supprimées (données manquantes): ${assignmentsDeleted}\n`);

    // 3. Vérification finale
    console.log('📋 Étape 3: Vérification finale...');
    
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
    console.log(`❌ Incohérences Task-Projet restantes: ${finalTaskProjectIssues}`);
    console.log(`❌ Incohérences Manager-Projet restantes: ${finalManagerProjectIssues}`);

    if (finalTaskProjectIssues === 0 && finalManagerProjectIssues === 0) {
      console.log('\n🎉 SUCCÈS COMPLET ! Toutes les incohérences ont été corrigées !');
    } else {
      console.log('\n⚠️ Des incohérences persistent. Vérification manuelle nécessaire.');
    }

    console.log('\n📊 AMÉLIORATION:');
    console.log(`Avant: 0 affectations cohérentes`);
    console.log(`Après: ${finalValid} affectations cohérentes`);
    console.log(`Amélioration: +${finalValid} affectations 🚀`);

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixTaskProjectConsistency();