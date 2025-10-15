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

invCont.error500 = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./errors/error500", {
    title: '500 error',
    nav
  })
}