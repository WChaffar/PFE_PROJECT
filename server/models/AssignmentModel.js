const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// Declare the Schema of the Mongo model
const AssignmentSchema = new mongoose.Schema({
    Owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          return value >= this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    assignmentType: {
      type: String,
      required: true,
      enum: ['enduring - long period', 'short-term', 'temporary', 'full-time'],
      default: 'enduring - long period'
    },
    totalDays: {
      type: Number,
      required: true,
      min: [0.5, 'Minimum 0.5 day assignment'],
      max: [365, 'Maximum 1 year assignment']
    },
    dayDetails: [{
      date: {
        type: Date,
        required: true
      },
      period: {
        type: String,
        required: true,
        enum: ['morning', 'afternoon']
      }
    }],
    status: {
      type: String,
      enum: ['draft', 'assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'draft'
    },
    skillMatchScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    recommendations: {
      type: String,
      trim: true
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  // Indexes for performance
  AssignmentSchema.index({ employee: 1, status: 1 });
  AssignmentSchema.index({ project: 1, status: 1 });
  AssignmentSchema.index({ startDate: 1, endDate: 1 });
  
  // Virtual for assignment duration in days
  AssignmentSchema.virtual('durationDays').get(function() {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  });
  
  // Pre-save hook to calculate totalDays if dayDetails are provided
  AssignmentSchema.pre('save', function(next) {
    if (this.dayDetails && this.dayDetails.length > 0) {
      this.totalDays = this.dayDetails.length * 0.5; // Each half-day counts as 0.5
    }
    next();
  });
  
  module.exports = mongoose.model('Assignment', AssignmentSchema);
