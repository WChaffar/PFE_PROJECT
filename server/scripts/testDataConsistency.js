// Script de test pour comparer les données getAllTeamMembersForManager vs getAllEmployeeAssignements
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

// Remplacez par un token d'authentification valide
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE';

const config = {
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const testDataConsistency = async () => {
  try {
    console.log('🔍 Testing data consistency between APIs...\n');

    // 1. Get team members for manager
    console.log('1️⃣ Fetching team members for manager...');
    const teamResponse = await axios.get(`${BASE_URL}/team/getAll/forManager`, config);
    const teamMembers = teamResponse.data;
    
    console.log(`✅ Found ${teamMembers.length} team members`);
    console.log('👥 Team members:');
    teamMembers.forEach(member => {
      console.log(`   - ${member._id}: ${member.fullName} (${member.jobTitle})`);
    });

    // 2. Get all employee assignments
    console.log('\n2️⃣ Fetching employee assignments...');
    const assignmentsResponse = await axios.get(`${BASE_URL}/assignement/getEmployeeAssignements/all`, config);
    const assignments = assignmentsResponse.data;
    
    console.log(`✅ Found ${assignments.length} assignments`);

    // 3. Extract unique employee IDs from assignments
    const assignmentEmployeeIds = [...new Set(assignments.map(a => a.employee._id))];
    console.log(`👤 Unique employees in assignments: ${assignmentEmployeeIds.length}`);
    console.log('📋 Assignment employees:');
    assignments.forEach(assignment => {
      if (assignment.employee) {
        console.log(`   - ${assignment.employee._id}: ${assignment.employee.fullName}`);
      }
    });

    // 4. Compare the two lists
    console.log('\n🔍 COMPARISON RESULTS:');
    const teamMemberIds = teamMembers.map(m => m._id);
    
    const missingInTeam = assignmentEmployeeIds.filter(id => !teamMemberIds.includes(id));
    const missingInAssignments = teamMemberIds.filter(id => !assignmentEmployeeIds.includes(id));
    
    console.log(`📊 Team members: ${teamMemberIds.length}`);
    console.log(`📊 Assignment employees: ${assignmentEmployeeIds.length}`);
    console.log(`📊 Common employees: ${teamMemberIds.filter(id => assignmentEmployeeIds.includes(id)).length}`);
    
    if (missingInTeam.length > 0) {
      console.log(`\n❌ Employees with assignments but NOT in manager's team (${missingInTeam.length}):`, missingInTeam);
    }
    
    if (missingInAssignments.length > 0) {
      console.log(`\n⚠️ Team members with NO assignments (${missingInAssignments.length}):`, missingInAssignments);
    }
    
    if (missingInTeam.length === 0 && missingInAssignments.length === 0) {
      console.log('\n✅ Perfect match! All employees are consistent between the two APIs.');
    } else {
      console.log('\n⚠️ Data inconsistency detected! This explains why assignments are not showing in the calendar.');
    }

  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data || error.message);
    console.log('\n💡 Make sure to:');
    console.log('   1. Replace YOUR_AUTH_TOKEN_HERE with a valid token');
    console.log('   2. Ensure the server is running on localhost:8000');
    console.log('   3. Login as a Manager to get proper authorization');
  }
};

testDataConsistency();