const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');

// Connexion à la base de données
mongoose.connect('mongodb://localhost:27017/PFEDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixAssignmentConsistency = async () => {
  try {
    console.log('🔍 Diagnostic des incohérences dans les affectations...\n');

    // 1. Récupérer toutes les affectations
    const assignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('Owner', 'fullName role');

    console.log(`📊 Total des affectations: ${assignments.length}`);

    // 2. Identifier les incohérences
    const inconsistentAssignments = [];
    const validAssignments = [];

    for (const assignment of assignments) {
      if (!assignment.employee || !assignment.Owner) {
        console.log(`⚠️ Affectation avec données manquantes: ${assignment._id}`);
        continue;
      }

      const employeeManagerId = assignment.employee.manager?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      if (employeeManagerId !== assignmentOwnerId) {
        inconsistentAssignments.push({
          assignmentId: assignment._id,
          employeeName: assignment.employee.fullName,
          employeeManager: employeeManagerId,
          assignmentOwner: assignmentOwnerId,
          ownerName: assignment.Owner.fullName
        });
      } else {
        validAssignments.push(assignment);
      }
    }

    console.log(`✅ Affectations cohérentes: ${validAssignments.length}`);
    console.log(`❌ Affectations incohérentes: ${inconsistentAssignments.length}\n`);

    if (inconsistentAssignments.length > 0) {
      console.log('📋 Détail des incohérences:');
      inconsistentAssignments.forEach((inc, index) => {
        console.log(`${index + 1}. Affectation ${inc.assignmentId}`);
        console.log(`   - Employé: ${inc.employeeName}`);
        console.log(`   - Manager de l'employé: ${inc.employeeManager || 'AUCUN'}`);
        console.log(`   - Owner de l'affectation: ${inc.assignmentOwner} (${inc.ownerName})`);
        console.log('');
      });

      // 3. Proposer des solutions
      console.log('🔧 OPTIONS DE CORRECTION:');
      console.log('1. Supprimer les affectations incohérentes');
      console.log('2. Corriger l\'Owner pour qu\'il corresponde au manager de l\'employé');
      console.log('3. Réassigner les employés au manager qui est Owner de l\'affectation');
      
      // Pour cet exemple, on va corriger l'Owner pour qu'il corresponde au manager
      console.log('\n🔧 Application de la correction: mise à jour de l\'Owner...');
      
      let correctedCount = 0;
      let deletedCount = 0;

      for (const inc of inconsistentAssignments) {
        if (inc.employeeManager) {
          // Corriger l'Owner
          await Assignment.findByIdAndUpdate(inc.assignmentId, {
            Owner: inc.employeeManager
          });
          correctedCount++;
          console.log(`✅ Affectation ${inc.assignmentId} corrigée - Owner mis à jour`);
        } else {
          // Supprimer l'affectation si l'employé n'a pas de manager
          await Assignment.findByIdAndDelete(inc.assignmentId);
          deletedCount++;
          console.log(`🗑️ Affectation ${inc.assignmentId} supprimée - employé sans manager`);
        }
      }

      console.log(`\n📊 RÉSUMÉ DE LA CORRECTION:`);
      console.log(`✅ Affectations corrigées: ${correctedCount}`);
      console.log(`🗑️ Affectations supprimées: ${deletedCount}`);
      console.log(`✅ Affectations déjà valides: ${validAssignments.length}`);
    } else {
      console.log('✅ Toutes les affectations sont cohérentes !');
    }

    console.log('\n🎯 VÉRIFICATION POST-CORRECTION...');
    
    // Vérification finale
    const finalAssignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('Owner', 'fullName role');

    const finalInconsistencies = finalAssignments.filter(assignment => {
      if (!assignment.employee || !assignment.Owner) return false;
      const employeeManagerId = assignment.employee.manager?.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();
      return employeeManagerId !== assignmentOwnerId;
    });

    console.log(`📊 Affectations restantes: ${finalAssignments.length}`);
    console.log(`❌ Incohérences restantes: ${finalInconsistencies.length}`);

    if (finalInconsistencies.length === 0) {
      console.log('🎉 Toutes les affectations sont maintenant cohérentes !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Lancer le script
fixAssignmentConsistency();