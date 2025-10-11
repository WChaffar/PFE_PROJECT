const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const diagnoseTaskProjectConsistency = async () => {
  try {
    console.log('🔍 Diagnostic des incohérences Task-Projet dans les affectations...\n');

    // 1. Récupérer toutes les affectations avec leurs détails complets
    const assignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('Owner', 'fullName role')
      .populate('project', 'projectName Owner')
      .populate('taskId', 'taskName project');

    console.log(`📊 Total des affectations: ${assignments.length}`);

    if (assignments.length === 0) {
      console.log('❌ Aucune affectation trouvée !');
      return;
    }

    // 2. Analyser la cohérence Task-Projet
    const taskProjectInconsistencies = [];
    const managerProjectInconsistencies = [];
    const validAssignments = [];
    const dataIssues = [];

    for (const assignment of assignments) {
      // Vérifier les données nulles
      if (!assignment.project || !assignment.taskId || !assignment.Owner) {
        dataIssues.push({
          assignmentId: assignment._id,
          issue: 'Données manquantes',
          project: assignment.project?.projectName || 'NULL',
          task: assignment.taskId?.taskName || 'NULL',
          owner: assignment.Owner?.fullName || 'NULL'
        });
        continue;
      }

      // Vérifier si la tâche appartient au projet de l'affectation
      const taskProjectId = assignment.taskId.project?.toString();
      const assignmentProjectId = assignment.project._id.toString();

      if (taskProjectId !== assignmentProjectId) {
        taskProjectInconsistencies.push({
          assignmentId: assignment._id,
          taskName: assignment.taskId.taskName,
          taskProjectId: taskProjectId,
          assignmentProject: assignment.project.projectName,
          assignmentProjectId: assignmentProjectId,
          owner: assignment.Owner.fullName
        });
        continue;
      }

      // Vérifier si le manager (Owner) est bien le propriétaire du projet
      const projectOwnerId = assignment.project.Owner?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      if (projectOwnerId !== assignmentOwnerId) {
        managerProjectInconsistencies.push({
          assignmentId: assignment._id,
          projectName: assignment.project.projectName,
          projectOwner: projectOwnerId,
          assignmentOwner: assignment.Owner.fullName,
          assignmentOwnerId: assignmentOwnerId,
          task: assignment.taskId.taskName
        });
        continue;
      }

      validAssignments.push(assignment);
    }

    // 3. Afficher les résultats
    console.log('\n📈 RÉSULTATS DU DIAGNOSTIC:');
    console.log(`✅ Affectations cohérentes: ${validAssignments.length}`);
    console.log(`❌ Incohérences Task-Projet: ${taskProjectInconsistencies.length}`);
    console.log(`❌ Incohérences Manager-Projet: ${managerProjectInconsistencies.length}`);
    console.log(`🚫 Problèmes de données: ${dataIssues.length}`);

    // 4. Détail des incohérences Task-Projet
    if (taskProjectInconsistencies.length > 0) {
      console.log('\n❌ INCOHÉRENCES TASK-PROJET (max 10):');
      taskProjectInconsistencies.slice(0, 10).forEach((inc, index) => {
        console.log(`${index + 1}. ID: ${inc.assignmentId}`);
        console.log(`   - Tâche: ${inc.taskName}`);
        console.log(`   - Projet de la tâche: ${inc.taskProjectId}`);
        console.log(`   - Projet de l'affectation: ${inc.assignmentProject} (${inc.assignmentProjectId})`);
        console.log(`   - Manager: ${inc.owner}`);
        console.log('');
      });

      if (taskProjectInconsistencies.length > 10) {
        console.log(`... et ${taskProjectInconsistencies.length - 10} autres incohérences Task-Projet\n`);
      }
    }

    // 5. Détail des incohérences Manager-Projet
    if (managerProjectInconsistencies.length > 0) {
      console.log('\n❌ INCOHÉRENCES MANAGER-PROJET (max 10):');
      managerProjectInconsistencies.slice(0, 10).forEach((inc, index) => {
        console.log(`${index + 1}. ID: ${inc.assignmentId}`);
        console.log(`   - Projet: ${inc.projectName}`);
        console.log(`   - Propriétaire du projet: ${inc.projectOwner}`);
        console.log(`   - Manager de l'affectation: ${inc.assignmentOwner} (${inc.assignmentOwnerId})`);
        console.log(`   - Tâche: ${inc.task}`);
        console.log('');
      });

      if (managerProjectInconsistencies.length > 10) {
        console.log(`... et ${managerProjectInconsistencies.length - 10} autres incohérences Manager-Projet\n`);
      }
    }

    // 6. Statistiques par manager
    console.log('\n📊 STATISTIQUES PAR MANAGER:');
    const managerStats = {};
    
    for (const assignment of assignments) {
      if (!assignment.Owner) continue;
      
      const managerId = assignment.Owner._id.toString();
      const managerName = assignment.Owner.fullName;
      
      if (!managerStats[managerId]) {
        managerStats[managerId] = {
          name: managerName,
          totalAssignments: 0,
          validAssignments: 0,
          taskProjectIssues: 0,
          managerProjectIssues: 0
        };
      }
      
      managerStats[managerId].totalAssignments++;
      
      const hasTaskProjectIssue = taskProjectInconsistencies.some(inc => 
        inc.assignmentId.toString() === assignment._id.toString()
      );
      const hasManagerProjectIssue = managerProjectInconsistencies.some(inc => 
        inc.assignmentId.toString() === assignment._id.toString()
      );
      
      if (hasTaskProjectIssue) {
        managerStats[managerId].taskProjectIssues++;
      } else if (hasManagerProjectIssue) {
        managerStats[managerId].managerProjectIssues++;
      } else {
        managerStats[managerId].validAssignments++;
      }
    }

    Object.values(managerStats).forEach(stat => {
      if (stat.taskProjectIssues > 0 || stat.managerProjectIssues > 0) {
        console.log(`👨‍💼 ${stat.name}:`);
        console.log(`   Total: ${stat.totalAssignments}, Valides: ${stat.validAssignments}`);
        console.log(`   Problèmes Task-Projet: ${stat.taskProjectIssues}`);
        console.log(`   Problèmes Manager-Projet: ${stat.managerProjectIssues}`);
      }
    });

    // 7. Recommandations
    console.log('\n🔧 RECOMMANDATIONS:');
    if (taskProjectInconsistencies.length > 0) {
      console.log('1. Corriger les incohérences Task-Projet en mettant à jour le projet de l\'affectation');
      console.log('   pour qu\'il corresponde au projet de la tâche.');
    }
    if (managerProjectInconsistencies.length > 0) {
      console.log('2. Corriger les incohérences Manager-Projet en s\'assurant que seuls les');
      console.log('   propriétaires des projets peuvent créer des affectations sur ces projets.');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    mongoose.connection.close();
  }
};

diagnoseTaskProjectConsistency();