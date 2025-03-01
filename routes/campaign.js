const express = require("express");
const router = express.Router();
const ctrl = require("../controllers");
const { verify } = require("../middleware/auth"); // Import authentication middleware

// Get all campaigns
router.get("/all", ctrl.campaign.showAll);

// Get a specific campaign by ID
router.get("/:id", ctrl.campaign.show);

// Create a new campaign (protected route)
router.post("/", verify, ctrl.campaign.createCampaign);

// Update an existing campaign (protected route)
router.put("/:id", verify, ctrl.campaign.updateCampaign);

// Delete a campaign (protected route)
router.delete("/:id", verify, ctrl.campaign.deleteCampaign);

// Filter campaigns by minimum required amount
router.get("/filter", ctrl.campaign.filterByAmount);

module.exports = router;
