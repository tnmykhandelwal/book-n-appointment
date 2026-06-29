const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/book', authMiddleware, async (req, res) => {
  // Security Check: Ensure only patients can book an appointment
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Access Denied. Only patients can book appointments.' });
  }

  try {
    const { doctorId, appointmentType, type, purposeOfVisit, date, timeSlot } = req.body;
    const patientId = req.user.id; // Extracted from JWT token by authMiddleware

    //Time Slot and Cap Validation
    if (appointmentType === 'OPD') {
      // Rule Check: Total appointments a doctor can have for OPD in a day is capped at 10
      const totalOPDForDay = await Appointment.countDocuments({ doctorId, date, appointmentType: 'OPD', status: 'booked' });
      if (totalOPDForDay >= 10) {
        return res.status(400).json({ message: 'This doctor has reached the maximum capacity of 10 OPD appointments for this day.' });
      }
    } else if (appointmentType === 'Surgery') {
      // Rule Check: Total surgeries a doctor can perform in a day is capped at 2
      const totalSurgeriesForDay = await Appointment.countDocuments({ doctorId, date, appointmentType: 'Surgery', status: 'booked' });
      if (totalSurgeriesForDay >= 2) {
        return res.status(400).json({ message: 'This doctor has reached the maximum limit of 2 surgeries for this day.' });
      }
    }

    //Prevent Double-Booking (Check if exact time slot is already taken for this doctor)
    const slotTaken = await Appointment.findOne({ doctorId, date, timeSlot, status: 'booked' });
    if (slotTaken) {
      return res.status(400).json({ message: 'This time slot is already booked. Please choose a different timing.' });
    }

    //Create and Save the Appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      appointmentType,
      type,
      purposeOfVisit,
      date,
      timeSlot
    });

    const appointment = await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully!', appointment });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error during appointment booking');
  }
});


router.get('/today', authMiddleware, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access Denied. Only doctors can view their daily schedule.' });
  }

  try {
    const doctorId = req.user.id;
    
    const todayStr = new Date().toISOString().split('T')[0]; 

    const schedule = await Appointment.find({ doctorId, date: todayStr, status: 'booked' })
      .populate('patientId', 'name email') 
      .sort({ timeSlot: 1 }); // Sort chronologically

    res.json(schedule);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error while fetching daily schedule');
  }
});

router.put('/:id/complete', authMiddleware, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access Denied.' });
  }

  try {
    const { comments } = req.body;

    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify this doctor actually owns this appointment record
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized action.' });
    }

    // Update fields
    appointment.status = 'completed';
    appointment.comments = comments || 'No additional comments.';

    await appointment.save();
    res.json({ message: 'Patient session closed and logged successfully.', appointment });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error during session completion');
  }
});

const PDFDocument = require('pdfkit');

// @route   GET api/appointments/:id/receipt
// @desc    Generate and auto-download PDF receipt for a specific appointment
// @access  Private (Only the patient who booked it)
router.get('/:id/receipt', authMiddleware, async (req, res) => {
  try {
    // Fetch the appointment and populate Doctor & Patient details
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Security Check: Ensure the logged-in user is the patient who owns this appointment
    if (appointment.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to download this receipt' });
    }

    // Initialize a PDF Document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set the response headers so the browser triggers an automatic download
    const filename = `Receipt-${appointment._id}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the PDF generation stream directly into the HTTP response object
    doc.pipe(res);

    // Design the PDF Content Layout
    
    // --- HEADER SECTION ---
    doc.fillColor('#1A365D') // Deep blue branding color
       .fontSize(24)
       .text("BOOK N' APPOINTMENT", { align: 'center', bolds: true });
    
    doc.fontSize(10)
       .fillColor('#718096')
       .text('Digital Medical Appointment Booking Slip', { align: 'center' });
    
    doc.moveDown(1.5);
    
    // Draw a divider line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E2E8F0').stroke();
    doc.moveDown(1.5);

    // --- APPOINTMENT SUMMARY CARDS ---
    doc.fillColor('#2D3748').fontSize(14).text('Appointment Status: Confirmed', { bolds: true });
    doc.fontSize(10).fillColor('#718096').text(`Slip ID: ${appointment._id}`);
    doc.moveDown();

    // Patient Information Block
    doc.fillColor('#1A365D').fontSize(12).text('PATIENT DETAILS', { underline: true });
    doc.fillColor('#2D3748').fontSize(11);
    doc.text(`Name:  ${appointment.patientId.name}`);
    doc.text(`Email: ${appointment.patientId.email}`);
    doc.moveDown();

    // Consultation Information Block
    doc.fillColor('#1A365D').fontSize(12).text('CONSULTATION DETAILS', { underline: true });
    doc.fillColor('#2D3748').fontSize(11);
    doc.text(`Doctor Name:     Dr. ${appointment.doctorId.name}`);
    doc.text(`Specialization:  ${appointment.doctorId.specialization || 'General Physician'}`);
    doc.text(`Department:      ${appointment.appointmentType} (${appointment.type.toUpperCase()})`);
    doc.text(`Scheduled Date:  ${appointment.date}`);
    doc.text(`Assigned Slot:   ${appointment.timeSlot}`);
    doc.text(`Purpose:         ${appointment.purposeOfVisit}`);
    
    doc.moveDown(2);

    // --- FOOTER & COMPLIANCE ---
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E2E8F0').stroke();
    doc.moveDown(1.5);

    doc.fillColor('#E53E3E') // Red accent color for warnings
       .fontSize(10)
       .text('IMPORTANT INSTRUCTIONS FOR PATIENTS:', { bolds: true });
    
    doc.fillColor('#4A5568')
       .text('1. Please print this slip or keep the soft copy ready on your mobile device.')
       .text('2. Arrive at least 15 minutes prior to your designated timeslot to avoid cancellations.')
       .text('3. In case of emergencies, your slot timing may drift slightly based on active surgeries.');

    doc.moveDown(3);
    doc.fontSize(9).fillColor('#A0AEC0').text('Thank you for using Book N\' Appointment platform.', { align: 'center', italic: true });

    // Finalize the file creation stream
    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error.message);
    res.status(500).send('Server Error while generating PDF receipt');
  }
});

module.exports = router;