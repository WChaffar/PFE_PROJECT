const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const BusinessUnit = require('../models/BusinessUnitModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const Assignment = require('../models/AssignmentModel');

async function addFinanceAndOpsData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/StaffApp');
    
    console.log('💰 Ajout des données pour Finance & Operations...');
    
    // Récupérer les Business Units Finance et Operations
    const financeBU = await BusinessUnit.findOne({ code: 'FIN' });
    const opsBU = await BusinessUnit.findOne({ code: 'OPS' });
    
    // Créer des utilisateurs pour Finance
    const financeUsers = [
      {
        fullName: 'Catherine Williams',
        email: 'catherine.williams@company.com',
        password: await bcrypt.hash('password123', 10),
        role: 'BUDirector',
        phoneNumber: '+1-555-0501',
        jobTitle: 'Finance Director',
        employmentType: 'Full-time',
        dateOfJoining: new Date('2018-04-10'),
        seniorityLevel: 'Senior',
        keySkills: ['Financial Planning', 'Budget Management', 'Risk Assessment', 'Investment Analysis'],
        certifications: ['CPA', 'CFA', 'Financial Risk Manager'],
        yearsOfExperience: 14,
        businessUnit: financeBU._id,
        Activated: true,
        profileCompleted: true
      },
      {
        fullName: 'Thomas Anderson',
        email: 'thomas.anderson@company.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Manager',
        phoneNumber: '+1-555-0502',
        jobTitle: 'Senior Financial Analyst',
        employmentType: 'Full-time',
        dateOfJoining: new Date('2020-08-15'),
        seniorityLevel: 'Mid-Level',
        keySkills: ['Financial Analysis', 'Excel', 'SQL', 'Reporting'],
        certifications: ['Financial Modeling', 'Advanced Excel'],
        yearsOfExperience: 6,
        businessUnit: financeBU._id,
        manager: null, // Will be set after BUDirector creation
        Activated: true,
        profileCompleted: true
      },
      {
        fullName: 'Rachel Green',
        email: 'rachel.green@company.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Employee',
        phoneNumber: '+1-555-0503',
        jobTitle: 'Financial Analyst',
        employmentType: 'Full-time',
        dateOfJoining: new Date('2022-01-20'),
        seniorityLevel: 'Junior',
        keySkills: ['Financial Reporting', 'Data Analysis', 'Excel', 'PowerBI'],
        certifications: ['Financial Analyst Certificate'],
        yearsOfExperience: 2,
        businessUnit: financeBU._id,
        manager: null, // Will be set after Manager creation
        Activated: true,
        profileCompleted: true
      }
    ];

    // Créer des utilisateurs pour Operations
    const opsUsers = [
      {
        fullName: 'Mark Davis',
        email: 'mark.davis@company.com',
        password: await bcrypt.hash('password123', 10),
        role: 'BUDirector',
        phoneNumber: '+1-555-0601',
        jobTitle: 'Operations Director',
        employmentType: 'Full-time',
        dateOfJoining: new Date('2019-02-05'),
        seniorityLevel: 'Senior',
        keySkills: ['Operations Management', 'Supply Chain', 'Process Optimization', 'Logistics'],
        certifications: ['Six Sigma Black Belt', 'PMP', 'Supply Chain Management'],
        yearsOfExperience: 11,
        businessUnit: opsBU._id,
        Activated: true,
        profileCompleted: true
      },
      {
        fullName: 'Laura Mitchell',
        email: 'laura.mitchell@company.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Manager',
        phoneNumber: '+1-555-0602',
        jobTitle: 'Supply Chain Manager',
        employmentType: 'Full-time',
        dateOfJoining: new Date('2021-06-12'),
        seniorityLevel: 'Mid-Level',
        keySkills: ['Supply Chain', 'Inventory Management', 'Vendor Relations', 'Logistics'],
        certifications: ['APICS CSCP', 'Logistics Management'],
        yearsOfExperience: 5,
        businessUnit: opsBU._id,
        manager: null, // Will be set after BUDirector creation
        Activated: true,
        profileCompleted: true
      },
      {
        fullName: 'Kevin Taylor',
        email: 'kevin.taylor@company.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Employee',
        phoneNumber: '+1-555-0603',
        jobTitle: 'Operations Coordinator',
        employmentType: 'Full-time',
        dateOfJoining: new Date('2022-09-01'),
        seniorityLevel: 'Junior',
        keySkills: ['Operations Support', 'Data Entry', 'Process Documentation', 'Quality Control'],
        certifications: ['Operations Management Certificate'],
        yearsOfExperience: 1,
        businessUnit: opsBU._id,
        manager: null, // Will be set after Manager creation
        Activated: true,
        profileCompleted: true
      }
    ];

    // Insérer tous les utilisateurs
    const allNewUsers = [...financeUsers, ...opsUsers];
    const createdUsers = await User.insertMany(allNewUsers);
    
    // Mettre à jour les relations manager
    const financeDirector = createdUsers.find(u => u.jobTitle === 'Finance Director');
    const financeManager = createdUsers.find(u => u.jobTitle === 'Senior Financial Analyst');
    const financeEmployee = createdUsers.find(u => u.jobTitle === 'Financial Analyst');
    
    const opsDirector = createdUsers.find(u => u.jobTitle === 'Operations Director');
    const opsManager = createdUsers.find(u => u.jobTitle === 'Supply Chain Manager');
    const opsEmployee = createdUsers.find(u => u.jobTitle === 'Operations Coordinator');
    
    // Mettre à jour les relations de management
    await User.findByIdAndUpdate(financeManager._id, { manager: financeDirector._id });
    await User.findByIdAndUpdate(financeEmployee._id, { manager: financeManager._id });
    await User.findByIdAndUpdate(opsManager._id, { manager: opsDirector._id });
    await User.findByIdAndUpdate(opsEmployee._id, { manager: opsManager._id });
    
    console.log(`✅ ${createdUsers.length} nouveaux utilisateurs créés`);
    
    // Créer des projets pour Finance
    const financeProjects = [
      {
        owner: financeDirector._id,
        projectName: 'Financial Reporting System Upgrade',
        description: 'Upgrade of the existing financial reporting system with enhanced analytics and real-time reporting capabilities',
        client: 'Internal - Finance Department',
        projectType: 'internal',
        projectCategory: 'Software',
        projectPriority: 'high',
        budget: 95000,
        additionalFunding: 15000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-10-31'),
        deliveryDate: new Date('2024-11-15')
      },
      {
        owner: financeManager._id,
        projectName: 'Budget Planning Dashboard',
        description: 'Development of interactive dashboard for annual budget planning and monitoring',
        client: 'Internal - All Departments',
        projectType: 'internal',
        projectCategory: 'Web Development',
        projectPriority: 'medium',
        budget: 65000,
        additionalFunding: 8000,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-12-31'),
        deliveryDate: new Date('2025-01-15')
      }
    ];

    // Créer des projets pour Operations
    const opsProjects = [
      {
        owner: opsDirector._id,
        projectName: 'Supply Chain Optimization',
        description: 'Implementation of advanced supply chain management system to optimize inventory and reduce costs',
        client: 'Internal - Operations',
        projectType: 'internal',
        projectCategory: 'Software',
        projectPriority: 'critical',
        budget: 180000,
        additionalFunding: 30000,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-11-30'),
        deliveryDate: new Date('2024-12-15')
      },
      {
        owner: opsManager._id,
        projectName: 'Warehouse Management System',
        description: 'Digital transformation of warehouse operations with IoT sensors and automated tracking',
        client: 'Internal - Logistics',
        projectType: 'internal',
        projectCategory: 'Software',
        projectPriority: 'high',
        budget: 120000,
        additionalFunding: 20000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-02-28'),
        deliveryDate: new Date('2025-03-15')
      }
    ];

    const allNewProjects = [...financeProjects, ...opsProjects];
    const createdProjects = await Project.insertMany(allNewProjects);
    console.log(`✅ ${createdProjects.length} nouveaux projets créés`);
    
    // Créer des tâches pour les nouveaux projets
    const newTasks = [];
    
    // Tâches pour le projet Financial Reporting System
    const financeReportingProject = createdProjects.find(p => p.projectName === 'Financial Reporting System Upgrade');
    newTasks.push(
      {
        owner: financeDirector._id,
        taskName: 'System Architecture Design',
        description: 'Design the new architecture for the financial reporting system',
        project: financeReportingProject._id,
        projectPhase: 'Planning',
        RequiredyearsOfExper: 5,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-01'),
        requiredSkills: ['System Architecture', 'Database Design', 'Financial Systems'],
        languagesSpoken: ['English'],
        requiredCertifications: ['System Architect'],
        budget: 35000,
        workload: 95
      },
      {
        owner: financeManager._id,
        taskName: 'Data Migration Planning',
        description: 'Plan and execute data migration from legacy system',
        project: financeReportingProject._id,
        projectPhase: 'Development',
        RequiredyearsOfExper: 3,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-08-15'),
        requiredSkills: ['Data Migration', 'SQL', 'ETL Processes'],
        languagesSpoken: ['English'],
        requiredCertifications: ['Database Administrator'],
        budget: 30000,
        workload: 88
      }
    );

    // Tâches pour Supply Chain Optimization
    const supplyChainProject = createdProjects.find(p => p.projectName === 'Supply Chain Optimization');
    newTasks.push(
      {
        owner: opsDirector._id,
        taskName: 'Process Analysis & Mapping',
        description: 'Analyze current supply chain processes and map optimization opportunities',
        project: supplyChainProject._id,
        projectPhase: 'Planning',
        RequiredyearsOfExper: 4,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-05-15'),
        requiredSkills: ['Process Analysis', 'Supply Chain', 'Business Analysis'],
        languagesSpoken: ['English'],
        requiredCertifications: ['Six Sigma', 'Business Analyst'],
        budget: 50000,
        workload: 92
      },
      {
        owner: opsManager._id,
        taskName: 'System Integration Setup',
        description: 'Set up integration between supply chain systems and existing ERP',
        project: supplyChainProject._id,
        projectPhase: 'Development',
        RequiredyearsOfExper: 5,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-10-01'),
        requiredSkills: ['System Integration', 'ERP Systems', 'API Development'],
        languagesSpoken: ['English'],
        requiredCertifications: ['ERP Consultant', 'Integration Specialist'],
        budget: 70000,
        workload: 85
      }
    );

    const createdTasks = await Task.insertMany(newTasks);
    console.log(`✅ ${createdTasks.length} nouvelles tâches créées`);
    
    // Créer quelques assignments
    const newAssignments = [
      {
        Owner: financeDirector._id,
        employee: financeManager._id,
        project: financeReportingProject._id,
        taskId: createdTasks[0]._id, // System Architecture Design
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-01'),
        assignmentType: 'short-term',
        totalDays: 60,
        status: 'in-progress',
        skillMatchScore: 0.89,
        recommendations: 'Strong financial systems background'
      },
      {
        Owner: opsDirector._id,
        employee: opsManager._id,
        project: supplyChainProject._id,
        taskId: createdTasks[2]._id, // Process Analysis & Mapping
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-05-15'),
        assignmentType: 'enduring - long period',
        totalDays: 90,
        status: 'in-progress',
        skillMatchScore: 0.94,
        recommendations: 'Perfect match for supply chain optimization'
      }
    ];

    const createdAssignments = await Assignment.insertMany(newAssignments);
    console.log(`✅ ${createdAssignments.length} nouveaux assignments créés`);
    
    // Statistiques finales
    const finalStats = {
      users: await User.countDocuments(),
      projects: await Project.countDocuments(),
      tasks: await Task.countDocuments(),
      assignments: await Assignment.countDocuments()
    };
    
    console.log('\n📊 Statistiques finales après ajouts :');
    console.log(`   • Utilisateurs: ${finalStats.users}`);
    console.log(`   • Projets: ${finalStats.projects}`);
    console.log(`   • Tâches: ${finalStats.tasks}`);
    console.log(`   • Assignments: ${finalStats.assignments}`);
    
    // Vérifier la répartition par BU
    console.log('\n🏢 Utilisateurs par Business Unit :');
    const businessUnits = await BusinessUnit.find();
    for (const bu of businessUnits) {
      const userCount = await User.countDocuments({ businessUnit: bu._id });
      console.log(`   • ${bu.name}: ${userCount} utilisateurs`);
    }
    
    console.log('\n✅ Données Finance & Operations ajoutées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addFinanceAndOpsData();