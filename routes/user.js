const express = require("express");
const router = express.Router();
const ctrl = require("../controllers");
const mw = require("../middleware");

// Admin Management
router.post("/addAdmin", mw.auth.verify, ctrl.user.addAdmin);

// User Authentication
router.post("/login", ctrl.user.login);

// Password Management
router.post("/forgotPassword", ctrl.user.forgotPassword);
router.post("/resetPassword", ctrl.user.resetPassword);

// User CRUD Operations (Protected Routes)
router.post("/create", mw.auth.verify, ctrl.user.create);
router.put("/:id/update", mw.auth.verify, ctrl.user.update);
router.delete("/:id/delete", mw.auth.verify, ctrl.user.deleteCampaign);

module.exports = router;
