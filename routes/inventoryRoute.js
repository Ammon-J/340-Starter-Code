// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const classValidate = require('../utilities/inventory-validation')
const utilities = require("../utilities")
const { route } = require("./static")


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))

router.get("/",
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.buildManagement))

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get("/edit/:invId", 
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.editInventoryView))

router.post("/update/", 
  classValidate.inventoryEditRules(),
  classValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get("/add-classification", 
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.buildAddClass))

router.post(
  "/add-classification",
  classValidate.classRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addClass))

router.get("/add-inventory", 
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.buildAddInventory))

router.post("/add-inventory",
    classValidate.inventoryRules(),
    classValidate.checkInventoryData,
    utilities.handleErrors(invController.AddInventory))

router.get("/approval", 
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.buildApproval))

router.post("/invApproval", 
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.approveInventory))

router.post("/deleteInvApproval",
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.deleteInvApproval))

router.post("/classApproval",
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.approveClassification))

router.post("/deleteClassApproval",
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.deleteClassApproval))

router.get("/delete/:invId", 
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.buildDeleteInventory))

router.post("/delete/", 
  utilities.checkLogin,
  utilities.CheckRole,
  utilities.handleErrors(invController.deleteInventory))

router.get("/errors/error:error", utilities.handleErrors(invController.error))

router.get("/errors/error500:error", utilities.handleErrors(invController.error500))

module.exports = router;
