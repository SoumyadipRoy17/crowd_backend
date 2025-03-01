const express = require("express");
const router = express.Router();
const ctrl = require("../controllers");
const { verify } = require("../middleware/auth"); // Import authentication middleware

// Get details of a specific donation by ID
router.get("/success/:id", ctrl.donation.details);

// Get all donations (protected route)
router.get("/all", verify, ctrl.donation.getAllDonations);

// Create a new donation
router.post("/", ctrl.donation.createDonation);

// Update a donation (protected route)
router.put("/:id", verify, ctrl.donation.updateDonation);

// Delete a donation (protected route)
router.delete("/:id", verify, ctrl.donation.deleteDonation);

module.exports = router;
