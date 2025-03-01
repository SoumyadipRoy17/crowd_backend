const db = require("../models");

const details = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Invalid Donation ID format" });
    }

    const donationDetails = await db.Donation.findById(id);

    if (!donationDetails) {
      return res.status(404).json({ message: "Donation not found" });
    }

    console.log("Thanks for payment!!");
    return res.status(200).json(donationDetails);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error retrieving donation details" });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await db.Donation.find({}).sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching donations" });
  }
};

const createDonation = async (req, res) => {
  try {
    const { donorName, amount, transactionID, campaignId } = req.body;

    const newDonation = new db.Donation({
      donorName,
      amount,
      transactionID,
      campaignId,
    });

    await newDonation.save();
    return res.status(201).json(newDonation);
  } catch (err) {
    return res.status(500).json({ message: "Error creating donation" });
  }
};

const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedDonation = await db.Donation.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedDonation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json(updatedDonation);
  } catch (err) {
    return res.status(500).json({ message: "Error updating donation" });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDonation = await db.Donation.findByIdAndDelete(id);

    if (!deletedDonation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json({ message: "Donation deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting donation" });
  }
};

module.exports = {
  details,
  getAllDonations,
  createDonation,
  updateDonation,
  deleteDonation,
};
