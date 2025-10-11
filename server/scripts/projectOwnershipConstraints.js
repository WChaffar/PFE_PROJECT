const mongoose = require('mongoose');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Configuration de la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createProjectOwnershipConstraints() {
  try {
    console.log('🔒 Creating Project Ownership Constraints...\n');

    // Check current state
    const projects = await Project.find().populate('owner', 'fullName role');
    const managers = await User.find({ role: { $in: ['manager', 'Manager'] } });
    
    console.log(`📊 Current state:`);
    console.log(`• Total projects: ${projects.length}`);
    console.log(`• Total managers: ${managers.length}`);
    
    // Validate business rules
    console.log('\n🎯 Business Rules Validation:\n');
    
    const managerProjectCount = {};
    const orphanedProjects = [];
    
    for (const project of projects) {
      if (!project.owner) {
        orphanedProjects.push(project);
      } else {
        const managerName = project.owner.fullName;
        managerProjectCount[managerName] = (managerProjectCount[managerName] || 0) + 1;
      }
    }
    
    // Rule 1: No orphaned projects
    console.log('Rule 1: All projects must have an owner');
    if (orphanedProjects.length === 0) {
      console.log('✅ PASSED - All projects have owners');
    } else {
      console.log(`❌ FAILED - ${orphanedProjects.length} orphaned projects:`);
      orphanedProjects.forEach(project => {
        console.log(`   • ${project.projectName}`);
      });
    }
    
    // Rule 2: Balanced distribution
    console.log('\nRule 2: Project distribution among managers');
    const projectCounts = Object.values(managerProjectCount);
    const avgProjects = projectCounts.reduce((a, b) => a + b, 0) / projectCounts.length;
    const maxProjects = Math.max(...projectCounts);
    const minProjects = Math.min(...projectCounts);
    
    console.log(`• Average projects per manager: ${avgProjects.toFixed(1)}`);
    console.log(`• Range: ${minProjects} - ${maxProjects} projects`);
    
    if (maxProjects - minProjects <= 1) {
      console.log('✅ PASSED - Well balanced distribution');
    } else {
      console.log('⚠️  WARNING - Unbalanced distribution');
    }
    
    // Rule 3: Single ownership verification
    console.log('\nRule 3: Single project ownership verification');
    const tasks = await Task.find().populate('owner project', 'fullName projectName');
    
    const projectTaskOwners = {};
    tasks.forEach(task => {
      if (task.project && task.owner) {
        const projectId = task.project._id.toString();
        const projectName = task.project.projectName;
        const ownerName = task.owner.fullName;
        
        if (!projectTaskOwners[projectId]) {
          projectTaskOwners[projectId] = {
            projectName,
            owners: new Set()
          };
        }
        projectTaskOwners[projectId].owners.add(ownerName);
      }
    });
    
    const multiOwnerProjects = Object.values(projectTaskOwners).filter(
      p => p.owners.size > 1
    );
    
    if (multiOwnerProjects.length === 0) {
      console.log('✅ PASSED - All projects have single ownership');
    } else {
      console.log(`❌ FAILED - ${multiOwnerProjects.length} projects with multiple task owners:`);
      multiOwnerProjects.forEach(project => {
        console.log(`   • ${project.projectName}: [${Array.from(project.owners).join(', ')}]`);
      });
    }
    
    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:\n');
    
    if (orphanedProjects.length > 0) {
      console.log('1. Assign owners to orphaned projects:');
      // Find manager with least projects
      const leastBusyManager = Object.entries(managerProjectCount)
        .sort(([,a], [,b]) => a - b)[0];
      
      orphanedProjects.forEach(project => {
        console.log(`   • Assign "${project.projectName}" to ${leastBusyManager[0]}`);
      });
    }
    
    if (multiOwnerProjects.length > 0) {
      console.log('2. Resolve multi-ownership conflicts:');
      console.log('   • Review task assignments to ensure consistency');
      console.log('   • Consider reassigning tasks to maintain single project ownership');
    }
    
    if (maxProjects - minProjects > 1) {
      console.log('3. Rebalance project distribution:');
      const overloadedManagers = Object.entries(managerProjectCount)
        .filter(([, count]) => count > avgProjects + 0.5)
        .sort(([,a], [,b]) => b - a);
      
      const underloadedManagers = Object.entries(managerProjectCount)
        .filter(([, count]) => count < avgProjects - 0.5)
        .sort(([,a], [,b]) => a - b);
      
      console.log(`   • Overloaded: ${overloadedManagers.map(([name, count]) => `${name}(${count})`).join(', ')}`);
      console.log(`   • Underloaded: ${underloadedManagers.map(([name, count]) => `${name}(${count})`).join(', ')}`);
    }
    
    // Create monitoring query
    console.log('\n📋 MONITORING QUERIES:\n');
    console.log('Use these queries to monitor project ownership:');
    console.log('\n1. Find projects without owners:');
    console.log('   db.projects.find({ owner: { $exists: false } })');
    
    console.log('\n2. Find projects with multiple task owners:');
    console.log(`   db.tasks.aggregate([
     { $match: { project: { $exists: true }, owner: { $exists: true } } },
     { $group: { _id: "$project", owners: { $addToSet: "$owner" } } },
     { $match: { "owners.1": { $exists: true } } },
     { $lookup: { from: "projects", localField: "_id", foreignField: "_id", as: "project" } }
   ])`);
    
    console.log('\n3. Check manager workload distribution:');
    console.log(`   db.projects.aggregate([
     { $group: { _id: "$owner", count: { $sum: 1 } } },
     { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "manager" } },
     { $sort: { count: -1 } }
   ])`);

  } catch (error) {
    console.error('❌ Error creating ownership constraints:', error);
  } finally {
    mongoose.connection.close();
  }
}

createProjectOwnershipConstraints();