const mongoose = require('mongoose');

// Import models
const User = require('../models/userModel');
const BusinessUnit = require('../models/BusinessUnitModel');

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

// Get all users to show available test accounts
const getTestUsers = async () => {
  try {
    console.log('🔍 Récupération des utilisateurs de test...\n');
    
    await connectDB();
    
    // Get all users
    const users = await User.find({}, 'fullName email role businessUnit manager').populate('businessUnit', 'name').populate('manager', 'fullName');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }
    
    console.log(`📊 Total utilisateurs trouvés: ${users.length}\n`);
    
    // Group by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});
    
    // Display users by role
    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`🎯 ${role.toUpperCase()} (${roleUsers.length}):`);
      roleUsers.forEach(user => {
        const buName = user.businessUnit ? user.businessUnit.name : 'No BU';
        const managerName = user.manager ? user.manager.fullName : 'No Manager';
        console.log(`  📧 ${user.email}`);
        console.log(`     👤 ${user.fullName} | 🏢 ${buName} | 👨‍💼 ${managerName}`);
        console.log('');
      });
      console.log('---\n');
    }
    
    console.log('🔑 MOT DE PASSE UNIVERSEL: password123\n');
    
    console.log('💡 COMPTES RECOMMANDÉS POUR TESTER:');
    console.log('👨‍💼 Manager (pour voir le Staffing Calendar):');
    const managers = usersByRole.Manager || [];
    managers.slice(0, 3).forEach(manager => {
      console.log(`  📧 ${manager.email} - ${manager.fullName}`);
    });
    
    console.log('\n👔 Directeur BU (accès étendu):');
    const directors = usersByRole.BUDirector || [];
    directors.slice(0, 2).forEach(director => {
      console.log(`  📧 ${director.email} - ${director.fullName}`);
    });
    
    console.log('\n🏛️ Personnel RH (accès global):');
    const hrStaff = [...(usersByRole.HR || []), ...(usersByRole.Admin || [])];
    hrStaff.slice(0, 2).forEach(hr => {
      console.log(`  📧 ${hr.email} - ${hr.fullName}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  getTestUsers();
}

module.exports = { getTestUsers };