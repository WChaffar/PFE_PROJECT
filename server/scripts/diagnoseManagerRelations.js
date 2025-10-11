const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const diagnoseManagerRelationsConsistency = async () => {
  try {
    console.log('🔍 Diagnostic complet des relations Manager-Projet-Équipe-Tâches-Affectations...\n');

    // 1. Récupérer tous les managers et leurs équipes
    const managers = await User.find({ 
      role: { $in: ["Manager", "BUDirector"] } 
    }).select('_id fullName role');

    console.log(`👨‍💼 Total managers: ${managers.length}`);

    let totalIssues = 0;
    let managersWithIssues = [];

    for (const manager of managers.slice(0, 5)) { // Analyser les 5 premiers pour éviter le spam
      console.log(`\n🔍 Analyse de ${manager.fullName} (${manager.role}):`);
      
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
      const managerProjectIds = managerProjects.map(p => p._id);
      const managerTasks = await Task.find({
        project: { $in: managerProjectIds }
      }).select('_id taskName project');

      // Récupérer les affectations créées par ce manager
      const managerAssignments = await Assignment.find({
        Owner: manager._id
      }).populate('employee', 'fullName manager')
        .populate('project', 'projectName owner')
        .populate('taskId', 'taskName project');

      console.log(`   👥 Équipe: ${teamMembers.length} membres`);
      console.log(`   📁 Projets: ${managerProjects.length}`);
      console.log(`   📋 Tâches: ${managerTasks.length}`);
      console.log(`   📊 Affectations: ${managerAssignments.length}`);

      // Analyser les incohérences
      let managerIssues = {
        name: manager.fullName,
        employeeIssues: 0,
        projectIssues: 0,
        taskIssues: 0,
        totalIssues: 0
      };

      const teamMemberIds = teamMembers.map(tm => tm._id.toString());
      const managerTaskIds = managerTasks.map(mt => mt._id.toString());

      // Vérifier chaque affectation
      for (const assignment of managerAssignments) {
        let issueFound = false;

        // 1. L'employé doit appartenir à l'équipe du manager
        if (assignment.employee) {
          const employeeId = assignment.employee._id.toString();
          if (!teamMemberIds.includes(employeeId)) {
            managerIssues.employeeIssues++;
            issueFound = true;
          }
        }

        // 2. Le projet doit appartenir au manager
        if (assignment.project) {
          const projectOwnerId = assignment.project.owner?.toString();
          if (projectOwnerId !== manager._id.toString()) {
            managerIssues.projectIssues++;
            issueFound = true;
          }
        }

        // 3. La tâche doit appartenir aux projets du manager
        if (assignment.taskId) {
          const taskId = assignment.taskId._id.toString();
          if (!managerTaskIds.includes(taskId)) {
            managerIssues.taskIssues++;
            issueFound = true;
          }
        }

        if (issueFound) {
          managerIssues.totalIssues++;
        }
      }

      if (managerIssues.totalIssues > 0) {
        console.log(`   ❌ Incohérences détectées:`);
        console.log(`      - Employés non-équipe: ${managerIssues.employeeIssues}`);
        console.log(`      - Projets non-possédés: ${managerIssues.projectIssues}`);
        console.log(`      - Tâches non-manager: ${managerIssues.taskIssues}`);
        
        managersWithIssues.push(managerIssues);
        totalIssues += managerIssues.totalIssues;
      } else {
        console.log(`   ✅ Aucune incohérence détectée`);
      }
    }

    // Résumé global
    console.log('\n📊 RÉSUMÉ GLOBAL:');
    console.log(`🏢 Managers avec incohérences: ${managersWithIssues.length}`);
    console.log(`❌ Total d'incohérences: ${totalIssues}`);

    if (managersWithIssues.length > 0) {
      console.log('\n🔧 STRATÉGIES DE CORRECTION POSSIBLES:');
      console.log('1. SUPPRESSION: Supprimer les affectations incohérentes');
      console.log('2. RÉASSIGNATION: Réassigner les affectations aux bons managers');
      console.log('3. CORRECTION: Corriger les relations (équipe, propriété des projets)');
      
      console.log('\n⚠️ RECOMMANDATION: Commencer par la SUPPRESSION pour nettoyer la base,');
      console.log('   puis recréer des affectations cohérentes.');
    }

    // Statistiques détaillées par type d'incohérence
    const totalEmployeeIssues = managersWithIssues.reduce((sum, m) => sum + m.employeeIssues, 0);
    const totalProjectIssues = managersWithIssues.reduce((sum, m) => sum + m.projectIssues, 0);
    const totalTaskIssues = managersWithIssues.reduce((sum, m) => sum + m.taskIssues, 0);

    console.log('\n📈 RÉPARTITION DES INCOHÉRENCES:');
    console.log(`👥 Employés hors équipe: ${totalEmployeeIssues}`);
    console.log(`📁 Projets non-possédés: ${totalProjectIssues}`);
    console.log(`📋 Tâches non-manager: ${totalTaskIssues}`);

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    mongoose.connection.close();
  }
};

diagnoseManagerRelationsConsistency();