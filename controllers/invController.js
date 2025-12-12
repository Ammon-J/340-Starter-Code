const inventoryModel = require("../models/inventory-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

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

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationListWithInv() 
  res.render("./inventory/management", {
    title: "Manage Inventory",
    nav,
    classificationSelect,
    errors: null
  })
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id && invData.length > 0) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClass = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

/* ***************************
 *  Add Classification
 * ************************** */
invCont.addClass = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const classResult = await inventoryModel.addClass(classification_name)

  if (classResult) {
    req.flash(
      "notice",
      `Congratulations,  the class ${classification_name} is now waiting for approval!`
    )

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

/* ***************************
 *  Build add inventory view
 * ************************** */
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

/* ***************************
 *  Add Inventory Item
 * ************************** */
invCont.AddInventory = async function (req, res, next) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let nav = await utilities.getNav()
  let grid = await utilities.buildClassificationList()
  
  const inventoryResult = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

  if (inventoryResult) {
    req.flash(
      "notice",
      `Congratulations, ${inv_make + " " + inv_model} is now waiting for approval!`
    )
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

/* ***************************
  *  Build approval view
  * ************************** */
invCont.buildApproval = async function (req, res, next) {
  const jwt_token = res.locals.accountData
   res.locals.user = jwt_token
  let nav = await utilities.getNav()
  let unapprovedInventory = await utilities.buildInventoryApprovalGrid()
  let unapprovedClasses = await utilities.buildClassificationApprovalGrid(jwt_token)
  res.render("./inventory/approval", {
    title: "Approve Inventory",
    nav,
    unapprovedInventory,
    unapprovedClasses,
    errors: null
  })
}


/* ***************************
  *  Approve Inventory Item 
  * ************************** */
invCont.approveInventory = async function (req, res, next) {
  const jwt_token = res.locals.accountData
   res.locals.user = jwt_token
  const { inv_id } = req.body
  const invClass = await invModel.getClassByInvId(inv_id)
  let approveResult = false
  if(invClass.length == 0){
    req.flash(
      "error",
      `The vehicle's classification does not exist.`
    )
    res.redirect("/inv/approval")
    return
  }
  else if (invClass.length == 1 && invClass[0].classification_approved == true){
    let currDate = new Date();
    approveResult = await invModel.approveInventory(inv_id, jwt_token.account_id, currDate)
  } else {
    req.flash(
      "error", 
      `The vehicle's classification must be approved first.`
    )
    res.redirect("/inv/approval")
    return
  }

  if (approveResult) {
    req.flash(
      "notice", 
      `The vehicle was successfully approved.`
    )
    // Refresh all of the data on the page
    let nav = await utilities.getNav()
    let unapprovedInventory = await utilities.buildInventoryApprovalGrid()
    let unapprovedClasses = await utilities.buildClassificationApprovalGrid(jwt_token)
    res.render("./inventory/approval", {
    title: "Approve Inventory",
    nav,
    unapprovedInventory,
    unapprovedClasses,
    errors: null
  })
  } else {
    req.flash(
      "notice",   
      "Sorry, the approval failed."
    )
    res.redirect("/inv/approval")
  }
} 

/* ***************************
  *  Delete Inventory Item/Approval
  * ************************** */
invCont.deleteInvApproval = async function (req, res, next) {
  const jwt_token = res.locals.accountData
   res.locals.user = jwt_token
  const { inv_id } = req.body
  const deleteResult = await invModel.deleteInventoryItem(inv_id)
  if (deleteResult) { 
    req.flash(
      "notice",
      `The vehicle was successfully deleted.`
    )   
    // Refresh all of the data on the page
    let nav = await utilities.getNav()
    let unapprovedInventory = await utilities.buildInventoryApprovalGrid()
    let unapprovedClasses = await utilities.buildClassificationApprovalGrid(jwt_token)
    res.render("./inventory/approval", {  
    title: "Approve Inventory",
    nav,
    unapprovedInventory,
    unapprovedClasses,
    errors: null
  })
  } else {
    req.flash(
      "notice", 
      "Sorry, the deletion failed."
    )
    res.redirect("/inv/approval")
  }
}

/* ***************************
  *  Approve Classification
  * ************************** */
invCont.approveClassification = async function (req, res, next) {
  const jwt_token = res.locals.accountData
   res.locals.user = jwt_token
  const { classification_id, user_id } = req.body
  let currDate = new Date();
  const approveResult = await invModel.approveClass(classification_id, user_id, currDate)
  if (approveResult) {
    req.flash(
      "notice",
      `The classification was successfully approved.`
    )
    // Refresh all of the data on the page
    let nav = await utilities.getNav()
    let unapprovedInventory = await utilities.buildInventoryApprovalGrid()
    let unapprovedClasses = await utilities.buildClassificationApprovalGrid(jwt_token)
    res.render("./inventory/approval", {
    title: "Approve Inventory",
    nav,
    unapprovedInventory,
    unapprovedClasses,
    errors: null
  })
  } else {
    req.flash(
      "notice",
      "Sorry, the approval failed."
    )
    res.redirect("/inv/approval")
  } 
}

/* ***************************
  *  Delete Classification
  * ************************** */
invCont.deleteClassApproval = async function (req, res, next) {
  const jwt_token = res.locals.accountData
   res.locals.user = jwt_token
  const { classification_id } = req.body
  const deleteResult = await invModel.deleteClassItem(classification_id)
  if (deleteResult) {
    req.flash(
      "notice",
      `The classification was successfully deleted.`
    )
    // Refresh all of the data on the page
    let nav = await utilities.getNav()
    let unapprovedInventory = await utilities.buildInventoryApprovalGrid()
    let unapprovedClasses = await utilities.buildClassificationApprovalGrid(jwt_token)
    res.render("./inventory/approval", {
    title: "Approve Inventory",
    nav,
    unapprovedInventory,
    unapprovedClasses,
    errors: null
  })
  } else {
    req.flash(
      "error", 
      "Cannot delete classification: Inventory items are associated with this classification. Please delete associated inventory items first."
    )
    res.redirect("/inv/approval")
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getItemByInvId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id, 
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
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id, 
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
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
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getItemByInvId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/delete-inventory", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id, 
    inv_make, 
    inv_model, 
    inv_year, 
    inv_price
  } = req.body
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    const itemName = deleteResult.inv_make + " " + deleteResult.inv_model
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-inventory", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price
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