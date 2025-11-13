// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const classValidate = require('../utilities/inventory-validation')
const utilities = require("../utilities")


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))

router.get("/", utilities.handleErrors(invController.buildManagement))

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get("/edit/:invId", utilities.handleErrors(invController.editInventoryView))

router.post("/update/", 
  classValidate.inventoryEditRules(),
  classValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get("/add-classification", utilities.handleErrors(invController.buildAddClass))

router.post(
  "/add-classification",
  classValidate.classRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addClass))

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

router.post("/add-inventory",
    classValidate.inventoryRules(),
    classValidate.checkInventoryData,
    utilities.handleErrors(invController.AddInventory)
)

router.get("/delete/:invId", utilities.handleErrors(invController.buildDeleteInventory))

router.post("/delete/", utilities.handleErrors(invController.deleteInventory))

router.get("/errors/error:error", utilities.handleErrors(invController.error))

router.get("/errors/error500:error", utilities.handleErrors(invController.error500))

module.exports = router;
