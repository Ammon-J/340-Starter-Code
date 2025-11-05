const inventoryModel = require("../models/inventory-model")
const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

validate.classRules = () => {
    return [
        // valid class name is required and cannot already exist in the database
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("A valid class name is required.")
        .custom(async (classification_name) => {
        const classExists = await inventoryModel.checkExistingClass(classification_name)
        if (classExists){
            throw new Error("There is already a class with the name of " + classification_name + ". Please choose a diffrent name.")
        }
  })]
}

validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Class",
      nav,
      classification_name,
    })
    return
  }
  next()
}

validate.inventoryRules = () => {
    return [
        // valid class name is required and cannot already exist in the database
        body("classification_id")
        .escape()
        .isNumeric()
        .withMessage("Please select a Classification."),

        body("inv_make")
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage("Please enter a Make."),

        body("inv_year")
        .trim()
        .escape()
        .isLength({ min: 4, max: 5 })
        .isNumeric()
        .withMessage("Please enter a valid year."),

        body("inv_description")
        .trim()
        .escape()
        .isLength({ min: 3 })
        .withMessage("Please enter a Description."),

        body("inv_image")
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage("Please enter a Image Path."),

        body("inv_thumbnail")
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage("Please enter a Thumbnail Path."),

        body("inv_price")
        .trim()
        .escape()
        .isLength({ min: 1 })
        .isFloat()
        .withMessage("Please enter a valid Price."),

        body("inv_miles")
        .trim()
        .escape()
        .isLength({ min: 1 })
        .isFloat()
        .withMessage("Please enter a valid Mileage."),

        body("inv_color")
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage("Please enter a valid Color.")
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let grid = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
      grid,
      inv_make,
      inv_model,
      inv_year, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_miles, 
      inv_color, 
      classification_id
    })
    return
  }
  next()
}

module.exports = validate