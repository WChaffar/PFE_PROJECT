const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

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
  MANAGERS: 45,
  EMPLOYEES: 467,
  PROJECTS: 85,
  TASKS: 300,
  ASSIGNMENTS: 450,
  TEAM_MEMBERS: 50
};

// Listes de données réalistes pour une grande entreprise
const BUSINESS_UNITS = [
  { name: 'Information Technology', code: 'IT', description: 'Technology infrastructure, software development, and digital transformation' },
  { name: 'Marketing & Sales', code: 'MKT', description: 'Marketing campaigns, sales strategies, customer relations and business development' },
  { name: 'Human Resources', code: 'HR', description: 'Employee relations, recruitment, training and organizational development' },
  { name: 'Finance & Accounting', code: 'FIN', description: 'Financial planning, budgeting, accounting operations and risk management' },
  { name: 'Operations & Logistics', code: 'OPS', description: 'Daily operations, supply chain management and logistics coordination' },
  { name: 'Research & Development', code: 'RND', description: 'Product research, innovation, development and technology advancement' },
  { name: 'Customer Support', code: 'CS', description: 'Customer service, technical support and client satisfaction' },
  { name: 'Legal & Compliance', code: 'LEG', description: 'Legal affairs, regulatory compliance and corporate governance' }
];

const JOB_TITLES = {
  'BUDirector': [
    'IT Director', 'Marketing Director', 'HR Director', 'Finance Director',
    'Operations Director', 'R&D Director', 'Customer Support Director', 'Legal Director'
  ],
  'Manager': [
    'Software Development Manager', 'DevOps Manager', 'Data Analytics Manager', 'Cybersecurity Manager',
    'Digital Marketing Manager', 'Sales Manager', 'Product Marketing Manager', 'Brand Manager',
    'Recruitment Manager', 'Training Manager', 'Employee Relations Manager', 'Payroll Manager',
    'Financial Planning Manager', 'Treasury Manager', 'Risk Management Manager', 'Audit Manager',
    'Supply Chain Manager', 'Quality Manager', 'Production Manager', 'Procurement Manager',
    'Research Manager', 'Product Development Manager', 'Innovation Manager', 'Technical Manager',
    'Customer Success Manager', 'Technical Support Manager', 'Call Center Manager', 'Client Relations Manager',
    'Corporate Legal Manager', 'Compliance Manager', 'Contract Manager', 'Regulatory Affairs Manager'
  ],
  'Employee': [
    'Senior Software Engineer', 'Software Engineer', 'Junior Software Engineer', 'Frontend Developer',
    'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Data Analyst',
    'QA Engineer', 'System Administrator', 'Network Engineer', 'Cybersecurity Analyst', 'Database Administrator',
    'UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Web Designer',
    'Digital Marketing Specialist', 'Content Marketing Specialist', 'SEO Specialist', 'Social Media Manager',
    'Sales Representative', 'Account Manager', 'Business Development Representative', 'Sales Coordinator',
    'Market Research Analyst', 'Marketing Coordinator', 'Campaign Manager', 'Event Manager',
    'HR Specialist', 'Recruiter', 'Training Specialist', 'Compensation Analyst', 'HR Coordinator',
    'Employee Relations Specialist', 'Benefits Administrator', 'Talent Acquisition Specialist',
    'Financial Analyst', 'Accountant', 'Senior Accountant', 'Budget Analyst', 'Treasury Analyst',
    'Risk Analyst', 'Audit Specialist', 'Tax Specialist', 'Accounts Payable Specialist',
    'Operations Coordinator', 'Supply Chain Analyst', 'Logistics Coordinator', 'Quality Analyst',
    'Production Supervisor', 'Procurement Specialist', 'Inventory Analyst', 'Warehouse Supervisor',
    'Research Scientist', 'Product Manager', 'Technical Writer', 'R&D Engineer', 'Innovation Specialist',
    'Lab Technician', 'Research Associate', 'Product Coordinator',
    'Customer Support Representative', 'Technical Support Specialist', 'Customer Success Specialist',
    'Call Center Agent', 'Help Desk Technician', 'Client Relations Coordinator',
    'Legal Assistant', 'Compliance Officer', 'Contract Specialist', 'Paralegal', 'Legal Coordinator'
  ]
};

const SKILLS_BY_DEPARTMENT = {
  IT: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js', 'PHP', 'C#', '.NET', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'Linux', 'Windows Server', 'Cybersecurity', 'Network Security', 'Data Analysis', 'Machine Learning', 'AI', 'DevOps', 'CI/CD', 'Agile', 'Scrum'],
  MKT: ['Digital Marketing', 'SEO/SEM', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Marketing Analytics', 'Brand Management', 'Market Research', 'Sales Strategy', 'CRM', 'Lead Generation', 'Conversion Optimization', 'A/B Testing', 'Graphic Design', 'Video Production', 'Copywriting', 'Event Management', 'PR'],
  HR: ['Talent Acquisition', 'Recruitment', 'Employee Relations', 'Performance Management', 'Training & Development', 'Compensation & Benefits', 'HR Analytics', 'HRIS', 'Organizational Development', 'Change Management', 'Employment Law', 'Diversity & Inclusion', 'Employee Engagement', 'Succession Planning', 'Payroll Management'],
  FIN: ['Financial Analysis', 'Budgeting & Forecasting', 'Financial Reporting', 'GAAP', 'IFRS', 'Tax Planning', 'Audit', 'Risk Management', 'Treasury Management', 'Investment Analysis', 'Cost Accounting', 'Management Accounting', 'Financial Modeling', 'Excel', 'SAP', 'Oracle', 'QuickBooks', 'Financial Planning'],
  OPS: ['Supply Chain Management', 'Logistics', 'Operations Management', 'Process Improvement', 'Six Sigma', 'Lean Manufacturing', 'Quality Management', 'Inventory Management', 'Procurement', 'Vendor Management', 'Production Planning', 'Warehouse Management', 'ERP Systems', 'Project Management'],
  RND: ['Research & Development', 'Product Development', 'Innovation Management', 'Technical Writing', 'Lab Management', 'Patent Research', 'Prototyping', 'Product Testing', 'Market Analysis', 'Technology Assessment', 'Scientific Research', 'Engineering Design', 'Product Lifecycle Management'],
  CS: ['Customer Service', 'Technical Support', 'Help Desk', 'CRM Systems', 'Ticket Management', 'Call Center Operations', 'Customer Success', 'Problem Solving', 'Communication', 'Conflict Resolution', 'Product Knowledge', 'Remote Support', 'Customer Retention'],
  LEG: ['Contract Law', 'Corporate Law', 'Employment Law', 'Intellectual Property', 'Regulatory Compliance', 'Risk Assessment', 'Legal Research', 'Contract Negotiation', 'Litigation Management', 'Corporate Governance', 'Data Privacy', 'GDPR', 'Legal Writing', 'Due Diligence']
};

const PROJECT_CATEGORIES = ['Web Development', 'Mobile App', 'Software', 'Database', 'Design', 'Infrastructure', 'Analytics', 'Security', 'Integration'];
const PROJECT_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const PROJECT_TYPES = ['internal', 'external'];
const PROJECT_PHASES = ['Planning', 'Design', 'Development', 'Testing'];
const ASSIGNMENT_STATUSES = ['draft', 'assigned', 'in-progress', 'completed', 'cancelled'];
const ASSIGNMENT_TYPES = ['enduring - long period', 'short-term', 'temporary', 'full-time'];

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
  
  const businessUnits = BUSINESS_UNITS.map(bu => ({
    ...bu,
    isActive: true,
    createdAt: faker.date.past({ years: 5 })
  }));

  const createdBUs = await BusinessUnit.insertMany(businessUnits);
  console.log(`✅ ${createdBUs.length} Business Units créées`);
  return createdBUs;
}

function generatePhoneNumber() {
  return `+1-555-${faker.string.numeric(4)}`;
}

function getRandomSkills(department, count = 5) {
  const skills = SKILLS_BY_DEPARTMENT[department] || SKILLS_BY_DEPARTMENT.IT;
  return faker.helpers.arrayElements(skills, count);
}

function getCertifications(jobTitle, skills) {
  const certMap = {
    'Software': ['AWS Certified Developer', 'Microsoft Azure Developer', 'Google Cloud Professional', 'Certified Scrum Master'],
    'Marketing': ['Google Ads Certified', 'HubSpot Marketing', 'Facebook Blueprint', 'Google Analytics Certified'],
    'HR': ['SHRM-CP', 'PHR', 'Certified Talent Acquisition Professional', 'HRIS Certified'],
    'Finance': ['CPA', 'CFA', 'Financial Risk Manager', 'Certified Management Accountant'],
    'Operations': ['Six Sigma Black Belt', 'PMP', 'Lean Manufacturing', 'Supply Chain Management'],
    'Research': ['Project Management Professional', 'Certified Research Administrator', 'Technical Writing Certified'],
    'Support': ['ITIL Foundation', 'Customer Success Manager', 'Help Desk Institute Certified'],
    'Legal': ['Bar Certification', 'Paralegal Certified', 'Compliance Professional', 'Contract Management']
  };
  
  for (const [key, certs] of Object.entries(certMap)) {
    if (jobTitle.toLowerCase().includes(key.toLowerCase())) {
      return faker.helpers.arrayElements(certs, { min: 1, max: 3 });
    }
  }
  
  return faker.helpers.arrayElements(certMap.Software, { min: 1, max: 2 });
}

async function insertUsers(businessUnits) {
  console.log(`👥 Insertion de ${CONFIG.TOTAL_EMPLOYEES} utilisateurs...`);
  
  const users = [];
  let emailCounter = 1000; // Pour assurer des emails uniques
  
  // BUDirectors
  for (let i = 0; i < CONFIG.BU_DIRECTORS; i++) {
    const bu = businessUnits[i % businessUnits.length];
    const jobTitle = JOB_TITLES['BUDirector'][i % JOB_TITLES['BUDirector'].length];
    const skills = getRandomSkills(bu.code, 6);
    
    users.push({
      fullName: faker.person.fullName(),
      email: `director${emailCounter++}@company.com`,
      password: 'password123',
      role: 'BUDirector',
      phoneNumber: generatePhoneNumber(),
      jobTitle: jobTitle,
      employmentType: 'Full-time',
      dateOfJoining: faker.date.past({ years: 8 }),
      seniorityLevel: 'Senior',
      keySkills: skills,
      certifications: getCertifications(jobTitle, skills),
      yearsOfExperience: faker.number.int({ min: 10, max: 20 }),
      businessUnit: bu._id,
      Activated: true,
      profileCompleted: true
    });
  }
  
  // Managers
  for (let i = 0; i < CONFIG.MANAGERS; i++) {
    const bu = businessUnits[i % businessUnits.length];
    const director = users.find(u => u.role === 'BUDirector' && u.businessUnit.equals(bu._id));
    const jobTitle = faker.helpers.arrayElement(JOB_TITLES['Manager']);
    const skills = getRandomSkills(bu.code, 5);
    
    users.push({
      fullName: faker.person.fullName(),
      email: `manager${emailCounter++}@company.com`,
      password: 'password123',
      role: 'Manager',
      phoneNumber: generatePhoneNumber(),
      jobTitle: jobTitle,
      employmentType: faker.helpers.arrayElement(['Full-time', 'Part-time']),
      dateOfJoining: faker.date.past({ years: 5 }),
      seniorityLevel: faker.helpers.arrayElement(['Mid-Level', 'Senior']),
      keySkills: skills,
      certifications: getCertifications(jobTitle, skills),
      yearsOfExperience: faker.number.int({ min: 5, max: 15 }),
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
    const manager = faker.helpers.arrayElement(managers);
    const jobTitle = faker.helpers.arrayElement(JOB_TITLES['Employee']);
    const skills = getRandomSkills(bu.code, 4);
    
    users.push({
      fullName: faker.person.fullName(),
      email: `employee${emailCounter++}@company.com`,
      password: 'password123',
      role: 'Employee',
      phoneNumber: generatePhoneNumber(),
      jobTitle: jobTitle,
      employmentType: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract']),
      dateOfJoining: faker.date.past({ years: 3 }),
      seniorityLevel: faker.helpers.arrayElement(['Junior', 'Mid-Level', 'Senior']),
      keySkills: skills,
      certifications: getCertifications(jobTitle, skills),
      yearsOfExperience: faker.number.int({ min: 1, max: 12 }),
      businessUnit: bu._id,
      manager: manager._id,
      Activated: faker.datatype.boolean(0.95), // 95% activated
      profileCompleted: faker.datatype.boolean(0.85) // 85% completed profiles
    });
  }

  // Hash passwords
  console.log('🔐 Hachage des mots de passe...');
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  
  for (let user of users) {
    user.password = await bcrypt.hash(user.password, salt);
  }

  // Insert en batches pour éviter les timeouts
  console.log('💾 Insertion des utilisateurs par batches...');
  const batchSize = 50;
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

function generateProjectName() {
  const prefixes = ['Enterprise', 'Advanced', 'Next-Gen', 'Smart', 'Digital', 'Cloud', 'AI-Powered', 'Mobile', 'Web-Based', 'Integrated'];
  const subjects = ['CRM System', 'ERP Solution', 'Analytics Platform', 'Mobile App', 'Website', 'API Gateway', 'Database', 'Security System', 'Monitoring Tool', 'Dashboard'];
  const suffixes = ['Upgrade', 'Redesign', 'Migration', 'Enhancement', 'Development', 'Implementation', 'Optimization', 'Integration', 'Modernization', 'Transformation'];
  
  return `${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(subjects)} ${faker.helpers.arrayElement(suffixes)}`;
}

async function insertProjects(users) {
  console.log(`🏗️ Insertion de ${CONFIG.PROJECTS} projets...`);
  
  const projects = [];
  const managers = users.filter(u => u.role === 'Manager' || u.role === 'BUDirector');
  
  for (let i = 0; i < CONFIG.PROJECTS; i++) {
    const owner = faker.helpers.arrayElement(managers);
    const isExternal = faker.datatype.boolean(0.3); // 30% externe
    
    projects.push({
      owner: owner._id,
      projectName: generateProjectName(),
      description: faker.lorem.sentences(2),
      client: isExternal ? faker.company.name() : `Internal - ${faker.helpers.arrayElement(['IT', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'])} Department`,
      projectType: isExternal ? 'external' : 'internal',
      projectCategory: faker.helpers.arrayElement(PROJECT_CATEGORIES),
      projectPriority: faker.helpers.arrayElement(PROJECT_PRIORITIES),
      budget: faker.number.int({ min: 10000, max: 500000 }),
      additionalFunding: faker.number.int({ min: 0, max: 50000 }),
      startDate: faker.date.past({ years: 1 }),
      endDate: faker.date.future({ years: 1 }),
      deliveryDate: faker.date.future({ years: 1 })
    });
  }

  const createdProjects = await Project.insertMany(projects);
  console.log(`✅ ${createdProjects.length} projets créés`);
  return createdProjects;
}

function generateTaskName() {
  const actions = ['Develop', 'Implement', 'Design', 'Test', 'Deploy', 'Configure', 'Analyze', 'Create', 'Optimize', 'Integrate'];
  const objects = ['User Interface', 'API Endpoints', 'Database Schema', 'Security Layer', 'Payment System', 'Reporting Module', 'Authentication', 'Dashboard', 'Mobile Interface', 'Data Pipeline'];
  
  return `${faker.helpers.arrayElement(actions)} ${faker.helpers.arrayElement(objects)}`;
}

async function insertTasks(projects, users) {
  console.log(`📋 Insertion de ${CONFIG.TASKS} tâches...`);
  
  const tasks = [];
  const managers = users.filter(u => u.role === 'Manager' || u.role === 'BUDirector');
  
  for (let i = 0; i < CONFIG.TASKS; i++) {
    const project = faker.helpers.arrayElement(projects);
    const owner = faker.helpers.arrayElement(managers);
    const skills = faker.helpers.arrayElements(
      Object.values(SKILLS_BY_DEPARTMENT).flat(), 
      { min: 3, max: 6 }
    );
    
    tasks.push({
      owner: owner._id,
      taskName: generateTaskName(),
      description: faker.lorem.sentences(2),
      project: project._id,
      projectPhase: faker.helpers.arrayElement(PROJECT_PHASES),
      RequiredyearsOfExper: faker.number.int({ min: 1, max: 8 }),
      startDate: faker.date.past({ years: 0.5 }),
      endDate: faker.date.future({ years: 0.5 }),
      requiredSkills: skills,
      languagesSpoken: ['English'],
      requiredCertifications: faker.helpers.arrayElements(['PMP', 'Scrum Master', 'AWS Certified'], { min: 0, max: 2 }),
      budget: faker.number.int({ min: 5000, max: 100000 }),
      workload: faker.number.int({ min: 30, max: 100 })
    });
  }

  const createdTasks = await Task.insertMany(tasks);
  console.log(`✅ ${createdTasks.length} tâches créées`);
  return createdTasks;
}

async function insertAssignments(users, projects, tasks) {
  console.log(`📝 Insertion de ${CONFIG.ASSIGNMENTS} assignments...`);
  
  const assignments = [];
  const managers = users.filter(u => u.role === 'Manager' || u.role === 'BUDirector');
  const employees = users.filter(u => u.role === 'Employee' || u.role === 'Manager');
  
  for (let i = 0; i < CONFIG.ASSIGNMENTS; i++) {
    const task = faker.helpers.arrayElement(tasks);
    const project = projects.find(p => p._id.equals(task.project));
    const owner = faker.helpers.arrayElement(managers);
    const employee = faker.helpers.arrayElement(employees);
    
    const startDate = faker.date.past({ years: 1 });
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + faker.number.int({ min: 7, max: 180 }));
    
    assignments.push({
      Owner: owner._id,
      employee: employee._id,
      project: project._id,
      taskId: task._id,
      startDate: startDate,
      endDate: endDate,
      assignmentType: faker.helpers.arrayElement(ASSIGNMENT_TYPES),
      totalDays: faker.number.int({ min: 1, max: 180 }),
      status: faker.helpers.arrayElement(ASSIGNMENT_STATUSES),
      skillMatchScore: faker.number.float({ min: 0.5, max: 1.0, fractionDigits: 2 }),
      recommendations: faker.lorem.sentence()
    });
  }

  // Insert en batches
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

async function insertTeamMembers(users) {
  console.log(`👫 Insertion de ${CONFIG.TEAM_MEMBERS} membres d'équipe...`);
  
  const teamMembers = [];
  const managers = users.filter(u => u.role === 'Manager');
  
  for (let i = 0; i < CONFIG.TEAM_MEMBERS; i++) {
    const manager = faker.helpers.arrayElement(managers);
    const skills = faker.helpers.arrayElements(
      Object.values(SKILLS_BY_DEPARTMENT).flat(), 
      { min: 3, max: 5 }
    );
    
    teamMembers.push({
      manager: manager._id,
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      phoneNumber: generatePhoneNumber(),
      jobTitle: faker.helpers.arrayElement(JOB_TITLES.Employee),
      employmentType: faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract']),
      dateOfJoining: faker.date.past({ years: 2 }),
      seniorityLevel: faker.helpers.arrayElement(['Junior', 'Mid-Level', 'Senior']),
      keySkills: skills,
      certifications: faker.helpers.arrayElements(['Industry Certified', 'Professional Certified'], { min: 0, max: 2 }),
      yearsOfExperience: faker.number.int({ min: 1, max: 8 })
    });
  }

  const createdTeam = await Team.insertMany(teamMembers);
  console.log(`✅ ${createdTeam.length} membres d'équipe créés`);
  return createdTeam;
}

async function updateUserAssignments(users, assignments) {
  console.log('🔄 Mise à jour des assignments utilisateurs...');
  
  const updates = {};
  assignments.forEach(assignment => {
    if (!updates[assignment.employee.toString()]) {
      updates[assignment.employee.toString()] = [];
    }
    updates[assignment.employee.toString()].push(assignment._id);
  });
  
  const updatePromises = Object.entries(updates).map(([userId, assignmentIds]) =>
    User.findByIdAndUpdate(userId, { $set: { assignments: assignmentIds } })
  );
  
  await Promise.all(updatePromises);
  console.log('✅ Assignments utilisateurs mis à jour');
}

async function main() {
  try {
    console.log('🚀 CRÉATION D\'UNE ENTREPRISE DE 500+ EMPLOYÉS\n');
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
    
    console.log('\n🏗️ Phase 1: Structures organisationnelles');
    const businessUnits = await insertBusinessUnits();
    
    console.log('\n👥 Phase 2: Ressources humaines');
    const users = await insertUsers(businessUnits);
    
    console.log('\n🎯 Phase 3: Projets et portfolio');
    const projects = await insertProjects(users);
    
    console.log('\n📋 Phase 4: Tâches et planification');
    const tasks = await insertTasks(projects, users);
    
    console.log('\n📝 Phase 5: Assignments et allocation');
    const assignments = await insertAssignments(users, projects, tasks);
    
    console.log('\n👫 Phase 6: Équipes supplémentaires');
    const teamMembers = await insertTeamMembers(users);
    
    console.log('\n🔄 Phase 7: Relations et mises à jour');
    await updateUserAssignments(users, assignments);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`\n🎉 ENTREPRISE DE ${CONFIG.TOTAL_EMPLOYEES} EMPLOYÉS CRÉÉE AVEC SUCCÈS ! ⏱️  ${duration}s`);
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log(`   🏢 Business Units: ${businessUnits.length}`);
    console.log(`   👥 Utilisateurs: ${users.length}`);
    console.log(`   🏗️ Projets: ${projects.length}`);
    console.log(`   📋 Tâches: ${tasks.length}`);
    console.log(`   📝 Assignments: ${assignments.length}`);
    console.log(`   👫 Membres d'équipe: ${teamMembers.length}`);
    
    // Statistiques par BU
    console.log('\n📈 RÉPARTITION PAR BUSINESS UNIT:');
    for (const bu of businessUnits) {
      const buUsers = users.filter(u => u.businessUnit.equals(bu._id));
      const directors = buUsers.filter(u => u.role === 'BUDirector').length;
      const managers = buUsers.filter(u => u.role === 'Manager').length;
      const employees = buUsers.filter(u => u.role === 'Employee').length;
      
      console.log(`   ${bu.name} (${bu.code}): ${buUsers.length} employés`);
      console.log(`     - ${directors} Director, ${managers} Managers, ${employees} Employees`);
    }
    
    console.log('\n🔑 COMPTES DE TEST BUDIRECTORS:');
    const buDirectors = users.filter(u => u.role === 'BUDirector').slice(0, 5);
    buDirectors.forEach(director => {
      console.log(`   • ${director.email} (${director.jobTitle})`);
    });
    console.log('   Mot de passe: password123');
    
    console.log('\n🎯 DONNÉES PRÊTES POUR DASHBOARD BUDIRECTOR !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'entreprise:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Connexion fermée');
  }
}

main();