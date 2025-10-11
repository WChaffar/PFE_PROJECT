const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const diagnoseAssignmentConsistency = async () => {
  try {
    console.log('🔍 Diagnostic des incohérences dans les affectations...\n');

    // 1. Récupérer toutes les affectations avec leurs détails
    const assignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('Owner', 'fullName role');

    console.log(`📊 Total des affectations: ${assignments.length}`);

    if (assignments.length === 0) {
      console.log('❌ Aucune affectation trouvée !');
      return;
    }

    // 2. Analyser la cohérence des affectations
    const inconsistentAssignments = [];
    const validAssignments = [];
    const noManagerAssignments = [];
    const nullDataAssignments = [];

    for (const assignment of assignments) {
      // Vérifier les données nulles
      if (!assignment.employee || !assignment.Owner) {
        nullDataAssignments.push({
          assignmentId: assignment._id,
          employee: assignment.employee?.fullName || 'NULL',
          owner: assignment.Owner?.fullName || 'NULL'
        });
        continue;
      }

      // Vérifier si l'employé a un manager
      if (!assignment.employee.manager) {
        noManagerAssignments.push({
          assignmentId: assignment._id,
          employeeName: assignment.employee.fullName,
          ownerName: assignment.Owner.fullName
        });
        continue;
      }

      // Comparer manager de l'employé vs Owner de l'affectation
      const employeeManagerId = assignment.employee.manager.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      if (employeeManagerId !== assignmentOwnerId) {
        inconsistentAssignments.push({
          assignmentId: assignment._id,
          employeeName: assignment.employee.fullName,
          employeeManagerId: employeeManagerId,
          assignmentOwnerName: assignment.Owner.fullName,
          assignmentOwnerId: assignmentOwnerId
        });
      } else {
        validAssignments.push(assignment);
      }
    }

    // 3. Afficher les résultats
    console.log('\n📈 RÉSULTATS DU DIAGNOSTIC:');
    console.log(`✅ Affectations cohérentes: ${validAssignments.length}`);
    console.log(`❌ Affectations incohérentes: ${inconsistentAssignments.length}`);
    console.log(`⚠️ Affectations avec employé sans manager: ${noManagerAssignments.length}`);
    console.log(`🚫 Affectations avec données nulles: ${nullDataAssignments.length}`);

    // 4. Détail des incohérences (limité à 10 pour éviter le spam)
    if (inconsistentAssignments.length > 0) {
      console.log('\n❌ EXEMPLES D\'INCOHÉRENCES (max 10):');
      inconsistentAssignments.slice(0, 10).forEach((inc, index) => {
        console.log(`${index + 1}. ID: ${inc.assignmentId}`);
        console.log(`   - Employé: ${inc.employeeName}`);
        console.log(`   - Manager de l'employé (devrait être): ${inc.employeeManagerId}`);
        console.log(`   - Owner actuel de l'affectation: ${inc.assignmentOwnerName} (${inc.assignmentOwnerId})`);
        console.log('');
      });

      if (inconsistentAssignments.length > 10) {
        console.log(`... et ${inconsistentAssignments.length - 10} autres incohérences\n`);
      }
    }

    // 5. Proposer une solution
    if (inconsistentAssignments.length > 0) {
      console.log('🔧 SOLUTION PROPOSÉE:');
      console.log('Pour corriger ces incohérences, nous devons mettre à jour le champ "Owner"');
      console.log('de chaque affectation pour qu\'il corresponde au manager de l\'employé.');
      console.log('\nVoulez-vous que je crée un script de correction ?');
    } else {
      console.log('🎉 Toutes les affectations sont cohérentes !');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    mongoose.connection.close();
  }
};

diagnoseAssignmentConsistency();