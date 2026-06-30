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
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the PDF generation stream directly into the HTTP response object
    doc.pipe(res);

    // Design the PDF Content Layout
    
    // --- HEADER SECTION ---
    // ==========================================
// 🌐 EXACT REACT LOGO IN PDFKIT
// ==========================================

const startX = 40;
const startY = 40;

// 1. Outer Tech Circles (with specific opacity and dashes)
doc.save(); // Save state before changing opacities so text isn't affected later
doc.circle(startX + 50, startY + 50, 42)
   .lineWidth(4)
   .strokeColor('#3b82f6')
   .opacity(0.6)
   .dash(6, { space: 6 })
   .stroke();

doc.circle(startX + 50, startY + 50, 35)
   .lineWidth(2)
   .strokeColor('#2563eb')
   .opacity(0.4)
   .undash() // clear the dash for the inner circle
   .stroke();
doc.restore(); // Restore canvas to full opacity 1.0

// 2. Digital Nodes / Tech Pixels
doc.circle(startX + 50, startY + 12, 3).fill('#60a5fa');
doc.circle(startX + 50, startY + 88, 3).fill('#60a5fa');
doc.circle(startX + 12, startY + 50, 3).fill('#60a5fa');
doc.circle(startX + 88, startY + 50, 3).fill('#60a5fa');

// 3. The Medical Cross with Linear Gradient
// Create the exact gradient mapping from (20,20) to (80,80) just like your SVG <defs>
const crossGradient = doc.linearGradient(startX + 20, startY + 20, startX + 80, startY + 80);
crossGradient.stop(0, '#3b82f6'); // Vibrant Blue
crossGradient.stop(1, '#10b981'); // Emerald Green

doc.save()
   .translate(startX, startY)
   .path("M40 25C40 22.2386 42.2386 20 45 20H55C57.7614 20 60 22.2386 60 25V40H75C77.7614 40 80 42.2386 80 45V55C80 57.7614 77.7614 60 75 60H60V75C60 57.7614 57.7614 80 55 80H45C42.2386 80 40 77.7614 40 75V60H25C22.2386 60 20 57.7614 20 55V45C20 42.2386 22.2386 40 25 40H40V25Z")
   .fill(crossGradient)
   .restore();

// 4. Digital Heartbeat / Pulsing EKG Line
doc.save()
   .translate(startX, startY)
   .path("M25 50H38L43 35L49 65L55 45L59 53L63 50H75")
   .lineWidth(3.5)
   .lineCap('round')
   .lineJoin('round')
   .stroke('#ffffff')
   .restore();

// ==========================================
// ✍️ TYPOGRAPHY ALIGNED TO LOGO GEOMETRY
// ==========================================
doc.fillColor('#0f172a')
   .font('Helvetica-Bold')
   .fontSize(24)
   .text("Book N'", 160, 75, { continued: true })
   .fillColor('#10b981')
   .text(" Appointment");

doc.fillColor('#64748b')
   .font('Helvetica-Bold')
   .fontSize(8)
   .text('CONNECTED CLINICAL ECOSYSTEM', 162, 108, { characterSpacing: 1.5 });

// Structural separator bar beneath the branded header area
doc.moveTo(20, 160)
   .lineTo(590, 160)
   .lineWidth(1)
   .stroke('#e2e8f0');

// Reset cursor for the rest of the document
doc.x = 40;
doc.y = 190;
doc.fillColor('#334155').font('Helvetica').fontSize(11);
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
    // Inside your doc layout generation block in GET /:id/receipt:
    if (appointment.status === 'completed') {
      doc.moveDown();
      doc.fillColor('#2F855A').fontSize(12).text('DOCTOR CLOSING REMARKS & PRESCRIPTION', { underline: true });
      doc.fillColor('#2D3748').fontSize(11).text(`Notes: ${appointment.comments}`);
}
    
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
// @route   GET api/appointments/patient/history
// @desc    Get all past completed appointments for the logged-in patient
// @access  Private (Patient only)
router.get('/patient/history', authMiddleware, async (req, res) => {
  try {
    const history = await Appointment.find({ patientId: req.user.id, status: 'completed' })
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 }); // Newest first
    res.json(history);
  } catch (error) {
    res.status(500).send('Server Error fetching patient history');
  }
});

// @route   GET api/appointments/doctor/history
// @desc    Get all past completed appointments for the logged-in doctor
// @access  Private (Doctor only)
router.get('/doctor/history', authMiddleware, async (req, res) => {
  try {
    const history = await Appointment.find({ doctorId: req.user.id, status: 'completed' })
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).send('Server Error fetching doctor history');
  }
});

module.exports = router;