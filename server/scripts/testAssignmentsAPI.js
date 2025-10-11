// Script pour tester l'API getAllEmployeeAssignements
const axios = require('axios');

const testAPI = async () => {
  try {
    // Supposons que vous avez un token d'authentification
    const token = 'YOUR_AUTH_TOKEN_HERE'; // Remplacez par un vrai token
    
    const response = await axios.get('http://localhost:8000/api/assignement/getEmployeeAssignements/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:', response.data);
    console.log('📊 Number of assignments:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('🔍 First assignment sample:', response.data[0]);
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
};

testAPI();