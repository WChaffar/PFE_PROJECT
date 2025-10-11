const mongoose = require('mongoose');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Configuration de la base de données
mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function analyzeProjectOwnership() {
  try {
    console.log('🔍 Analyzing Project Ownership...\n');

    // Get all projects with populated owner
    const projects = await Project.find().populate('owner', 'fullName role businessUnit');
    console.log(`Found ${projects.length} projects\n`);

    // Get all tasks with populated owner and project
    const tasks = await Task.find()
      .populate('owner', 'fullName role businessUnit')
      .populate('project', 'projectName owner');

    console.log(`Found ${tasks.length} tasks\n`);

    // Analyze project ownership consistency
    console.log('📊 PROJECT OWNERSHIP ANALYSIS:\n');
    console.log('Project Name                    | Project Owner      | Task Owners (Unique)');
    console.log('─'.repeat(80));

    const inconsistentProjects = [];
    const projectOwnershipMap = new Map();

    for (const project of projects) {
      const projectName = project.projectName.substring(0, 30).padEnd(30);
      const projectOwner = project.owner?.fullName || 'NO OWNER';
      
      // Get all tasks for this project
      const projectTasks = tasks.filter(task => 
        task.project && task.project._id.toString() === project._id.toString()
      );

      // Get unique task owners for this project
      const taskOwners = [...new Set(
        projectTasks
          .filter(task => task.owner)
          .map(task => task.owner.fullName)
      )];

      console.log(`${projectName} | ${projectOwner.padEnd(18)} | ${taskOwners.join(', ')}`);

      // Check for inconsistencies
      const hasMultipleTaskOwners = taskOwners.length > 1;
      const projectOwnerNotInTaskOwners = taskOwners.length > 0 && !taskOwners.includes(projectOwner);

      if (hasMultipleTaskOwners || projectOwnerNotInTaskOwners) {
        inconsistentProjects.push({
          project,
          projectOwner,
          taskOwners,
          issues: {
            multipleTaskOwners: hasMultipleTaskOwners,
            ownerMismatch: projectOwnerNotInTaskOwners
          }
        });
      }

      // Track project-owner relationships
      if (!projectOwnershipMap.has(projectOwner)) {
        projectOwnershipMap.set(projectOwner, []);
      }
      projectOwnershipMap.get(projectOwner).push(project.projectName);
    }

    console.log('─'.repeat(80));

    // Show manager project distribution
    console.log('\n📈 MANAGER PROJECT DISTRIBUTION:\n');
    console.log('Manager Name           | Project Count | Projects');
    console.log('─'.repeat(70));

    for (const [managerName, projectNames] of projectOwnershipMap.entries()) {
      const managerStr = managerName.substring(0, 20).padEnd(20);
      const countStr = projectNames.length.toString().padEnd(12);
      const projectsStr = projectNames.join(', ');
      console.log(`${managerStr} | ${countStr} | ${projectsStr}`);
    }

    // Report inconsistencies
    console.log(`\n⚠️  INCONSISTENCIES FOUND: ${inconsistentProjects.length}\n`);

    if (inconsistentProjects.length > 0) {
      console.log('🚨 DETAILED INCONSISTENCY REPORT:\n');
      
      inconsistentProjects.forEach((item, index) => {
        console.log(`${index + 1}. Project: "${item.project.projectName}"`);
        console.log(`   Project Owner: ${item.projectOwner}`);
        console.log(`   Task Owners: [${item.taskOwners.join(', ')}]`);
        
        if (item.issues.multipleTaskOwners) {
          console.log(`   ❌ Issue: Multiple task owners for single project`);
        }
        if (item.issues.ownerMismatch) {
          console.log(`   ❌ Issue: Project owner not among task owners`);
        }
        
        console.log('');
      });

      return inconsistentProjects;
    } else {
      console.log('✅ No ownership inconsistencies found!');
      console.log('All projects are properly assigned to single managers.');
      return [];
    }

  } catch (error) {
    console.error('❌ Error analyzing project ownership:', error);
    return null;
  }
}

async function fixProjectOwnership(inconsistentProjects) {
  try {
    console.log('🔧 FIXING PROJECT OWNERSHIP INCONSISTENCIES...\n');

    const fixes = [];

    for (const item of inconsistentProjects) {
      const project = item.project;
      const projectOwner = project.owner?.fullName;
      const taskOwners = item.taskOwners;

      console.log(`📝 Fixing: "${project.projectName}"`);
      console.log(`   Current project owner: ${projectOwner}`);
      console.log(`   Task owners: [${taskOwners.join(', ')}]`);

      // Strategy: Use the most frequent task owner as the project owner
      const projectTasks = await Task.find({ project: project._id }).populate('owner', 'fullName');
      
      if (projectTasks.length > 0) {
        // Count task owners
        const ownerCount = {};
        projectTasks.forEach(task => {
          if (task.owner && task.owner.fullName) {
            const ownerName = task.owner.fullName;
            ownerCount[ownerName] = (ownerCount[ownerName] || 0) + 1;
          }
        });

        // Find the owner with most tasks
        let dominantOwner = null;
        let maxCount = 0;
        
        for (const [ownerName, count] of Object.entries(ownerCount)) {
          if (count > maxCount) {
            maxCount = count;
            dominantOwner = ownerName;
          }
        }

        if (dominantOwner && dominantOwner !== projectOwner) {
          // Find the user object for the dominant owner
          const newOwnerUser = await User.findOne({ fullName: dominantOwner });
          
          if (newOwnerUser) {
            console.log(`   🎯 Solution: Assign project to "${dominantOwner}" (${maxCount}/${projectTasks.length} tasks)`);
            
            // Update project owner
            await Project.findByIdAndUpdate(project._id, { owner: newOwnerUser._id });
            
            fixes.push({
              projectName: project.projectName,
              oldOwner: projectOwner,
              newOwner: dominantOwner,
              taskCount: maxCount,
              totalTasks: projectTasks.length
            });

            console.log(`   ✅ Updated project owner from "${projectOwner}" to "${dominantOwner}"`);
          } else {
            console.log(`   ⚠️  Could not find user for "${dominantOwner}"`);
          }
        } else if (dominantOwner === projectOwner) {
          console.log(`   ✅ Project owner "${projectOwner}" is already correct (${maxCount}/${projectTasks.length} tasks)`);
        }
      }

      console.log('');
    }

    return fixes;

  } catch (error) {
    console.error('❌ Error fixing project ownership:', error);
    throw error;
  }
}

async function validateProjectOwnership() {
  try {
    console.log('✅ VALIDATING PROJECT OWNERSHIP AFTER FIXES...\n');

    const projects = await Project.find().populate('owner', 'fullName');
    const tasks = await Task.find()
      .populate('owner', 'fullName')
      .populate('project', 'projectName');

    let allValid = true;
    const summary = {
      totalProjects: projects.length,
      projectsWithSingleOwner: 0,
      projectsWithMultipleTaskOwners: 0,
      projectsWithNoTasks: 0
    };

    console.log('📊 VALIDATION RESULTS:\n');
    console.log('Project Name                    | Owner         | Task Owners | Status');
    console.log('─'.repeat(75));

    for (const project of projects) {
      const projectName = project.projectName.substring(0, 30).padEnd(30);
      const projectOwner = project.owner?.fullName || 'NO OWNER';
      
      const projectTasks = tasks.filter(task => 
        task.project && task.project._id.toString() === project._id.toString()
      );

      const uniqueTaskOwners = [...new Set(
        projectTasks
          .filter(task => task.owner)
          .map(task => task.owner.fullName)
      )];

      const ownerStr = projectOwner.substring(0, 13).padEnd(13);
      const taskOwnersStr = uniqueTaskOwners.length > 0 ? uniqueTaskOwners.length.toString() : '0';
      
      let status = '';
      if (projectTasks.length === 0) {
        status = '⚠️  NO TASKS';
        summary.projectsWithNoTasks++;
      } else if (uniqueTaskOwners.length === 1 && uniqueTaskOwners[0] === projectOwner) {
        status = '✅ VALID';
        summary.projectsWithSingleOwner++;
      } else if (uniqueTaskOwners.length > 1) {
        status = '❌ MULTIPLE';
        summary.projectsWithMultipleTaskOwners++;
        allValid = false;
      } else {
        status = '⚠️  MISMATCH';
        allValid = false;
      }

      console.log(`${projectName} | ${ownerStr} | ${taskOwnersStr.padEnd(11)} | ${status}`);
    }

    console.log('─'.repeat(75));
    console.log(`\n📈 SUMMARY:`);
    console.log(`• Total projects: ${summary.totalProjects}`);
    console.log(`• Projects with single owner: ${summary.projectsWithSingleOwner}`);
    console.log(`• Projects with multiple task owners: ${summary.projectsWithMultipleTaskOwners}`);
    console.log(`• Projects with no tasks: ${summary.projectsWithNoTasks}`);

    if (allValid) {
      console.log('\n🎉 SUCCESS! All projects are now properly assigned to single managers!');
    } else {
      console.log('\n⚠️  Some issues remain. Manual review may be needed.');
    }

    return { allValid, summary };

  } catch (error) {
    console.error('❌ Error validating project ownership:', error);
    throw error;
  }
}

async function ensureSingleProjectOwnership() {
  try {
    console.log('🎯 ENSURING SINGLE PROJECT OWNERSHIP...\n');

    // Step 1: Analyze current state
    const inconsistentProjects = await analyzeProjectOwnership();
    
    if (inconsistentProjects === null) {
      console.log('❌ Analysis failed. Aborting.');
      return;
    }

    if (inconsistentProjects.length === 0) {
      console.log('✅ No fixes needed. All projects already have single ownership.');
      await validateProjectOwnership();
      return;
    }

    // Step 2: Fix inconsistencies
    console.log('\n' + '='.repeat(80));
    const fixes = await fixProjectOwnership(inconsistentProjects);

    // Step 3: Validate fixes
    console.log('\n' + '='.repeat(80));
    const validation = await validateProjectOwnership();

    // Step 4: Summary
    console.log('\n' + '='.repeat(80));
    console.log('📋 OPERATION SUMMARY:');
    console.log(`• Inconsistencies found: ${inconsistentProjects.length}`);
    console.log(`• Fixes applied: ${fixes.length}`);
    console.log(`• Final validation: ${validation.allValid ? 'PASSED' : 'FAILED'}`);

    if (fixes.length > 0) {
      console.log('\n📝 CHANGES MADE:');
      fixes.forEach((fix, index) => {
        console.log(`${index + 1}. "${fix.projectName}": ${fix.oldOwner} → ${fix.newOwner} (${fix.taskCount}/${fix.totalTasks} tasks)`);
      });
    }

  } catch (error) {
    console.error('❌ Error ensuring single project ownership:', error);
  } finally {
    mongoose.connection.close();
  }
}

ensureSingleProjectOwnership();