const mongoose = require('mongoose');

// Import models
const User = require('../models/userModel');
const Absence = require('../models/AbsenceModel');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Create realistic absences for employees
const createAbsences = async () => {
  try {
    console.log('🏖️ Création des absences pour les employés...\n');
    
    await connectDB();
    
    // Get all employees (not managers, HR, or BU directors)
    const employees = await User.find({ 
      role: { $nin: ['Manager', 'HR', 'BU_Director'] }
    });
    
    console.log(`👥 Nombre d'employés trouvés: ${employees.length}`);
    
    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }
    
    // Clear existing absences first
    await Absence.deleteMany({});
    console.log('🗑️ Anciennes absences supprimées');
    
    const absenceTypes = [
      'Congés Payés',
      'Congés Maladie', 
      'Formation',
      'Congés Sans Solde',
      'RTT',
      'Congés Maternité',
      'Congés Paternité'
    ];
    
    const absences = [];
    let totalAbsences = 0;
    
    // Create absences for each employee
    for (const employee of employees) {
      // Each employee will have 1-4 absences in 2025
      const numAbsences = Math.floor(Math.random() * 4) + 1; // 1 to 4 absences
      
      const employeeAbsences = [];
      
      for (let i = 0; i < numAbsences; i++) {
        // Random absence type with weighted probabilities
        let absenceType;
        const rand = Math.random();
        if (rand < 0.4) absenceType = 'Congés Payés'; // 40%
        else if (rand < 0.6) absenceType = 'RTT'; // 20%
        else if (rand < 0.75) absenceType = 'Congés Maladie'; // 15%
        else if (rand < 0.85) absenceType = 'Formation'; // 10%
        else if (rand < 0.95) absenceType = 'Congés Sans Solde'; // 10%
        else if (rand < 0.98) absenceType = 'Congés Maternité'; // 3%
        else absenceType = 'Congés Paternité'; // 2%
        
        // Generate random dates in 2025
        const year = 2025;
        const startMonth = Math.floor(Math.random() * 12) + 1; // 1-12
        const startDay = Math.floor(Math.random() * 28) + 1; // 1-28 (safe for all months)
        
        const startDate = new Date(year, startMonth - 1, startDay);
        
        // Duration based on absence type
        let duration;
        switch (absenceType) {
          case 'Congés Payés':
            duration = Math.floor(Math.random() * 10) + 5; // 5-14 days
            break;
          case 'Congés Maladie':
            duration = Math.floor(Math.random() * 3) + 1; // 1-3 days
            break;
          case 'Formation':
            duration = Math.floor(Math.random() * 3) + 1; // 1-3 days
            break;
          case 'RTT':
            duration = 1; // 1 day
            break;
          case 'Congés Sans Solde':
            duration = Math.floor(Math.random() * 5) + 2; // 2-6 days
            break;
          case 'Congés Maternité':
            duration = Math.floor(Math.random() * 20) + 90; // 90-109 days
            break;
          case 'Congés Paternité':
            duration = Math.floor(Math.random() * 7) + 11; // 11-17 days
            break;
          default:
            duration = 1;
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration - 1);
        
        // Ensure the absence doesn't overlap with existing ones for this employee
        const hasOverlap = employeeAbsences.some(abs => {
          const absStart = new Date(abs.startDate);
          const absEnd = new Date(abs.endDate);
          return (startDate <= absEnd && endDate >= absStart);
        });
        
        if (!hasOverlap && startDate.getFullYear() === 2025 && endDate.getFullYear() === 2025) {
          const absence = {
            employee: employee._id,
            type: absenceType,
            startDate: startDate,
            endDate: endDate,
            status: Math.random() < 0.9 ? 'Approved' : 'Pending', // 90% approved
            reason: `${absenceType} - ${employee.fullName}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          employeeAbsences.push(absence);
          absences.push(absence);
          totalAbsences++;
        }
      }
      
      console.log(`✅ ${employee.fullName}: ${employeeAbsences.length} absence(s) créée(s)`);
    }
    
    // Insert all absences into database
    if (absences.length > 0) {
      await Absence.insertMany(absences);
      console.log(`\n🎯 ${totalAbsences} absences créées avec succès!`);
    }
    
    // Statistics
    const absenceStats = {};
    absences.forEach(abs => {
      absenceStats[abs.type] = (absenceStats[abs.type] || 0) + 1;
    });
    
    console.log('\n📊 RÉPARTITION DES ABSENCES PAR TYPE:');
    Object.entries(absenceStats).forEach(([type, count]) => {
      const percentage = ((count / totalAbsences) * 100).toFixed(1);
      console.log(`  📋 ${type}: ${count} (${percentage}%)`);
    });
    
    // Show some examples
    console.log('\n🏖️ EXEMPLES D\'ABSENCES CRÉÉES:');
    const sampleAbsences = absences.slice(0, 10);
    for (const absence of sampleAbsences) {
      const employee = await User.findById(absence.employee);
      const duration = Math.ceil((absence.endDate - absence.startDate) / (1000 * 60 * 60 * 24)) + 1;
      console.log(`  👤 ${employee.fullName}: ${absence.type} du ${absence.startDate.toLocaleDateString('fr-FR')} au ${absence.endDate.toLocaleDateString('fr-FR')} (${duration} jour(s))`);
    }
    
    console.log('\n💡 Les absences sont maintenant disponibles pour le Staffing Calendar 2025!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des absences:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  createAbsences();
}

module.exports = { createAbsences };