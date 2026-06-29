const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['OPD', 'Surgery'],
      required: true,
    },
    type: {
      type: String,
      enum: ['regular', 'emergency'],
      default: 'regular',
    },
    purposeOfVisit: {
      type: String,
      required: [true, 'Please specify the purpose of your visit'],
      trim: true,
    },
    date: {
      type: String, 
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['booked', 'completed', 'cancelled'],
      default: 'booked',
    },
    comments: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);