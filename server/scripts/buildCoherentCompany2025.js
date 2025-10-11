const mongoose = require('mongoose');

// Import models
const User = require('../models/userModel');
const Team = require('../models/teamModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const Assignment = require('../models/AssignmentModel');
const BusinessUnit = require('../models/BusinessUnitModel');

// Database connection - using same connection string as other scripts
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Helper functions
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomDateIn2025 = () => {
  const start = new Date('2025-01-01');
  const end = new Date('2025-12-31');
  return getRandomDate(start, end);
};

// Clear existing data
const clearDatabase = async () => {
  console.log('🗑️ Suppression des données existantes...');
  await Assignment.deleteMany({});
  await Task.deleteMany({});
  await Project.deleteMany({});
  await Team.deleteMany({});
  await User.deleteMany({});
  await BusinessUnit.deleteMany({});
  console.log('✅ Base de données nettoyée');
};

// Company structure configuration
const COMPANY_STRUCTURE = {
  businessUnits: [
    {
      name: 'Digital Solutions BU',
      description: 'Développement d\'applications et solutions digitales',
      managers: ['Manager_Dev_1', 'Manager_QA_1'],
      projects: ['Plateforme E-commerce', 'Application Mobile Banking', 'Système CRM']
    },
    {
      name: 'Infrastructure & Cloud BU',
      description: 'Infrastructure IT et services cloud',
      managers: ['Manager_Infra_1', 'Manager_Cloud_1'],
      projects: ['Migration Cloud AWS', 'Système de Monitoring', 'Backup & Recovery']
    },
    {
      name: 'Data & Analytics BU',
      description: 'Business Intelligence et analyse de données',
      managers: ['Manager_BI_1'],
      projects: ['Data Warehouse', 'Tableaux de Bord BI', 'Machine Learning Platform']
    }
  ],
  hrDepartment: {
    name: 'Human Resources',
    description: 'Gestion des ressources humaines',
    staff: ['HR_Director', 'HR_Recruiter', 'HR_Admin']
  }
};

// Create Business Units
const createBusinessUnits = async () => {
  console.log('🏢 Création des Business Units...');
  const businessUnits = [];

  for (let i = 0; i < COMPANY_STRUCTURE.businessUnits.length; i++) {
    const buConfig = COMPANY_STRUCTURE.businessUnits[i];
    const bu = new BusinessUnit({
      name: buConfig.name,
      code: `BU${(i + 1).toString().padStart(2, '0')}`, // BU01, BU02, BU03
      description: buConfig.description,
      createdAt: new Date()
    });
    await bu.save();
    businessUnits.push({ ...buConfig, _id: bu._id });
    console.log(`  ✅ BU créée: ${buConfig.name} (Code: ${bu.code})`);
  }

  return businessUnits;
};

// Create Users with proper hierarchy
const createUsers = async (businessUnits) => {
  console.log('👥 Création des utilisateurs...');
  const users = [];
  const hashedPassword = await hashPassword('password123');

  // 1. Create BU Directors
  const buDirectors = [];
  for (let i = 0; i < businessUnits.length; i++) {
    const bu = businessUnits[i];
    const director = new User({
      fullName: `Director ${bu.name.split(' ')[0]} BU`,
      email: `director.${bu.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      password: hashedPassword,
      role: 'BUDirector',
      phone: `+33 1 ${40 + i}0 00 00 0${i + 1}`,
      businessUnit: bu._id
    });
    await director.save();
    buDirectors.push(director);
    users.push(director);
    console.log(`  ✅ Directeur BU créé: ${director.fullName}`);
  }

  // 2. Create HR Staff
  const hrStaff = [];
  for (let i = 0; i < COMPANY_STRUCTURE.hrDepartment.staff.length; i++) {
    const role = COMPANY_STRUCTURE.hrDepartment.staff[i];
    const hrPerson = new User({
      fullName: role.replace('_', ' '),
      email: `${role.toLowerCase()}@company.com`,
      password: hashedPassword,
      role: role.includes('Director') ? 'Admin' : 'HR',
      phone: `+33 1 50 00 00 0${i + 1}`
    });
    await hrPerson.save();
    hrStaff.push(hrPerson);
    users.push(hrPerson);
    console.log(`  ✅ Personnel RH créé: ${hrPerson.fullName}`);
  }

  // 3. Create Managers (5 total)
  const managers = [];
  let managerIndex = 0;
  for (const bu of businessUnits) {
    for (const managerName of bu.managers) {
      const manager = new User({
        fullName: managerName.replace(/_/g, ' '),
        email: `${managerName.toLowerCase()}@company.com`,
        password: hashedPassword,
        role: 'Manager',
        phone: `+33 1 ${60 + managerIndex}0 00 00 0${managerIndex + 1}`,
        businessUnit: bu._id
      });
      await manager.save();
      managers.push({ user: manager, buId: bu._id });
      users.push(manager);
      managerIndex++;
      console.log(`  ✅ Manager créé: ${manager.fullName} (BU: ${bu.name})`);
    }
  }

  // 4. Create Employees (50 total, 10 per manager)
  const employees = [];
  for (let i = 0; i < managers.length; i++) {
    const manager = managers[i];
    
    for (let j = 0; j < 10; j++) {
      const employeeNumber = i * 10 + j + 1;
      const employee = new User({
        fullName: `Employee ${employeeNumber.toString().padStart(2, '0')}`,
        email: `employee${employeeNumber}@company.com`,
        password: hashedPassword,
        role: 'Employee',
        phone: `+33 1 ${70 + Math.floor(employeeNumber / 10)}${employeeNumber % 10} 00 00 ${employeeNumber.toString().padStart(2, '0')}`,
        businessUnit: manager.buId,
        manager: manager.user._id
      });
      await employee.save();
      employees.push({ user: employee, managerId: manager.user._id, buId: manager.buId });
      users.push(employee);
    }
  }
  console.log(`  ✅ 50 employés créés et assignés à leurs managers`);

  return { buDirectors, hrStaff, managers, employees, allUsers: users };
};

// Create Teams - Skip for now since Team model is actually for individual team members, not teams
const createTeams = async (managers, employees) => {
  console.log('🏆 Création des équipes...');
  console.log('  ℹ️ Les équipes sont implicitement définies par les relations manager-employé');
  
  // Log team structure
  for (let i = 0; i < managers.length; i++) {
    const manager = managers[i];
    const teamEmployees = employees.filter(emp => emp.managerId.toString() === manager.user._id.toString());
    console.log(`  ✅ Équipe virtuelle: ${manager.user.fullName} (${teamEmployees.length} employés)`);
  }

  return []; // Return empty array since we're not creating Team documents
};

// Create Projects
const createProjects = async (businessUnits, managers) => {
  console.log('🚀 Création des projets...');
  const projects = [];

  const clients = ['Client A', 'Client B', 'Client C', 'Internal', 'Acme Corp'];
  const projectTypes = ['internal', 'external'];
  const categories = ['Web Development', 'Mobile App', 'Software', 'Database', 'Design'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  for (const bu of businessUnits) {
    const buManagers = managers.filter(m => m.buId.toString() === bu._id.toString());
    
    for (const projectName of bu.projects) {
      const startDate = getRandomDateIn2025();
      const endDate = new Date('2025-12-31');
      const deliveryDate = new Date(endDate);
      deliveryDate.setDate(deliveryDate.getDate() - 7); // 7 jours avant la fin

      const project = new Project({
        owner: buManagers[0]?.user._id, // Premier manager de la BU comme owner
        projectName: projectName,
        description: `Projet ${projectName} géré par la ${bu.name}`,
        client: clients[Math.floor(Math.random() * clients.length)],
        projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)],
        projectCategory: categories[Math.floor(Math.random() * categories.length)],
        projectPriority: priorities[Math.floor(Math.random() * priorities.length)],
        budget: Math.floor(Math.random() * 500000) + 100000,
        startDate: startDate,
        endDate: endDate,
        deliveryDate: deliveryDate
      });
      await project.save();
      projects.push({ project, buId: bu._id });
      console.log(`  ✅ Projet créé: ${projectName} (BU: ${bu.name}, Client: ${project.client})`);
    }
  }

  return projects;
};

// Create Tasks
const createTasks = async (projects, managers) => {
  console.log('📋 Création des tâches...');
  const tasks = [];
  
  const taskTemplates = [
    'Développement Frontend',
    'Développement Backend', 
    'Tests Unitaires',
    'Tests d\'Intégration',
    'Déploiement',
    'Documentation',
    'Maintenance',
    'Support Client',
    'Analyse des Besoins',
    'Code Review'
  ];

  const phases = ['Planning', 'Design', 'Development', 'Testing'];
  const skills = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'Python', 'Java'];
  const certifications = ['AWS Certified', 'Azure Certified', 'Scrum Master', 'PMP', 'No certification required'];

  for (const { project, buId } of projects) {
    // Trouver le manager de cette BU pour être le owner de la tâche
    const buManager = managers.find(m => m.buId.toString() === buId.toString());
    
    // Créer 3-5 tâches par projet
    const numTasks = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numTasks; i++) {
      const taskName = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      
      const task = new Task({
        owner: buManager?.user._id || project.owner,
        taskName: `${taskName} - ${project.projectName}`,
        description: `Tâche ${taskName} pour le projet ${project.projectName}`,
        project: project._id,
        projectPhase: phases[Math.floor(Math.random() * phases.length)],
        RequiredyearsOfExper: Math.floor(Math.random() * 5) + 1, // 1-5 ans
        startDate: startDate,
        endDate: endDate,
        requiredSkills: [skills[Math.floor(Math.random() * skills.length)], skills[Math.floor(Math.random() * skills.length)]],
        languagesSpoken: ['French', 'English'],
        requiredCertifications: [certifications[Math.floor(Math.random() * certifications.length)]],
        budget: Math.floor(Math.random() * 50000) + 5000 // 5k-55k budget
      });
      
      await task.save();
      tasks.push({ task, projectId: project._id, buId });
    }
  }
  
  console.log(`  ✅ ${tasks.length} tâches créées`);
  return tasks;
};

// Create Assignments for 2025
const createAssignments = async (employees, tasks, projects) => {
  console.log('📅 Création des affectations pour 2025...');
  const assignments = [];
  
  // Dates pour 2025
  const year2025Start = new Date('2025-01-01');
  const year2025End = new Date('2025-12-31');
  
  const assignmentTypes = ["enduring - long period", "short-term", "temporary", "full-time"];
  const statuses = ["draft", "assigned", "in-progress", "completed", "cancelled"];
  
  for (const { user: employee, managerId, buId } of employees) {
    // Obtenir les projets et tâches de la même BU que l'employé
    const buProjects = projects.filter(p => p.buId.toString() === buId.toString());
    const buTasks = tasks.filter(t => t.buId.toString() === buId.toString());
    
    if (buTasks.length === 0) continue;
    
    // Créer 2-4 affectations par employé en 2025
    const numAssignments = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numAssignments; i++) {
      const randomTask = buTasks[Math.floor(Math.random() * buTasks.length)];
      const relatedProject = buProjects.find(p => p.project._id.toString() === randomTask.projectId.toString());
      
      if (!relatedProject) continue;
      
      // Générer des dates aléatoirement en 2025
      const startDate = getRandomDate(year2025Start, new Date('2025-10-31'));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 15); // 15-75 jours
      
      if (endDate > year2025End) {
        endDate.setTime(year2025End.getTime());
      }
      
      // Calculer totalDays basé sur la durée
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const totalDays = Math.min(duration, 365); // Max 365 jours
      
      const assignment = new Assignment({
        employee: employee._id,
        Owner: managerId, // Important: Owner = manager de l'employé
        project: relatedProject.project._id,
        taskId: randomTask.task._id,
        startDate: startDate,
        endDate: endDate,
        assignmentType: assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)],
        totalDays: totalDays,
        dayDetails: [], // Journées complètes par défaut
        status: statuses[Math.floor(Math.random() * statuses.length)],
        skillMatchScore: Math.random() * 0.5 + 0.5 // Score entre 0.5 et 1
      });
      
      await assignment.save();
      assignments.push(assignment);
    }
  }
  
  console.log(`  ✅ ${assignments.length} affectations créées pour 2025`);
  return assignments;
};

// Main execution function
const buildCoherentCompany = async () => {
  try {
    console.log('🏗️ Construction d\'une entreprise cohérente pour 2025...\n');
    
    await connectDB();
    await clearDatabase();
    
    // Step 1: Create Business Units
    console.log('\n📊 ÉTAPE 1: Création des Business Units');
    const businessUnits = await createBusinessUnits();
    
    // Step 2: Create Users with hierarchy
    console.log('\n👥 ÉTAPE 2: Création des utilisateurs');
    const { buDirectors, hrStaff, managers, employees } = await createUsers(businessUnits);
    
    // Step 3: Create Teams (virtual teams based on manager-employee relationships)
    console.log('\n🏆 ÉTAPE 3: Organisation des équipes');
    const teams = await createTeams(managers, employees);
    
    // Step 4: Create Projects
    console.log('\n🚀 ÉTAPE 4: Création des projets');
    const projects = await createProjects(businessUnits, managers);
    
    // Step 5: Create Tasks
    console.log('\n📋 ÉTAPE 5: Création des tâches');
    const tasks = await createTasks(projects, managers);
    
    // Step 6: Create Assignments for 2025
    console.log('\n📅 ÉTAPE 6: Création des affectations pour 2025');
    const assignments = await createAssignments(employees, tasks, projects);
    
    // Summary
    console.log('\n📊 RÉSUMÉ DE LA CONSTRUCTION:');
    console.log(`  🏢 Business Units: ${businessUnits.length}`);
    console.log(`  👔 Directeurs BU: ${buDirectors.length}`);
    console.log(`  🏛️ Personnel RH: ${hrStaff.length}`);
    console.log(`  👨‍💼 Managers: ${managers.length}`);
    console.log(`  👥 Employés: ${employees.length}`);
    console.log(`  🏆 Équipes: ${teams.length}`);
    console.log(`  🚀 Projets: ${projects.length}`);
    console.log(`  📋 Tâches: ${tasks.length}`);
    console.log(`  📅 Affectations 2025: ${assignments.length}`);
    
    console.log('\n✅ Construction terminée avec succès!');
    console.log('💡 Utilisez maintenant verifyCoherentSystem.js pour vérifier la cohérence');
    
  } catch (error) {
    console.error('❌ Erreur lors de la construction:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  buildCoherentCompany();
}

module.exports = { buildCoherentCompany };