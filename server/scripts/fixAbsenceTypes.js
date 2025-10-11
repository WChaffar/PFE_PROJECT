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

// Create realistic absences with correct types
const createCorrectAbsences = async () => {
  try {
    console.log('🔧 Correction des types d\'absences dans la base de données...\n');
    
    await connectDB();
    
    // Get only employees (exclude managers, HR, and BU directors)
    const employees = await User.find({ 
      role: 'Employee' // Only employees
    });
    
    console.log(`👥 Nombre d'employés trouvés: ${employees.length}`);
    
    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }
    
    // Clear existing absences first
    await Absence.deleteMany({});
    console.log('🗑️ Anciennes absences supprimées');
    
    // Correct absence types from your application
    const absenceTypes = [
      'Paid leave',                    // Congés payés
      'unpaid leave',                  // Congés sans solde
      'Alternating training days'      // Jours de formation alternée
    ];
    
    const absences = [];
    let totalAbsences = 0;
    
    // Create absences for each employee - exactly 30 days per employee
    // with varied types and spread across different months
    for (const employee of employees) {
      const employeeAbsences = [];
      let totalDaysForEmployee = 0;
      const targetDays = 30; // Exactly 30 days per employee
      
      // Ensure each employee has varied absence types
      const employeeAbsenceTypes = [
        { type: 'Paid leave', minDays: 15, maxDays: 20 }, // Main vacation
        { type: 'Alternating training days', minDays: 3, maxDays: 6 }, // Training
        { type: 'unpaid leave', minDays: 2, maxDays: 5 } // Personal leave
      ];
      
      // Shuffle the types for variety
      const shuffledTypes = employeeAbsenceTypes.sort(() => Math.random() - 0.5);
      
      // Create absences for each type
      for (const absenceTypeConfig of shuffledTypes) {
        if (totalDaysForEmployee >= targetDays) break;
        
        const remainingDays = targetDays - totalDaysForEmployee;
        const daysForThisType = Math.min(
          remainingDays,
          Math.floor(Math.random() * (absenceTypeConfig.maxDays - absenceTypeConfig.minDays + 1)) + absenceTypeConfig.minDays
        );
        
        // Split this type into 1-2 periods to spread across months
        const periodsForThisType = Math.min(2, Math.ceil(daysForThisType / 8));
        let daysAssignedForType = 0;
        
        for (let period = 0; period < periodsForThisType && daysAssignedForType < daysForThisType; period++) {
          const remainingDaysForType = daysForThisType - daysAssignedForType;
          const daysForThisPeriod = period === periodsForThisType - 1 
            ? remainingDaysForType 
            : Math.ceil(remainingDaysForType / (periodsForThisType - period));
          
          // Select different months for variety (avoid same month)
          const usedMonths = employeeAbsences.map(abs => abs.startDate.getMonth());
          let selectedMonth;
          let attempts = 0;
          do {
            selectedMonth = Math.floor(Math.random() * 12); // 0-11
            attempts++;
          } while (usedMonths.includes(selectedMonth) && attempts < 10);
          
          // Generate date in selected month
          const year = 2025;
          const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
          const maxStartDay = Math.max(1, daysInMonth - daysForThisPeriod);
          const startDay = Math.floor(Math.random() * maxStartDay) + 1;
          
          const startDate = new Date(year, selectedMonth, startDay);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + daysForThisPeriod - 1);
          
          // Ensure no overlap
          const hasOverlap = employeeAbsences.some(abs => {
            const absStart = new Date(abs.startDate);
            const absEnd = new Date(abs.endDate);
            return (startDate <= absEnd && endDate >= absStart);
          });
          
          if (!hasOverlap && startDate.getFullYear() === 2025 && endDate.getFullYear() === 2025) {
            const absence = {
              employee: employee._id,
              type: absenceTypeConfig.type,
              startDate: startDate,
              endDate: endDate,
              status: Math.random() < 0.9 ? 'Approved' : 'Pending', // 90% approved
              reason: `${absenceTypeConfig.type} - ${employee.fullName}`,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            employeeAbsences.push(absence);
            absences.push(absence);
            totalAbsences++;
            totalDaysForEmployee += daysForThisPeriod;
            daysAssignedForType += daysForThisPeriod;
          }
        }
      }
      
      // If we haven't reached exactly 30 days, add a final "Paid leave" period
      if (totalDaysForEmployee < targetDays) {
        const remainingDays = targetDays - totalDaysForEmployee;
        
        // Find an unused month
        const usedMonths = employeeAbsences.map(abs => abs.startDate.getMonth());
        const availableMonths = [0,1,2,3,4,5,6,7,8,9,10,11].filter(m => !usedMonths.includes(m));
        const selectedMonth = availableMonths.length > 0 
          ? availableMonths[Math.floor(Math.random() * availableMonths.length)]
          : Math.floor(Math.random() * 12);
        
        const year = 2025;
        const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
        const maxStartDay = Math.max(1, daysInMonth - remainingDays);
        const startDay = Math.floor(Math.random() * maxStartDay) + 1;
        
        const startDate = new Date(year, selectedMonth, startDay);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + remainingDays - 1);
        
        const absence = {
          employee: employee._id,
          type: 'Paid leave',
          startDate: startDate,
          endDate: endDate,
          status: Math.random() < 0.9 ? 'Approved' : 'Pending',
          reason: `Paid leave - ${employee.fullName}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        employeeAbsences.push(absence);
        absences.push(absence);
        totalAbsences++;
        totalDaysForEmployee += remainingDays;
      }
      
      // Sort absences by date for better display
      employeeAbsences.sort((a, b) => a.startDate - b.startDate);
      
      console.log(`✅ ${employee.fullName}: ${employeeAbsences.length} absence(s) créée(s) - Total: ${totalDaysForEmployee} jours`);
      
      // Show the months distribution for this employee
      const monthsUsed = employeeAbsences.map(abs => (abs.startDate.getMonth() + 1)).sort((a,b) => a-b);
      console.log(`   📅 Mois utilisés: ${monthsUsed.join(', ')}`);
    }
    
    // Insert all absences into database
    if (absences.length > 0) {
      await Absence.insertMany(absences);
      console.log(`\n🎯 ${totalAbsences} absences créées avec les types corrects!`);
    }
    
    // Statistics
    const absenceStats = {};
    absences.forEach(abs => {
      absenceStats[abs.type] = (absenceStats[abs.type] || 0) + 1;
    });
    
    console.log('\n📊 RÉPARTITION DES ABSENCES PAR TYPE (CORRIGÉE):');
    Object.entries(absenceStats).forEach(([type, count]) => {
      const percentage = ((count / totalAbsences) * 100).toFixed(1);
      console.log(`  📋 ${type}: ${count} (${percentage}%)`);
    });
    
    // Show some examples
    console.log('\n🏖️ EXEMPLES D\'ABSENCES AVEC TYPES CORRECTS:');
    const sampleAbsences = absences.slice(0, 10);
    for (const absence of sampleAbsences) {
      const employee = await User.findById(absence.employee);
      const duration = Math.ceil((absence.endDate - absence.startDate) / (1000 * 60 * 60 * 24)) + 1;
      console.log(`  👤 ${employee.fullName}: ${absence.type} du ${absence.startDate.toLocaleDateString('fr-FR')} au ${absence.endDate.toLocaleDateString('fr-FR')} (${duration} jour(s))`);
    }
    
    console.log('\n✅ Types d\'absences corrigés selon votre application!');
    console.log('📝 Types disponibles: "Paid leave", "unpaid leave", "Alternating training days"');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des absences:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  createCorrectAbsences();
}

module.exports = { createCorrectAbsences };