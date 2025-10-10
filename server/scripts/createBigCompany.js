const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import des modèles
const User = require('../models/userModel');
const BusinessUnit = require('../models/BusinessUnitModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const Assignment = require('../models/AssignmentModel');
const Team = require('../models/teamModel');

// Configuration MongoDB Atlas
const mongoURI = 'mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster';

// Configuration pour une entreprise de 500+ employés
const CONFIG = {
  TOTAL_EMPLOYEES: 520,
  BU_DIRECTORS: 8,
  MANAGERS: 52,
  EMPLOYEES: 460,
  PROJECTS: 85,
  TASKS: 280,
  ASSIGNMENTS: 420
};

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas PFEDB connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB Atlas:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  console.log('🧹 Nettoyage des données existantes dans PFEDB...');
  await Promise.all([
    User.deleteMany({}),
    BusinessUnit.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Assignment.deleteMany({}),
    Team.deleteMany({})
  ]);
  console.log('✅ Données existantes supprimées de PFEDB');
}

async function insertBusinessUnits() {
  console.log('📊 Insertion des Business Units...');
  
  const businessUnits = [
    { name: 'Information Technology', code: 'IT', description: 'Technology infrastructure, software development, and digital transformation', isActive: true },
    { name: 'Marketing & Sales', code: 'MKT', description: 'Marketing campaigns, sales strategies, customer relations and business development', isActive: true },
    { name: 'Human Resources', code: 'HR', description: 'Employee relations, recruitment, training and organizational development', isActive: true },
    { name: 'Finance & Accounting', code: 'FIN', description: 'Financial planning, budgeting, accounting operations and risk management', isActive: true },
    { name: 'Operations & Logistics', code: 'OPS', description: 'Daily operations, supply chain management and logistics coordination', isActive: true },
    { name: 'Research & Development', code: 'RND', description: 'Product research, innovation, development and technology advancement', isActive: true },
    { name: 'Customer Support', code: 'CS', description: 'Customer service, technical support and client satisfaction', isActive: true },
    { name: 'Legal & Compliance', code: 'LEG', description: 'Legal affairs, regulatory compliance and corporate governance', isActive: true }
  ];

  const createdBUs = await BusinessUnit.insertMany(businessUnits);
  console.log(`✅ ${createdBUs.length} Business Units créées`);
  return createdBUs;
}

function generateName(index) {
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'James', 'Maria',
    'William', 'Jennifer', 'Richard', 'Patricia', 'Charles', 'Linda', 'Joseph', 'Barbara', 'Thomas', 'Elizabeth',
    'Christopher', 'Susan', 'Daniel', 'Jessica', 'Matthew', 'Margaret', 'Anthony', 'Dorothy', 'Mark', 'Lisa',
    'Steven', 'Nancy', 'Paul', 'Karen', 'Andrew', 'Betty', 'Kenneth', 'Helen', 'Kevin', 'Sandra',
    'Brian', 'Donna', 'George', 'Carol', 'Timothy', 'Ruth', 'Ronald', 'Sharon', 'Jason', 'Michelle',
    'Edward', 'Laura', 'Jeffrey', 'Sarah', 'Ryan', 'Kimberly', 'Jacob', 'Deborah', 'Gary', 'Dorothy',
    'Nicholas', 'Amy', 'Eric', 'Angela', 'Jonathan', 'Ashley', 'Stephen', 'Brenda', 'Larry', 'Emma',
    'Justin', 'Olivia', 'Scott', 'Cynthia', 'Brandon', 'Marie', 'Benjamin', 'Janet', 'Samuel', 'Catherine',
    'Gregory', 'Frances', 'Alexander', 'Christine', 'Patrick', 'Samantha', 'Jack', 'Debra', 'Dennis', 'Rachel',
    'Jerry', 'Carolyn', 'Tyler', 'Janet', 'Aaron', 'Virginia', 'Henry', 'Maria', 'Jose', 'Heather'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
  ];
  
  const firstIndex = index % firstNames.length;
  const lastIndex = Math.floor(index / firstNames.length) % lastNames.length;
  
  return `${firstNames[firstIndex]} ${lastNames[lastIndex]}`;
}

function generateJobTitle(role, bu, index) {
  const titles = {
    'BUDirector': {
      'IT': ['IT Director', 'Chief Technology Officer', 'VP of Technology'],
      'MKT': ['Marketing Director', 'VP of Marketing', 'Chief Marketing Officer'],
      'HR': ['HR Director', 'VP of Human Resources', 'Chief People Officer'],
      'FIN': ['Finance Director', 'CFO', 'VP of Finance'],
      'OPS': ['Operations Director', 'VP of Operations', 'Chief Operations Officer'],
      'RND': ['R&D Director', 'VP of Research', 'Chief Innovation Officer'],
      'CS': ['Customer Support Director', 'VP of Customer Success'],
      'LEG': ['Legal Director', 'General Counsel', 'VP of Legal Affairs']
    },
    'Manager': [
      'Software Development Manager', 'Project Manager', 'Team Lead', 'Senior Manager',
      'Product Manager', 'Operations Manager', 'Quality Manager', 'Technical Manager',
      'Marketing Manager', 'Sales Manager', 'Account Manager', 'Business Manager',
      'HR Manager', 'Recruitment Manager', 'Training Manager', 'Payroll Manager',
      'Financial Manager', 'Budget Manager', 'Risk Manager', 'Audit Manager',
      'Supply Chain Manager', 'Logistics Manager', 'Procurement Manager',
      'Research Manager', 'Innovation Manager', 'Development Manager',
      'Support Manager', 'Service Manager', 'Client Manager',
      'Compliance Manager', 'Contract Manager', 'Legal Manager'
    ],
    'Employee': [
      'Software Engineer', 'Senior Developer', 'Full Stack Developer', 'Frontend Developer',
      'Backend Developer', 'DevOps Engineer', 'QA Engineer', 'Data Analyst', 'System Admin',
      'Network Engineer', 'Database Administrator', 'UI/UX Designer', 'Web Designer',
      'Digital Marketing Specialist', 'Content Creator', 'SEO Specialist', 'Social Media Manager',
      'Sales Representative', 'Account Executive', 'Business Analyst', 'Market Researcher',
      'HR Specialist', 'Recruiter', 'Training Coordinator', 'Benefits Administrator',
      'Financial Analyst', 'Accountant', 'Budget Analyst', 'Tax Specialist', 'Auditor',
      'Operations Coordinator', 'Quality Analyst', 'Logistics Coordinator', 'Warehouse Supervisor',
      'Research Scientist', 'Lab Technician', 'Product Coordinator', 'Technical Writer',
      'Customer Support Rep', 'Help Desk Technician', 'Client Relations Specialist',
      'Legal Assistant', 'Compliance Officer', 'Contract Specialist', 'Paralegal'
    ]
  };
  
  if (role === 'BUDirector' && titles[role][bu]) {
    return titles[role][bu][index % titles[role][bu].length];
  } else if (titles[role]) {
    return titles[role][index % titles[role].length];
  }
  return 'Specialist';
}

function getSkillsByBU(bu) {
  const skillsMap = {
    'IT': ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'SQL', 'MongoDB', 'Git'],
    'MKT': ['Digital Marketing', 'SEO', 'Google Ads', 'Content Marketing', 'Analytics', 'Social Media', 'CRM'],
    'HR': ['Recruitment', 'Training', 'Employee Relations', 'HR Analytics', 'Performance Management'],
    'FIN': ['Financial Analysis', 'Budgeting', 'Excel', 'SAP', 'Risk Management', 'Auditing'],
    'OPS': ['Supply Chain', 'Logistics', 'Process Improvement', 'Six Sigma', 'Project Management'],
    'RND': ['Research', 'Product Development', 'Innovation', 'Technical Writing', 'Lab Management'],
    'CS': ['Customer Service', 'Technical Support', 'CRM', 'Help Desk', 'Problem Solving'],
    'LEG': ['Contract Law', 'Compliance', 'Legal Research', 'Corporate Law', 'Risk Assessment']
  };
  
  return skillsMap[bu] || skillsMap['IT'];
}

async function insertUsers(businessUnits) {
  console.log(`👥 Insertion de ${CONFIG.TOTAL_EMPLOYEES} utilisateurs...`);
  
  const users = [];
  let userIndex = 0;
  
  // BUDirectors
  for (let i = 0; i < CONFIG.BU_DIRECTORS; i++) {
    const bu = businessUnits[i % businessUnits.length];
    const name = generateName(userIndex++);
    
    users.push({
      fullName: name,
      email: `director${i + 1}@company.com`,
      password: 'password123',
      role: 'BUDirector',
      phoneNumber: `+1-555-${String(1000 + i).padStart(4, '0')}`,
      jobTitle: generateJobTitle('BUDirector', bu.code, i),
      employmentType: 'Full-time',
      dateOfJoining: new Date(2020 + Math.floor(i / 2), i % 12, 15),
      seniorityLevel: 'Senior',
      keySkills: getSkillsByBU(bu.code).slice(0, 6),
      certifications: ['Executive Leadership', 'Strategic Planning', 'MBA'],
      yearsOfExperience: 12 + (i % 8),
      businessUnit: bu._id,
      Activated: true,
      profileCompleted: true
    });
  }
  
  // Managers
  for (let i = 0; i < CONFIG.MANAGERS; i++) {
    const bu = businessUnits[i % businessUnits.length];
    const director = users.find(u => u.role === 'BUDirector' && u.businessUnit.equals(bu._id));
    const name = generateName(userIndex++);
    
    users.push({
      fullName: name,
      email: `manager${i + 1}@company.com`,
      password: 'password123',
      role: 'Manager',
      phoneNumber: `+1-555-${String(2000 + i).padStart(4, '0')}`,
      jobTitle: generateJobTitle('Manager', bu.code, i),
      employmentType: i % 10 === 0 ? 'Part-time' : 'Full-time',
      dateOfJoining: new Date(2021 + Math.floor(i / 12), i % 12, 15),
      seniorityLevel: i % 3 === 0 ? 'Senior' : 'Mid-Level',
      keySkills: getSkillsByBU(bu.code).slice(0, 5),
      certifications: ['Team Leadership', 'Project Management'],
      yearsOfExperience: 5 + (i % 10),
      businessUnit: bu._id,
      manager: director._id,
      Activated: true,
      profileCompleted: true
    });
  }
  
  // Employees
  for (let i = 0; i < CONFIG.EMPLOYEES; i++) {
    const bu = businessUnits[i % businessUnits.length];
    const managers = users.filter(u => u.role === 'Manager' && u.businessUnit.equals(bu._id));
    const manager = managers[i % managers.length];
    const name = generateName(userIndex++);
    
    users.push({
      fullName: name,
      email: `employee${i + 1}@company.com`,
      password: 'password123',
      role: 'Employee',
      phoneNumber: `+1-555-${String(3000 + i).padStart(4, '0')}`,
      jobTitle: generateJobTitle('Employee', bu.code, i),
      employmentType: ['Full-time', 'Part-time', 'Contract'][i % 3],
      dateOfJoining: new Date(2022 + Math.floor(i / 100), (i % 12), 15),
      seniorityLevel: ['Junior', 'Mid-Level', 'Senior'][i % 3],
      keySkills: getSkillsByBU(bu.code).slice(0, 4),
      certifications: ['Professional Certification'],
      yearsOfExperience: 1 + (i % 10),
      businessUnit: bu._id,
      manager: manager._id,
      Activated: i % 20 !== 0, // 95% activated
      profileCompleted: i % 10 !== 0 // 90% completed
    });
  }

  // Hash passwords in batches
  console.log('🔐 Hachage des mots de passe...');
  const salt = await bcrypt.genSalt(10);
  
  for (let user of users) {
    user.password = await bcrypt.hash(user.password, salt);
  }

  // Insert in batches
  console.log('💾 Insertion des utilisateurs par batches...');
  const batchSize = 100;
  const createdUsers = [];
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const batchResult = await User.insertMany(batch);
    createdUsers.push(...batchResult);
    console.log(`   Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)} - ${batchResult.length} utilisateurs insérés`);
  }

  console.log(`✅ ${createdUsers.length} utilisateurs créés au total`);
  return createdUsers;
}

function generateProjectName(index) {
  const prefixes = ['Enterprise', 'Advanced', 'Next-Gen', 'Smart', 'Digital', 'Cloud', 'AI-Powered', 'Mobile', 'Web-Based', 'Integrated'];
  const subjects = ['CRM System', 'ERP Solution', 'Analytics Platform', 'Mobile App', 'Website', 'API Gateway', 'Database', 'Security System', 'Dashboard', 'Portal'];
  const suffixes = ['Upgrade', 'Redesign', 'Migration', 'Enhancement', 'Development', 'Implementation', 'Optimization', 'Integration', 'Modernization', 'Transformation'];
  
  const prefixIndex = index % prefixes.length;
  const subjectIndex = Math.floor(index / prefixes.length) % subjects.length;
  const suffixIndex = Math.floor(index / (prefixes.length * subjects.length)) % suffixes.length;
  
  return `${prefixes[prefixIndex]} ${subjects[subjectIndex]} ${suffixes[suffixIndex]}`;
}

async function insertProjects(users) {
  console.log(`🏗️ Insertion de ${CONFIG.PROJECTS} projets...`);
  
  const projects = [];
  const managers = users.filter(u => u.role === 'Manager' || u.role === 'BUDirector');
  const categories = ['Web Development', 'Mobile App', 'Software', 'Database', 'Design'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const types = ['internal', 'external'];
  
  for (let i = 0; i < CONFIG.PROJECTS; i++) {
    const owner = managers[i % managers.length];
    const isExternal = i % 3 === 0; // 33% externe
    
    const startDate = new Date(2024, i % 12, 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3 + (i % 9)); // 3-12 mois
    
    const deliveryDate = new Date(endDate);
    deliveryDate.setDate(deliveryDate.getDate() + 15);
    
    projects.push({
      owner: owner._id,
      projectName: generateProjectName(i),
      description: `Strategic project ${i + 1} for business optimization and digital transformation initiatives`,
      client: isExternal ? `External Client ${Math.floor(i/3) + 1}` : `Internal - ${['IT', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'][i % 6]} Department`,
      projectType: isExternal ? 'external' : 'internal',
      projectCategory: categories[i % categories.length],
      projectPriority: priorities[i % priorities.length],
      budget: 15000 + (i * 5000) + (i % 10) * 10000, // 15k to 500k
      additionalFunding: (i % 5) * 5000,
      startDate: startDate,
      endDate: endDate,
      deliveryDate: deliveryDate
    });
  }

  const createdProjects = await Project.insertMany(projects);
  console.log(`✅ ${createdProjects.length} projets créés`);
  return createdProjects;
}

function generateTaskName(index) {
  const actions = ['Develop', 'Implement', 'Design', 'Test', 'Deploy', 'Configure', 'Analyze', 'Create', 'Optimize', 'Integrate'];
  const objects = ['User Interface', 'API Endpoints', 'Database Schema', 'Security Layer', 'Payment System', 'Reporting Module', 'Authentication', 'Dashboard', 'Mobile Interface', 'Data Pipeline'];
  
  const actionIndex = index % actions.length;
  const objectIndex = Math.floor(index / actions.length) % objects.length;
  
  return `${actions[actionIndex]} ${objects[objectIndex]}`;
}

async function insertTasks(projects, users) {
  console.log(`📋 Insertion de ${CONFIG.TASKS} tâches...`);
  
  const tasks = [];
  const managers = users.filter(u => u.role === 'Manager' || u.role === 'BUDirector');
  const phases = ['Planning', 'Design', 'Development', 'Testing'];
  const allSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'SQL', 'MongoDB',
    'Digital Marketing', 'SEO', 'Analytics', 'Design', 'Project Management', 'Testing',
    'System Administration', 'Network Security', 'Data Analysis', 'UI/UX', 'API Development'
  ];
  
  for (let i = 0; i < CONFIG.TASKS; i++) {
    const project = projects[i % projects.length];
    const owner = managers[i % managers.length];
    
    const startDate = new Date(project.startDate);
    startDate.setDate(startDate.getDate() + (i % 30)); // Stagger task starts
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14 + (i % 60)); // 2 weeks to 2 months
    
    const skills = [];
    for (let j = 0; j < 3 + (i % 4); j++) {
      skills.push(allSkills[(i + j) % allSkills.length]);
    }
    
    tasks.push({
      owner: owner._id,
      taskName: generateTaskName(i),
      description: `Task ${i + 1}: Implementation and delivery of specific project requirements with quality standards`,
      project: project._id,
      projectPhase: phases[i % phases.length],
      RequiredyearsOfExper: 1 + (i % 7),
      startDate: startDate,
      endDate: endDate,
      requiredSkills: skills,
      languagesSpoken: ['English'],
      requiredCertifications: i % 3 === 0 ? ['Professional Certification'] : [],
      budget: 5000 + (i * 100) + (i % 20) * 1000,
      workload: 40 + (i % 60) // 40-100%
    });
  }

  // Insert in batches
  const batchSize = 50;
  const createdTasks = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResult = await Task.insertMany(batch);
    createdTasks.push(...batchResult);
    console.log(`   Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tasks.length/batchSize)} - ${batchResult.length} tâches insérées`);
  }

  console.log(`✅ ${createdTasks.length} tâches créées au total`);
  return createdTasks;
}

async function insertAssignments(users, projects, tasks) {
  console.log(`📝 Insertion de ${CONFIG.ASSIGNMENTS} assignments...`);
  
  const assignments = [];
  const managers = users.filter(u => u.role === 'Manager' || u.role === 'BUDirector');
  const employees = users.filter(u => u.role === 'Employee' || u.role === 'Manager');
  const statuses = ['draft', 'assigned', 'in-progress', 'completed', 'cancelled'];
  const types = ['enduring - long period', 'short-term', 'temporary', 'full-time'];
  
  for (let i = 0; i < CONFIG.ASSIGNMENTS; i++) {
    const task = tasks[i % tasks.length];
    const project = projects.find(p => p._id.equals(task.project));
    const owner = managers[i % managers.length];
    const employee = employees[i % employees.length];
    
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    assignments.push({
      Owner: owner._id,
      employee: employee._id,
      project: project._id,
      taskId: task._id,
      startDate: startDate,
      endDate: endDate,
      assignmentType: types[i % types.length],
      totalDays: Math.max(1, totalDays),
      status: statuses[i % statuses.length],
      skillMatchScore: 0.5 + (i % 50) / 100, // 0.5 to 0.99
      recommendations: `Assignment ${i + 1} recommendation based on skill match and availability analysis`
    });
  }

  // Insert in batches
  const batchSize = 50;
  const createdAssignments = [];
  
  for (let i = 0; i < assignments.length; i += batchSize) {
    const batch = assignments.slice(i, i + batchSize);
    const batchResult = await Assignment.insertMany(batch);
    createdAssignments.push(...batchResult);
    console.log(`   Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(assignments.length/batchSize)} - ${batchResult.length} assignments insérés`);
  }

  console.log(`✅ ${createdAssignments.length} assignments créés au total`);
  return createdAssignments;
}

async function main() {
  try {
    console.log('🚀 CRÉATION D\'UNE ENTREPRISE DE 520 EMPLOYÉS\n');
    console.log(`📊 Configuration:
    • ${CONFIG.TOTAL_EMPLOYEES} employés total
    • ${CONFIG.BU_DIRECTORS} BUDirectors  
    • ${CONFIG.MANAGERS} Managers
    • ${CONFIG.EMPLOYEES} Employees
    • ${CONFIG.PROJECTS} Projets
    • ${CONFIG.TASKS} Tâches
    • ${CONFIG.ASSIGNMENTS} Assignments\n`);
    
    const startTime = Date.now();
    
    await connectDB();
    await clearExistingData();
    
    console.log('🏗️ Phase 1: Business Units');
    const businessUnits = await insertBusinessUnits();
    
    console.log('👥 Phase 2: Utilisateurs');
    const users = await insertUsers(businessUnits);
    
    console.log('🎯 Phase 3: Projets');
    const projects = await insertProjects(users);
    
    console.log('📋 Phase 4: Tâches');
    const tasks = await insertTasks(projects, users);
    
    console.log('📝 Phase 5: Assignments');
    const assignments = await insertAssignments(users, projects, tasks);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`\n🎉 ENTREPRISE DE ${CONFIG.TOTAL_EMPLOYEES} EMPLOYÉS CRÉÉE ! ⏱️  ${duration}s`);
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log(`   🏢 Business Units: ${businessUnits.length}`);
    console.log(`   👥 Utilisateurs: ${users.length}`);
    console.log(`   🏗️ Projets: ${projects.length}`);
    console.log(`   📋 Tâches: ${tasks.length}`);
    console.log(`   📝 Assignments: ${assignments.length}`);
    
    // Statistiques par BU
    console.log('\n📈 RÉPARTITION PAR BUSINESS UNIT:');
    for (const bu of businessUnits) {
      const buUsers = users.filter(u => u.businessUnit.equals(bu._id));
      console.log(`   ${bu.name}: ${buUsers.length} employés`);
    }
    
    console.log('\n🔑 COMPTES DE TEST:');
    console.log('   BUDirectors:');
    for (let i = 1; i <= 5; i++) {
      console.log(`   • director${i}@company.com`);
    }
    console.log('   Mot de passe: password123');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Connexion fermée');
  }
}

main();