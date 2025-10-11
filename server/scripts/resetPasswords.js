const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Check password hashing and reset all passwords to 'password123'
const checkAndResetPasswords = async () => {
  try {
    console.log('🔍 Vérification et réinitialisation des mots de passe...\n');
    
    await connectDB();
    
    // Get a sample user to check current password format
    const sampleUser = await User.findOne({ role: 'Manager' });
    if (sampleUser) {
      console.log('🔍 Exemple de mot de passe haché actuel:');
      console.log(`  User: ${sampleUser.email}`);
      console.log(`  Password Hash: ${sampleUser.password}`);
      console.log(`  Hash Length: ${sampleUser.password?.length || 'undefined'}`);
      
      // Test if current password matches 'password123'
      if (sampleUser.password) {
        const isMatch = await bcrypt.compare('password123', sampleUser.password);
        console.log(`  ✅ Password 'password123' matches: ${isMatch}`);
        
        if (!isMatch) {
          console.log('❌ Les mots de passe actuels ne correspondent pas à "password123"');
          console.log('🔧 Réinitialisation de tous les mots de passe...\n');
          
          // Hash the new password
          const newHashedPassword = await bcrypt.hash('password123', 10);
          console.log(`🔑 Nouveau hash généré: ${newHashedPassword}`);
          
          // Update all users with the new password
          const result = await User.updateMany(
            {}, 
            { password: newHashedPassword },
            { multi: true }
          );
          
          console.log(`✅ ${result.modifiedCount} utilisateurs mis à jour avec le nouveau mot de passe`);
          
          // Verify with a test
          const testUser = await User.findOne({ role: 'Manager' });
          const testMatch = await bcrypt.compare('password123', testUser.password);
          console.log(`🧪 Test de vérification: ${testMatch ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
          
        } else {
          console.log('✅ Les mots de passe actuels sont déjà corrects');
        }
      }
    } else {
      console.log('❌ Aucun utilisateur Manager trouvé pour le test');
    }
    
    console.log('\n🎯 COMPTES DE TEST RECOMMANDÉS:');
    console.log('📧 manager_dev_1@company.com / password123');
    console.log('📧 manager_qa_1@company.com / password123');
    console.log('📧 hr_director@company.com / password123');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des mots de passe:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  checkAndResetPasswords();
}

module.exports = { checkAndResetPasswords };