import Doctor from '../models/Doctors.js';
import User from '../models/Users.js'; 



// upload Documents
export const uploadDocumentAsDoctor = async (req, res) => {
    try {
        const { userId } = req.params;
        const doctorId = req.user.id;
        const fileUrl = req.file.path; // Cloudinary URL

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Add the uploaded file to the user's documents
        user.documents.push({
            file: fileUrl,
            author: doctorId, // Doctor who uploaded the file
            access: [{ doctor: doctorId, accessExpiry: null }], // Doctor has access by default
        });

        await user.save();
        res.status(201).json({ message: 'File uploaded successfully', fileUrl });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


// View Doctor Profile
export const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

// Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
    const updates = req.body;

    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(req.user.id, updates, { new: true });
        if (!updatedDoctor) return res.status(404).json({ error: 'Doctor not found.' });

        res.status(200).json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};



// Add Availability Slot
export const addAvailability = async (req, res) => {
    const { availability } = req.body;

    try {
        const doctor = await Doctor.findById(req.user.id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

        doctor.availability.push(...availability);
        await doctor.save();

        res.status(200).json({ message: 'Availability added successfully.', availability: doctor.availability });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

// Update Availability Slot
export const updateAvailability = async (req, res) => {
    const { availabilityId, updatedAvailability } = req.body;

    try {
        const doctor = await Doctor.findById(req.user.id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

        const slot = doctor.availability.id(availabilityId);
        if (!slot) return res.status(404).json({ error: 'Availability slot not found.' });

        Object.assign(slot, updatedAvailability);
        await doctor.save();

        res.status(200).json({ message: 'Availability updated successfully.', availability: doctor.availability });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

// Delete Availability Slot
export const deleteAvailability = async (req, res) => {
    const { availabilityId } = req.body;

    try {
        const doctor = await Doctor.findById(req.user.id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

        doctor.availability = doctor.availability.filter(slot => slot._id.toString() !== availabilityId);
        await doctor.save();

        res.status(200).json({ message: 'Availability deleted successfully.', availability: doctor.availability });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};


// export const getSharedDocuments = async (req, res) => {
//   try {
//     console.log("Doctor ID:", req.user.id);
//     const doctor = await Doctor.findById(req.user.id).populate('sharedDocuments');
//     if (!doctor){
//         console.log("Doctor not found");
//         return res.status(404).json({ message: "Doctor not found" });
//     } 
//     console.log("Shared Documents:", doctor.sharedDocuments);
//     res.status(200).json({ sharedDocuments: doctor.sharedDocuments });
//   } catch (error) {
//     console.error("Error fetching shared documents:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };


export const getSharedDocuments = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id)
      .populate({
        path: "sharedDocuments",
        select: "fullname email documents",
        populate: {
          path: "documents",
          match: { "access.doctor": req.user.id },
          select: "fileUrl fileName accessExpiry",
        },
      });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({ sharedDocuments: doctor.sharedDocuments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
  