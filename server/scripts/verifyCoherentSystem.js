const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const verifyCoherentSystem = async () => {
  try {
    console.log('🔍 Vérification du système nettoyé...\n');

    // Vérifier la cohérence générale
    const assignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('project', 'projectName owner')
      .populate('Owner', 'fullName role');

    console.log(`📊 Total affectations restantes: ${assignments.length}`);

    let perfectlyCoherent = 0;
    let employeeManagerIssues = 0;
    let projectOwnerIssues = 0;
    let ownerMismatchIssues = 0;

    for (const assignment of assignments) {
      if (!assignment.employee || !assignment.project || !assignment.Owner) {
        continue;
      }

      const employeeManagerId = assignment.employee.manager?.toString();
      const projectOwnerId = assignment.project.owner?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      let issueCount = 0;

      // Vérifier que l'employé a bien le manager comme manager
      if (employeeManagerId !== assignmentOwnerId) {
        employeeManagerIssues++;
        issueCount++;
      }

      // Vérifier que le projet appartient bien au manager
      if (projectOwnerId !== assignmentOwnerId) {
        projectOwnerIssues++;
        issueCount++;
      }

      if (issueCount === 0) {
        perfectlyCoherent++;
      }
    }

    console.log('\n🎉 RÉSULTATS DE COHÉRENCE:');
    console.log(`✅ Affectations parfaitement cohérentes: ${perfectlyCoherent}`);
    console.log(`❌ Problèmes employé-manager: ${employeeManagerIssues}`);
    console.log(`❌ Problèmes projet-propriétaire: ${projectOwnerIssues}`);

    const coherenceRate = ((perfectlyCoherent / assignments.length) * 100).toFixed(1);
    console.log(`📈 Taux de cohérence parfaite: ${coherenceRate}%`);

    // Analyser quelques managers spécifiques
    console.log('\n👨‍💼 ANALYSE DE QUELQUES MANAGERS:');
    
    const managers = await User.find({ 
      role: { $in: ["Manager", "BUDirector"] } 
    }).select('_id fullName').limit(5);

    for (const manager of managers) {
      const managerAssignments = await Assignment.find({ Owner: manager._id })
        .populate('employee', 'fullName manager')
        .populate('project', 'projectName owner');

      let coherentCount = 0;
      for (const assignment of managerAssignments) {
        if (assignment.employee && assignment.project) {
          const employeeManagerId = assignment.employee.manager?.toString();
          const projectOwnerId = assignment.project.owner?.toString();
          const managerId = manager._id.toString();

          if (employeeManagerId === managerId && projectOwnerId === managerId) {
            coherentCount++;
          }
        }
      }

      console.log(`🎯 ${manager.fullName}:`);
      console.log(`   Total affectations: ${managerAssignments.length}`);
      console.log(`   Affectations cohérentes: ${coherentCount}`);
      console.log(`   Taux de cohérence: ${managerAssignments.length > 0 ? ((coherentCount / managerAssignments.length) * 100).toFixed(1) : 0}%`);
    }

    if (coherenceRate > 90) {
      console.log('\n🎉 FANTASTIQUE ! Le système est maintenant très cohérent !');
    } else if (coherenceRate > 70) {
      console.log('\n👍 EXCELLENT ! Le système est largement cohérent !');
    } else if (coherenceRate > 50) {
      console.log('\n👌 BIEN ! Le système est majoritairement cohérent !');
    }

    console.log('\n💡 PROCHAINES ÉTAPES:');
    console.log('1. Testez la page Staffing Calendar');
    console.log('2. Testez la page Time & Workload');
    console.log('3. Chaque manager ne devrait voir que SES données !');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    mongoose.connection.close();
  }
};

verifyCoherentSystem();