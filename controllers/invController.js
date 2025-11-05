const inventoryModel = require("../models/inventory-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name 
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

module.exports = invCont

/* ***************************
 *  Build inventory by id view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getItemByClassificationId(inv_id)
  const grid = await utilities.buildVehicleGrid(data)
  let nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: data[0].inv_year + ' ' + data[0].inv_make + ' ' + data[0].inv_model,
    nav,
    grid,
  })
}

module.exports = invCont

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Manage Inventory",
    nav,
    errors: null
  })
}

invCont.buildAddClass = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

invCont.addClass = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const classResult = await inventoryModel.addClass(classification_name)

  if (classResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve added the class ${classification_name}!`
    )

    nav = await utilities.getNav() // Refresh the nav
    res.status(201).render("inventory/add-classification", { 
      title: "Add Class",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Class",
      nav,
      error:null
    })
  }
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let grid = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    grid,
    errors: null
  })
}

invCont.AddInventory = async function (req, res, next) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let nav = await utilities.getNav()
  let grid = await utilities.buildClassificationList(classification_id)
  
  const inventoryResult = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

  if (inventoryResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve successfully added ${inv_make + " " + inv_model}!`
    )

    nav = await utilities.getNav() // Refresh the nav
    res.status(201).render("inventory/add-inventory", { 
      title: "Add Class",
      nav,
      grid,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, adding the new vehicle failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      grid,
      error:null
    })
  }
}

invCont.error500 = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./errors/error500", {
    title: '500 error',
    nav
  })
}
module.exports = invCont

invCont.error = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./errors/error", {
    title: '404 error',
    nav
  })
}

module.exports = invCont