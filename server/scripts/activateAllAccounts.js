const mongoose = require('mongoose');

// Import models
const User = require('../models/userModel');

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

// Activate all user accounts
const activateAllAccounts = async () => {
  try {
    console.log('🔧 Activation de tous les comptes utilisateurs...\n');
    
    await connectDB();
    
    // Check current status
    const totalUsers = await User.countDocuments();
    const inactiveUsers = await User.countDocuments({ Activated: { $ne: true } });
    const activeUsers = await User.countDocuments({ Activated: true });
    
    console.log(`📊 État actuel des comptes:`);
    console.log(`  👥 Total utilisateurs: ${totalUsers}`);
    console.log(`  ✅ Comptes actifs: ${activeUsers}`);
    console.log(`  ❌ Comptes inactifs: ${inactiveUsers}\n`);
    
    if (inactiveUsers > 0) {
      // Activate all users
      const result = await User.updateMany(
        {}, // All users
        { 
          Activated: true,
          profileCompleted: true
        },
        { multi: true }
      );
      
      console.log(`✅ ${result.modifiedCount} comptes activés avec succès!`);
    } else {
      console.log('✅ Tous les comptes sont déjà actifs!');
    }
    
    // Verify the update
    const finalActiveUsers = await User.countDocuments({ Activated: true });
    console.log(`\n📊 État final:`);
    console.log(`  ✅ Comptes actifs: ${finalActiveUsers}/${totalUsers}`);
    
    // Show some activated accounts for testing
    const sampleUsers = await User.find({ role: { $in: ['Manager', 'BUDirector', 'HR', 'Admin'] } }, 'fullName email role Activated').limit(10);
    
    console.log('\n🎯 COMPTES DE TEST ACTIVÉS:');
    sampleUsers.forEach(user => {
      const status = user.Activated ? '✅' : '❌';
      console.log(`  ${status} ${user.email} (${user.role}) - ${user.fullName}`);
    });
    
    console.log('\n🔑 MOT DE PASSE UNIVERSEL: password123');
    console.log('\n💡 COMPTES RECOMMANDÉS POUR TESTER LE STAFFING CALENDAR:');
    console.log('📧 manager_dev_1@company.com / password123');
    console.log('📧 manager_qa_1@company.com / password123');
    console.log('📧 hr_director@company.com / password123');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'activation des comptes:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  activateAllAccounts();
}

module.exports = { activateAllAccounts };