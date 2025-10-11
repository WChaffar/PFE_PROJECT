const mongoose = require('mongoose');
const Assignment = require('../models/AssignmentModel');
const User = require('../models/userModel');

// Connexion à la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");

const fixAssignmentOwners = async () => {
  try {
    console.log('🔧 Correction des incohérences dans les affectations...\n');

    // 1. Récupérer toutes les affectations incohérentes
    const assignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('Owner', 'fullName role');

    console.log(`📊 Total des affectations à analyser: ${assignments.length}`);

    let correctedCount = 0;
    let deletedCount = 0;
    let alreadyValidCount = 0;
    let errorCount = 0;

    for (const assignment of assignments) {
      try {
        // Ignorer les affectations avec données manquantes
        if (!assignment.employee || !assignment.Owner) {
          console.log(`⚠️ Affectation ${assignment._id} ignorée - données manquantes`);
          continue;
        }

        // Si l'employé n'a pas de manager, supprimer l'affectation
        if (!assignment.employee.manager) {
          await Assignment.findByIdAndDelete(assignment._id);
          deletedCount++;
          console.log(`🗑️ Supprimé ${assignment._id} - employé ${assignment.employee.fullName} sans manager`);
          continue;
        }

        const employeeManagerId = assignment.employee.manager.toString();
        const assignmentOwnerId = assignment.Owner._id.toString();

        // Si déjà cohérent, passer au suivant
        if (employeeManagerId === assignmentOwnerId) {
          alreadyValidCount++;
          continue;
        }

        // Corriger l'Owner pour qu'il corresponde au manager de l'employé
        await Assignment.findByIdAndUpdate(assignment._id, {
          Owner: assignment.employee.manager
        });

        correctedCount++;

        if (correctedCount % 100 === 0) {
          console.log(`📈 Progression: ${correctedCount} affectations corrigées...`);
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour l'affectation ${assignment._id}:`, error.message);
      }
    }

    console.log('\n🎉 CORRECTION TERMINÉE !');
    console.log(`✅ Affectations corrigées: ${correctedCount}`);
    console.log(`✅ Affectations déjà valides: ${alreadyValidCount}`);
    console.log(`🗑️ Affectations supprimées (employé sans manager): ${deletedCount}`);
    console.log(`❌ Erreurs rencontrées: ${errorCount}`);

    // Vérification finale
    console.log('\n🔍 VÉRIFICATION POST-CORRECTION...');
    const finalAssignments = await Assignment.find()
      .populate('employee', 'fullName manager')
      .populate('Owner', 'fullName role');

    let finalValidCount = 0;
    let finalInvalidCount = 0;

    for (const assignment of finalAssignments) {
      if (!assignment.employee || !assignment.Owner || !assignment.employee.manager) {
        finalInvalidCount++;
        continue;
      }

      const employeeManagerId = assignment.employee.manager.toString();
      const assignmentOwnerId = assignment.Owner._id.toString();

      if (employeeManagerId === assignmentOwnerId) {
        finalValidCount++;
      } else {
        finalInvalidCount++;
      }
    }

    console.log(`📊 Affectations finales: ${finalAssignments.length}`);
    console.log(`✅ Cohérentes: ${finalValidCount}`);
    console.log(`❌ Incohérentes restantes: ${finalInvalidCount}`);

    if (finalInvalidCount === 0) {
      console.log('\n🎉 SUCCÈS ! Toutes les affectations sont maintenant cohérentes !');
      console.log('👉 Vous pouvez maintenant recharger votre page Staffing pour voir les affectations.');
    } else {
      console.log(`\n⚠️ Il reste ${finalInvalidCount} incohérences à résoudre manuellement.`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixAssignmentOwners();