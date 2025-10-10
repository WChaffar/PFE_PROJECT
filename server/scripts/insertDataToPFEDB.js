const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const BusinessUnit = require('../models/BusinessUnitModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const Assignment = require('../models/AssignmentModel');
const Team = require('../models/teamModel');

// Configuration MongoDB Atlas (même que dans dbConnect.js)
const mongoURI = 'mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster';

async function connectDB() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
  console.log('📊 Insertion des Business Units dans PFEDB...');
  
  const businessUnits = [
    {
      name: 'Information Technology',
      code: 'IT',
      description: 'Responsible for all technology infrastructure and software development',
      isActive: true
    },
    {
      name: 'Marketing & Sales',
      code: 'MKT',
      description: 'Handles marketing campaigns, sales strategies and customer relations',
      isActive: true
    },
    {
      name: 'Human Resources',
      code: 'HR',
      description: 'Manages employee relations, recruitment and organizational development',
      isActive: true
    },
    {
      name: 'Finance & Accounting',
      code: 'FIN',
      description: 'Oversees financial planning, budgeting and accounting operations',
      isActive: true
    },
    {
      name: 'Operations & Logistics',
      code: 'OPS',
      description: 'Manages daily operations, supply chain and logistics coordination',
      isActive: true
    }
  ];

  const createdBUs = await BusinessUnit.insertMany(businessUnits);
  console.log(`✅ ${createdBUs.length} Business Units créées dans PFEDB`);
  return createdBUs;
}

async function insertUsers(businessUnits) {
  console.log('👥 Insertion des utilisateurs dans PFEDB...');
  
  const users = [];
  
  // BUDirectors
  const buDirectors = [
    {
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      password: 'password123',
      role: 'BUDirector',
      phoneNumber: '+1-555-0101',
      jobTitle: 'IT Director',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2020-01-15'),
      seniorityLevel: 'Senior',
      keySkills: ['Strategic Planning', 'Team Leadership', 'Digital Transformation', 'Budget Management'],
      certifications: ['PMP', 'AWS Cloud Practitioner', 'ITIL Foundation'],
      yearsOfExperience: 12,
      businessUnit: businessUnits[0]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Michael Chen',
      email: 'michael.chen@company.com',
      password: 'password123',
      role: 'BUDirector',
      phoneNumber: '+1-555-0102',
      jobTitle: 'Marketing Director',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2019-03-20'),
      seniorityLevel: 'Senior',
      keySkills: ['Marketing Strategy', 'Brand Management', 'Digital Marketing', 'Analytics'],
      certifications: ['Google Analytics', 'HubSpot Marketing', 'Facebook Blueprint'],
      yearsOfExperience: 10,
      businessUnit: businessUnits[1]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Jennifer Rodriguez',
      email: 'jennifer.rodriguez@company.com',
      password: 'password123',
      role: 'BUDirector',
      phoneNumber: '+1-555-0103',
      jobTitle: 'HR Director',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2018-06-10'),
      seniorityLevel: 'Senior',
      keySkills: ['Human Resources', 'Talent Acquisition', 'Employee Relations', 'Organizational Development'],
      certifications: ['SHRM-CP', 'PHR', 'Certified Talent Acquisition Professional'],
      yearsOfExperience: 15,
      businessUnit: businessUnits[2]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Catherine Williams',
      email: 'catherine.williams@company.com',
      password: 'password123',
      role: 'BUDirector',
      phoneNumber: '+1-555-0501',
      jobTitle: 'Finance Director',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2018-04-10'),
      seniorityLevel: 'Senior',
      keySkills: ['Financial Planning', 'Budget Management', 'Risk Assessment', 'Investment Analysis'],
      certifications: ['CPA', 'CFA', 'Financial Risk Manager'],
      yearsOfExperience: 14,
      businessUnit: businessUnits[3]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Mark Davis',
      email: 'mark.davis@company.com',
      password: 'password123',
      role: 'BUDirector',
      phoneNumber: '+1-555-0601',
      jobTitle: 'Operations Director',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2019-02-05'),
      seniorityLevel: 'Senior',
      keySkills: ['Operations Management', 'Supply Chain', 'Process Optimization', 'Logistics'],
      certifications: ['Six Sigma Black Belt', 'PMP', 'Supply Chain Management'],
      yearsOfExperience: 11,
      businessUnit: businessUnits[4]._id,
      Activated: true,
      profileCompleted: true
    }
  ];

  // Managers
  const managers = [
    {
      fullName: 'David Thompson',
      email: 'david.thompson@company.com',
      password: 'password123',
      role: 'Manager',
      phoneNumber: '+1-555-0201',
      jobTitle: 'Software Development Manager',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2021-02-15'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['Software Development', 'Agile', 'Team Management', 'Code Review'],
      certifications: ['Scrum Master', 'Azure Developer'],
      yearsOfExperience: 8,
      businessUnit: businessUnits[0]._id,
      manager: buDirectors[0]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Lisa Wang',
      email: 'lisa.wang@company.com',
      password: 'password123',
      role: 'Manager',
      phoneNumber: '+1-555-0202',
      jobTitle: 'DevOps Manager',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2020-09-01'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['DevOps', 'Cloud Infrastructure', 'CI/CD', 'Docker', 'Kubernetes'],
      certifications: ['AWS Solutions Architect', 'Docker Certified Associate'],
      yearsOfExperience: 7,
      businessUnit: businessUnits[0]._id,
      manager: buDirectors[0]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Robert Martinez',
      email: 'robert.martinez@company.com',
      password: 'password123',
      role: 'Manager',
      phoneNumber: '+1-555-0203',
      jobTitle: 'Digital Marketing Manager',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2021-05-10'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Social Media'],
      certifications: ['Google Ads', 'Google Analytics', 'HubSpot Content Marketing'],
      yearsOfExperience: 6,
      businessUnit: businessUnits[1]._id,
      manager: buDirectors[1]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Amanda Foster',
      email: 'amanda.foster@company.com',
      password: 'password123',
      role: 'Manager',
      phoneNumber: '+1-555-0204',
      jobTitle: 'Recruitment Manager',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2020-11-15'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['Talent Acquisition', 'Interviewing', 'HR Analytics', 'Employee Onboarding'],
      certifications: ['Certified Talent Acquisition Professional', 'LinkedIn Recruiter'],
      yearsOfExperience: 5,
      businessUnit: businessUnits[2]._id,
      manager: buDirectors[2]._id,
      Activated: true,
      profileCompleted: true
    }
  ];

  // Employees
  const employees = [
    // IT Employees
    {
      fullName: 'Alex Kumar',
      email: 'alex.kumar@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0301',
      jobTitle: 'Senior Full Stack Developer',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2022-01-10'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
      certifications: ['React Developer', 'Node.js Certified Developer'],
      yearsOfExperience: 5,
      businessUnit: businessUnits[0]._id,
      manager: managers[0]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Emma Wilson',
      email: 'emma.wilson@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0302',
      jobTitle: 'Frontend Developer',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2022-03-15'),
      seniorityLevel: 'Junior',
      keySkills: ['React', 'Vue.js', 'CSS', 'HTML', 'JavaScript'],
      certifications: ['Frontend Developer Nanodegree'],
      yearsOfExperience: 3,
      businessUnit: businessUnits[0]._id,
      manager: managers[0]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'James Rodriguez',
      email: 'james.rodriguez@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0303',
      jobTitle: 'Backend Developer',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2021-11-20'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'API Development'],
      certifications: ['MongoDB Developer', 'Node.js Professional'],
      yearsOfExperience: 4,
      businessUnit: businessUnits[0]._id,
      manager: managers[0]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Sofia Andersson',
      email: 'sofia.andersson@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0304',
      jobTitle: 'DevOps Engineer',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2022-06-01'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Infrastructure as Code'],
      certifications: ['AWS Solutions Architect Associate', 'Kubernetes Administrator'],
      yearsOfExperience: 4,
      businessUnit: businessUnits[0]._id,
      manager: managers[1]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Daniel Kim',
      email: 'daniel.kim@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0305',
      jobTitle: 'QA Engineer',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2022-04-15'),
      seniorityLevel: 'Junior',
      keySkills: ['Test Automation', 'Selenium', 'Jest', 'API Testing', 'Manual Testing'],
      certifications: ['ISTQB Foundation', 'Selenium WebDriver'],
      yearsOfExperience: 2,
      businessUnit: businessUnits[0]._id,
      manager: managers[0]._id,
      Activated: true,
      profileCompleted: true
    },

    // Marketing Employees
    {
      fullName: 'Isabella Garcia',
      email: 'isabella.garcia@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0306',
      jobTitle: 'Content Marketing Specialist',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2022-02-20'),
      seniorityLevel: 'Junior',
      keySkills: ['Content Writing', 'SEO', 'Social Media', 'Copywriting', 'Analytics'],
      certifications: ['HubSpot Content Marketing', 'Google Analytics'],
      yearsOfExperience: 2,
      businessUnit: businessUnits[1]._id,
      manager: managers[2]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Ryan O\'Connor',
      email: 'ryan.oconnor@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0307',
      jobTitle: 'Digital Marketing Specialist',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2021-12-10'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['PPC Advertising', 'Google Ads', 'Facebook Ads', 'Marketing Analytics', 'A/B Testing'],
      certifications: ['Google Ads Professional', 'Facebook Blueprint'],
      yearsOfExperience: 4,
      businessUnit: businessUnits[1]._id,
      manager: managers[2]._id,
      Activated: true,
      profileCompleted: true
    },

    // HR Employees
    {
      fullName: 'Olivia Brown',
      email: 'olivia.brown@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0308',
      jobTitle: 'HR Specialist',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2022-05-01'),
      seniorityLevel: 'Junior',
      keySkills: ['Recruitment', 'Employee Relations', 'HR Administration', 'Benefits Management'],
      certifications: ['PHR Associate', 'SHRM Essentials'],
      yearsOfExperience: 2,
      businessUnit: businessUnits[2]._id,
      manager: managers[3]._id,
      Activated: true,
      profileCompleted: true
    },
    {
      fullName: 'Marcus Johnson',
      email: 'marcus.johnson@company.com',
      password: 'password123',
      role: 'Employee',
      phoneNumber: '+1-555-0309',
      jobTitle: 'Talent Acquisition Specialist',
      employmentType: 'Full-time',
      dateOfJoining: new Date('2021-08-15'),
      seniorityLevel: 'Mid-Level',
      keySkills: ['Talent Sourcing', 'Interviewing', 'Candidate Assessment', 'Employer Branding'],
      certifications: ['Certified Talent Acquisition Professional', 'LinkedIn Talent Solutions'],
      yearsOfExperience: 3,
      businessUnit: businessUnits[2]._id,
      manager: managers[3]._id,
      Activated: true,
      profileCompleted: true
    }
  ];

  // Insérer les utilisateurs avec les relations de manager correctes
  const allUsers = [...buDirectors, ...managers, ...employees];
  
  // Hasher les mots de passe
  for (let user of allUsers) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  const createdUsers = await User.insertMany(allUsers);
  console.log(`✅ ${createdUsers.length} utilisateurs créés dans PFEDB`);
  return createdUsers;
}

async function insertProjects(users, businessUnits) {
  console.log('🏗️ Insertion des projets dans PFEDB...');
  
  const projects = [
    {
      owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      projectName: 'E-Commerce Platform Redesign',
      description: 'Complete overhaul of the company e-commerce platform with modern UI/UX and enhanced functionality',
      client: 'Internal - Sales Department',
      projectType: 'internal',
      projectCategory: 'Web Development',
      projectPriority: 'high',
      budget: 150000,
      additionalFunding: 25000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-08-30'),
      deliveryDate: new Date('2024-09-15')
    },
    {
      owner: users.find(u => u.jobTitle === 'DevOps Manager')._id,
      projectName: 'Cloud Infrastructure Migration',
      description: 'Migration of legacy systems to AWS cloud infrastructure with improved scalability and security',
      client: 'Internal - IT Department',
      projectType: 'internal',
      projectCategory: 'Software',
      projectPriority: 'critical',
      budget: 200000,
      additionalFunding: 50000,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-10-31'),
      deliveryDate: new Date('2024-11-15')
    },
    {
      owner: users.find(u => u.jobTitle === 'Digital Marketing Manager')._id,
      projectName: 'Customer Mobile App',
      description: 'Development of a customer-facing mobile application for iOS and Android',
      client: 'External - MegaCorp Industries',
      projectType: 'external',
      projectCategory: 'Mobile App',
      projectPriority: 'high',
      budget: 120000,
      additionalFunding: 15000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      deliveryDate: new Date('2024-10-15')
    },
    {
      owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      projectName: 'CRM System Enhancement',
      description: 'Enhancement of existing CRM system with advanced analytics and reporting features',
      client: 'Internal - Sales & Marketing',
      projectType: 'internal',
      projectCategory: 'Software',
      projectPriority: 'medium',
      budget: 80000,
      additionalFunding: 10000,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-11-30'),
      deliveryDate: new Date('2024-12-15')
    },
    {
      owner: users.find(u => u.jobTitle === 'Finance Director')._id,
      projectName: 'Financial Reporting System Upgrade',
      description: 'Upgrade of the existing financial reporting system with enhanced analytics capabilities',
      client: 'Internal - Finance Department',
      projectType: 'internal',
      projectCategory: 'Software',
      projectPriority: 'high',
      budget: 95000,
      additionalFunding: 15000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-10-31'),
      deliveryDate: new Date('2024-11-15')
    }
  ];

  const createdProjects = await Project.insertMany(projects);
  console.log(`✅ ${createdProjects.length} projets créés dans PFEDB`);
  return createdProjects;
}

async function insertTasks(projects, users) {
  console.log('📋 Insertion des tâches dans PFEDB...');
  
  const tasks = [];
  
  // Tâches pour E-Commerce Platform Redesign
  const ecommerceProject = projects.find(p => p.projectName === 'E-Commerce Platform Redesign');
  tasks.push(
    {
      owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      taskName: 'Frontend UI/UX Design Implementation',
      description: 'Implement the new user interface design using React and modern CSS frameworks',
      project: ecommerceProject._id,
      projectPhase: 'Design',
      RequiredyearsOfExper: 3,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-04-15'),
      requiredSkills: ['React', 'CSS', 'JavaScript', 'UI/UX Design'],
      languagesSpoken: ['English'],
      requiredCertifications: ['React Developer'],
      budget: 40000,
      workload: 85
    },
    {
      owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      taskName: 'Backend API Development',
      description: 'Develop RESTful APIs for the new e-commerce platform',
      project: ecommerceProject._id,
      projectPhase: 'Development',
      RequiredyearsOfExper: 4,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-01'),
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'API Development'],
      languagesSpoken: ['English'],
      requiredCertifications: ['Node.js Professional'],
      budget: 50000,
      workload: 90
    },
    {
      owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      taskName: 'Database Schema Design',
      description: 'Design and implement the database schema for the new platform',
      project: ecommerceProject._id,
      projectPhase: 'Planning',
      RequiredyearsOfExper: 5,
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-03-20'),
      requiredSkills: ['MongoDB', 'Database Design', 'Data Modeling'],
      languagesSpoken: ['English'],
      requiredCertifications: ['MongoDB Developer'],
      budget: 30000,
      workload: 100
    },
    {
      owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      taskName: 'Quality Assurance Testing',
      description: 'Comprehensive testing of the e-commerce platform functionality',
      project: ecommerceProject._id,
      projectPhase: 'Testing',
      RequiredyearsOfExper: 2,
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-08-15'),
      requiredSkills: ['Test Automation', 'Selenium', 'API Testing', 'Manual Testing'],
      languagesSpoken: ['English'],
      requiredCertifications: ['ISTQB Foundation'],
      budget: 25000,
      workload: 75
    }
  );

  // Tâches pour Cloud Infrastructure Migration
  const cloudProject = projects.find(p => p.projectName === 'Cloud Infrastructure Migration');
  tasks.push(
    {
      owner: users.find(u => u.jobTitle === 'DevOps Manager')._id,
      taskName: 'AWS Infrastructure Setup',
      description: 'Set up AWS cloud infrastructure including VPC, EC2, RDS, and security groups',
      project: cloudProject._id,
      projectPhase: 'Planning',
      RequiredyearsOfExper: 4,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      requiredSkills: ['AWS', 'Infrastructure as Code', 'Terraform', 'CloudFormation'],
      languagesSpoken: ['English'],
      requiredCertifications: ['AWS Solutions Architect Associate'],
      budget: 60000,
      workload: 95
    },
    {
      owner: users.find(u => u.jobTitle === 'DevOps Manager')._id,
      taskName: 'Container Orchestration',
      description: 'Implement Docker containers and Kubernetes orchestration',
      project: cloudProject._id,
      projectPhase: 'Development',
      RequiredyearsOfExper: 4,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-07-15'),
      requiredSkills: ['Docker', 'Kubernetes', 'Container Orchestration', 'Microservices'],
      languagesSpoken: ['English'],
      requiredCertifications: ['Kubernetes Administrator'],
      budget: 70000,
      workload: 88
    }
  );

  const createdTasks = await Task.insertMany(tasks);
  console.log(`✅ ${createdTasks.length} tâches créées dans PFEDB`);
  return createdTasks;
}

async function insertAssignments(users, projects, tasks) {
  console.log('📝 Insertion des assignments dans PFEDB...');
  
  const assignments = [];
  
  // Assignments pour les tâches
  const frontendTask = tasks.find(t => t.taskName === 'Frontend UI/UX Design Implementation');
  const backendTask = tasks.find(t => t.taskName === 'Backend API Development');
  const dbTask = tasks.find(t => t.taskName === 'Database Schema Design');
  const qaTask = tasks.find(t => t.taskName === 'Quality Assurance Testing');
  
  const frontendDev = users.find(u => u.jobTitle === 'Frontend Developer');
  const backendDev = users.find(u => u.jobTitle === 'Backend Developer');
  const fullstackDev = users.find(u => u.jobTitle === 'Senior Full Stack Developer');
  const qaEngineer = users.find(u => u.jobTitle === 'QA Engineer');
  
  assignments.push(
    {
      Owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      employee: frontendDev._id,
      project: frontendTask.project,
      taskId: frontendTask._id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-04-15'),
      assignmentType: 'enduring - long period',
      totalDays: 90,
      status: 'in-progress',
      skillMatchScore: 0.92,
      recommendations: 'Excellent match for React development skills'
    },
    {
      Owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      employee: backendDev._id,
      project: backendTask.project,
      taskId: backendTask._id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-01'),
      assignmentType: 'enduring - long period',
      totalDays: 120,
      status: 'in-progress',
      skillMatchScore: 0.88,
      recommendations: 'Strong backend development experience'
    },
    {
      Owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      employee: fullstackDev._id,
      project: dbTask.project,
      taskId: dbTask._id,
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-03-20'),
      assignmentType: 'short-term',
      totalDays: 60,
      status: 'completed',
      skillMatchScore: 0.95,
      recommendations: 'Perfect match for database design requirements'
    },
    {
      Owner: users.find(u => u.jobTitle === 'Software Development Manager')._id,
      employee: qaEngineer._id,
      project: qaTask.project,
      taskId: qaTask._id,
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-08-15'),
      assignmentType: 'short-term',
      totalDays: 60,
      status: 'assigned',
      skillMatchScore: 0.85,
      recommendations: 'Good testing skills for comprehensive QA'
    }
  );

  // Assignments pour les tâches du projet Cloud Migration
  const awsTask = tasks.find(t => t.taskName === 'AWS Infrastructure Setup');
  const containerTask = tasks.find(t => t.taskName === 'Container Orchestration');
  
  const devopsEngineer = users.find(u => u.jobTitle === 'DevOps Engineer');
  
  assignments.push(
    {
      Owner: users.find(u => u.jobTitle === 'DevOps Manager')._id,
      employee: devopsEngineer._id,
      project: awsTask.project,
      taskId: awsTask._id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      assignmentType: 'enduring - long period',
      totalDays: 90,
      status: 'in-progress',
      skillMatchScore: 0.90,
      recommendations: 'Excellent AWS and infrastructure skills'
    },
    {
      Owner: users.find(u => u.jobTitle === 'DevOps Manager')._id,
      employee: devopsEngineer._id,
      project: containerTask.project,
      taskId: containerTask._id,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-07-15'),
      assignmentType: 'enduring - long period',
      totalDays: 120,
      status: 'assigned',
      skillMatchScore: 0.93,
      recommendations: 'Strong containerization and Kubernetes experience'
    }
  );

  const createdAssignments = await Assignment.insertMany(assignments);
  console.log(`✅ ${createdAssignments.length} assignments créés dans PFEDB`);
  return createdAssignments;
}

async function updateUserAssignments(users, assignments) {
  console.log('🔄 Mise à jour des assignments utilisateurs dans PFEDB...');
  
  for (const assignment of assignments) {
    await User.findByIdAndUpdate(
      assignment.employee,
      { $push: { assignments: assignment._id } },
      { new: true }
    );
  }
  
  console.log('✅ Assignments utilisateurs mis à jour dans PFEDB');
}

async function main() {
  try {
    console.log('🚀 Début de l\'insertion des données dans PFEDB...\n');
    
    await connectDB();
    await clearExistingData();
    
    const businessUnits = await insertBusinessUnits();
    const users = await insertUsers(businessUnits);
    const projects = await insertProjects(users, businessUnits);
    const tasks = await insertTasks(projects, users);
    const assignments = await insertAssignments(users, projects, tasks);
    
    await updateUserAssignments(users, assignments);
    
    console.log('\n🎉 Insertion des données dans PFEDB terminée avec succès !');
    console.log('\n📊 Résumé des données insérées dans PFEDB :');
    console.log(`   • Business Units: ${businessUnits.length}`);
    console.log(`   • Utilisateurs: ${users.length}`);
    console.log(`   • Projets: ${projects.length}`);
    console.log(`   • Tâches: ${tasks.length}`);
    console.log(`   • Assignments: ${assignments.length}`);
    
    console.log('\n🔑 Comptes de test dans PFEDB :');
    console.log('   BUDirectors:');
    console.log('   • sarah.johnson@company.com (IT Director)');
    console.log('   • michael.chen@company.com (Marketing Director)');
    console.log('   • jennifer.rodriguez@company.com (HR Director)');
    console.log('   • catherine.williams@company.com (Finance Director)');
    console.log('   • mark.davis@company.com (Operations Director)');
    console.log('\n   Mot de passe pour tous : password123');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données dans PFEDB:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Connexion MongoDB Atlas fermée');
  }
}

main();