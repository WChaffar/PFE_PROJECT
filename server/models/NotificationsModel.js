const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
  responsibleId: { type: Schema.Types.ObjectId, ref: 'User' },
});


const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
