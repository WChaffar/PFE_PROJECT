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

// Skills and certifications by job type
const jobProfiles = {
  'Frontend Developer': {
    skills: ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Sass', 'Bootstrap', 'Webpack'],
    certifications: ['AWS Certified Developer', 'Google Analytics Certified', 'React Developer Certification', 'JavaScript Algorithms and Data Structures'],
    baseSalary: 45000,
    experienceRange: [2, 8]
  },
  'Backend Developer': {
    skills: ['Node.js', 'Python', 'Java', 'Express.js', 'MongoDB', 'PostgreSQL', 'REST APIs', 'GraphQL', 'Docker', 'AWS'],
    certifications: ['AWS Certified Solutions Architect', 'MongoDB Certified Developer', 'Oracle Java Certification', 'Docker Certified Associate'],
    baseSalary: 50000,
    experienceRange: [2, 10]
  },
  'Full Stack Developer': {
    skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'TypeScript', 'Docker', 'Git', 'AWS', 'PostgreSQL'],
    certifications: ['Full Stack Web Development Certification', 'AWS Certified Developer', 'MongoDB Certified Developer', 'Scrum Master Certification'],
    baseSalary: 55000,
    experienceRange: [3, 12]
  },
  'DevOps Engineer': {
    skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform', 'Ansible', 'Linux', 'Python', 'Bash', 'CI/CD'],
    certifications: ['AWS Certified DevOps Engineer', 'Kubernetes Certified Administrator', 'Docker Certified Professional', 'Terraform Associate'],
    baseSalary: 60000,
    experienceRange: [3, 10]
  },
  'Data Analyst': {
    skills: ['Python', 'SQL', 'Power BI', 'Tableau', 'Excel', 'R', 'Pandas', 'NumPy', 'Machine Learning', 'Statistics'],
    certifications: ['Microsoft Power BI Certification', 'Tableau Desktop Specialist', 'Google Analytics Certified', 'Python for Data Science'],
    baseSalary: 42000,
    experienceRange: [1, 6]
  },
  'Data Scientist': {
    skills: ['Python', 'R', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Jupyter', 'Pandas', 'Scikit-learn', 'Statistics'],
    certifications: ['AWS Certified Machine Learning', 'Google Cloud Professional Data Engineer', 'TensorFlow Developer Certificate', 'Coursera Data Science'],
    baseSalary: 65000,
    experienceRange: [2, 8]
  },
  'UX/UI Designer': {
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems', 'HTML/CSS'],
    certifications: ['Google UX Design Certificate', 'Adobe Certified Expert', 'Figma Certification', 'UX Design Institute Diploma'],
    baseSalary: 48000,
    experienceRange: [1, 7]
  },
  'QA Engineer': {
    skills: ['Selenium', 'Java', 'Python', 'TestNG', 'JUnit', 'Postman', 'JIRA', 'Test Automation', 'API Testing', 'Performance Testing'],
    certifications: ['ISTQB Foundation Level', 'Selenium WebDriver Certification', 'Agile Testing Certification', 'AWS Certified Developer'],
    baseSalary: 40000,
    experienceRange: [1, 6]
  },
  'Project Manager': {
    skills: ['Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'Risk Management', 'Budget Management', 'Stakeholder Management', 'Microsoft Project', 'Team Leadership'],
    certifications: ['PMP Certification', 'Scrum Master Certification', 'Agile Project Management', 'PRINCE2 Certification'],
    baseSalary: 58000,
    experienceRange: [4, 12]
  },
  'Business Analyst': {
    skills: ['Requirements Analysis', 'Process Modeling', 'SQL', 'Excel', 'Visio', 'JIRA', 'Stakeholder Management', 'Documentation', 'Business Process', 'Data Analysis'],
    certifications: ['CBAP Certification', 'Agile Business Analysis', 'Microsoft Excel Expert', 'Six Sigma Green Belt'],
    baseSalary: 52000,
    experienceRange: [2, 8]
  }
};

// Employment types
const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Permanent'];
const seniorityLevels = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'];

// Complete employee profiles
const completeEmployeeProfiles = async () => {
  try {
    console.log('👨‍💼 Completion des profils employés...\n');
    
    await connectDB();
    
    // Get all employees
    const employees = await User.find({ role: 'Employee' });
    
    console.log(`👥 Nombre d'employés trouvés: ${employees.length}\n`);
    
    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }
    
    let updatedCount = 0;
    
    for (const employee of employees) {
      // Assign random job title if not exists
      const jobTitles = Object.keys(jobProfiles);
      const assignedJobTitle = employee.jobTitle || jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const jobProfile = jobProfiles[assignedJobTitle] || jobProfiles['Full Stack Developer'];
      
      // Generate years of experience
      const yearsOfExperience = Math.floor(Math.random() * (jobProfile.experienceRange[1] - jobProfile.experienceRange[0] + 1)) + jobProfile.experienceRange[0];
      
      // Determine seniority level based on experience
      let seniorityLevel;
      if (yearsOfExperience <= 2) seniorityLevel = 'Junior';
      else if (yearsOfExperience <= 5) seniorityLevel = 'Mid-level';
      else if (yearsOfExperience <= 8) seniorityLevel = 'Senior';
      else if (yearsOfExperience <= 12) seniorityLevel = 'Lead';
      else seniorityLevel = 'Principal';
      
      // Select random skills (4-7 skills per person)
      const numSkills = Math.floor(Math.random() * 4) + 4; // 4-7 skills
      const selectedSkills = jobProfile.skills
        .sort(() => Math.random() - 0.5)
        .slice(0, numSkills);
      
      // Select random certifications (1-3 certifications per person)
      const numCertifications = Math.floor(Math.random() * 3) + 1; // 1-3 certifications
      const selectedCertifications = jobProfile.certifications
        .sort(() => Math.random() - 0.5)
        .slice(0, numCertifications);
      
      // Generate joining date (within last 1-10 years)
      const yearsAgo = Math.floor(Math.random() * 10) + 1; // 1-10 years ago
      const joiningDate = new Date();
      joiningDate.setFullYear(joiningDate.getFullYear() - yearsAgo);
      joiningDate.setMonth(Math.floor(Math.random() * 12));
      joiningDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      // Random employment type (mostly full-time)
      const employmentType = Math.random() < 0.85 ? 'Full-time' : 
                            Math.random() < 0.5 ? 'Part-time' : 'Contract';
      
      // Remote work allowed (60% chance)
      const remoteWorkAllowed = Math.random() < 0.6;
      
      // Phone number generation (French format)
      const phoneNumber = `+33 ${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`;
      
      // Update employee
      const updatedEmployee = await User.findByIdAndUpdate(
        employee._id,
        {
          jobTitle: assignedJobTitle,
          yearsOfExperience: yearsOfExperience,
          seniorityLevel: seniorityLevel,
          keySkills: selectedSkills,
          certifications: selectedCertifications,
          dateOfJoining: joiningDate,
          employmentType: employmentType,
          remoteWorkAllowed: remoteWorkAllowed,
          phoneNumber: employee.phoneNumber || phoneNumber,
          profileCompleted: true
        },
        { new: true }
      );
      
      console.log(`✅ ${employee.fullName}:`);
      console.log(`   💼 Job: ${assignedJobTitle} | Seniority: ${seniorityLevel} | Experience: ${yearsOfExperience} ans`);
      console.log(`   📅 Joined: ${joiningDate.toLocaleDateString('fr-FR')} | Type: ${employmentType} | Remote: ${remoteWorkAllowed ? 'Oui' : 'Non'}`);
      console.log(`   🔧 Skills: ${selectedSkills.slice(0, 3).join(', ')}${selectedSkills.length > 3 ? '...' : ''}`);
      console.log(`   🏆 Certifications: ${selectedCertifications.length} certification(s)`);
      console.log('');
      
      updatedCount++;
    }
    
    console.log(`📊 RÉSUMÉ DE LA COMPLETION:`);
    console.log(`  ✅ Employés mis à jour: ${updatedCount}/${employees.length}`);
    
    // Statistics
    const updatedEmployees = await User.find({ role: 'Employee' }, 'jobTitle seniorityLevel yearsOfExperience employmentType remoteWorkAllowed keySkills certifications');
    
    // Job distribution
    const jobDistribution = {};
    const seniorityDistribution = {};
    const employmentDistribution = {};
    let remoteCount = 0;
    let totalSkills = 0;
    let totalCertifications = 0;
    
    updatedEmployees.forEach(emp => {
      jobDistribution[emp.jobTitle] = (jobDistribution[emp.jobTitle] || 0) + 1;
      seniorityDistribution[emp.seniorityLevel] = (seniorityDistribution[emp.seniorityLevel] || 0) + 1;
      employmentDistribution[emp.employmentType] = (employmentDistribution[emp.employmentType] || 0) + 1;
      if (emp.remoteWorkAllowed) remoteCount++;
      totalSkills += emp.keySkills.length;
      totalCertifications += emp.certifications.length;
    });
    
    console.log('\n📊 DISTRIBUTION DES POSTES:');
    Object.entries(jobDistribution).forEach(([job, count]) => {
      console.log(`  💼 ${job}: ${count} employé(s)`);
    });
    
    console.log('\n📊 DISTRIBUTION SENIORITY:');
    Object.entries(seniorityDistribution).forEach(([level, count]) => {
      console.log(`  📈 ${level}: ${count} employé(s)`);
    });
    
    console.log('\n📊 DISTRIBUTION EMPLOYMENT TYPE:');
    Object.entries(employmentDistribution).forEach(([type, count]) => {
      console.log(`  📋 ${type}: ${count} employé(s)`);
    });
    
    console.log('\n📊 AUTRES STATISTIQUES:');
    console.log(`  🏠 Remote work autorisé: ${remoteCount}/${updatedEmployees.length} (${((remoteCount/updatedEmployees.length)*100).toFixed(1)}%)`);
    console.log(`  🔧 Moyenne skills par employé: ${(totalSkills/updatedEmployees.length).toFixed(1)}`);
    console.log(`  🏆 Moyenne certifications par employé: ${(totalCertifications/updatedEmployees.length).toFixed(1)}`);
    
    console.log('\n💡 Tous les profils employés sont maintenant complets et cohérents!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la completion des profils:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  completeEmployeeProfiles();
}

module.exports = { completeEmployeeProfiles };