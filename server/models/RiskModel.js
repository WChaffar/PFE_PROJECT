const mongoose = require('mongoose');
const { Schema } = mongoose;

const riskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: false },
  name: { type: String, required: true },
  description: { type: String },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], // Enumerated severity levels
    required: true 
  },
  identificationDate: { type: Date, default: Date.now },
  responsibleId: { type: Schema.Types.ObjectId, ref: 'User' }, // Array for multiple responsible users
});

// Export the model
const Risk = mongoose.model('Risk', riskSchema);

module.exports = Risk;
