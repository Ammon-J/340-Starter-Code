// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const regValidate = require('../utilities/account-validation')
const utilities = require("../utilities")


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))

router.get("/errors/error:error", utilities.handleErrors(invController.error))

router.get("/errors/error500:error", utilities.handleErrors(invController.error500))

module.exports = router;
