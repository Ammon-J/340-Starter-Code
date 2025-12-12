const invModel = require("../models/inventory-model")
const accModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul class="nav-ul" style="margin-top: 0px; margin-bottom: 0px;">'
  if(data.length > 0) {
    list += '<li></li>'
    list += '<li style="width: fit-content;"><a style="text-decoration: none; color: white;" href="/" title="Home page">Home</a></li>'
    data.forEach((row) => {
      if(row.classification_approved == true){
        list += '<li style="width: fit-content;">'
        list +=
          '<a style="text-decoration: none; color: white;"  href="/inv/type/' +
          row.classification_id +
          '" title="See our inventory of ' +
          row.classification_name +
          ' vehicles">' +
          row.classification_name +
          "</a>"
        list += "</li>"
      }
    })
    list += '<li></li>'
  } else {
      list += '<li style="width: fit-content;"><a style="text-decoration: none; color: white;" href="/" title="Home page">Home</a></li>'
  }
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<hr >'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ************************
 * Build the vehicle detail view HTML
 ************************** */
Util.buildVehicleGrid = async function(data) {
  let grid;
  if(data.length == 1) {
    data.forEach(vehicle => {
    grid = '<link rel="stylesheet" href="/css/background.css">'
    grid +='<div class="main-grid"> <div class="img-contaner"><img class="thumb-img" src="' + vehicle.inv_image + '" alt="Image of '
    + vehicle.inv_make + ' ' + vehicle.inv_model +' on CSE Motors" /></div>'
    grid += '<div class="detail-grid">'
    grid += '<h1 class="detail-header">' + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details </h1>'
    grid += '<div class="container-color"><p><b>Price:</b> $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p></div>'
    grid += '<div class="container-normal"><p><b>Description:</b> ' + vehicle.inv_description + '</p></div>'
    grid += '<div class="container-color"><p><b>Color:</b> ' + vehicle.inv_color + '</p></div>'
    grid += '<div class="container-normal"><p><b>Miles:</b> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p></div>'
    grid += '</div>'
    grid += '</div>'
    })
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ************************
 * Build the inventory approval view HTML
 ************************** */
Util.buildInventoryApprovalGrid = async function() {
  let inventoryData = await invModel.getUnapprovedInventory()
  let grid;
  grid = '<div class="inventory-grid">'
  if(inventoryData.length > 0){
    inventoryData.forEach(vehicle => { 
      grid += '<div class="inv-approvals">'
      grid += '<h1>'
      grid += '<a style="color: white !important; text-decoration: none;" href="../../inv/detail/' + vehicle.inv_id +'" title="View '
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h1>' 
      grid += '<br >'
      grid += '<div class="action-forms">'
      grid += '<form style="background: transparent !important; justify-content: center; width: 100% !important; " id="approveForm' + vehicle.inv_id + '" method="post" action="../../inv/invApproval">'
      grid += '<button class="approve-btn" type="submit">Approve Vehicle</button>'
      grid += '<input type="hidden" name="inv_id" value="' + vehicle.inv_id + '"/>'
      grid += '</form>'
      grid += '<form style="background: transparent !important; justify-content: center; width: 100% !important; " id="unApproveForm' + vehicle.inv_id + '" method="post" action="../../inv/deleteInvApproval">'
      grid += '<button class="delete-btn" type="submit">Delete Vehicle</button>'
      grid += '<input type="hidden" name="inv_id" value="' + vehicle.inv_id + '"/>'
      grid += '</form>'
      grid += '</div>'
      grid += '</div>'
    })
  } else { 
    grid += '<p class="notice">There are no vehicles pending approval.</p>'
  }
    grid += '</div>'
  return grid
}

/* ************************
 * Build the classification approval view HTML
 ************************** */
Util.buildClassificationApprovalGrid = async function(jwt_token) {
  let classData = await invModel.getUnapprovedClasses()
  let grid;
  grid = '<div class="classification-grid">'
  if(classData.length > 0){
    classData.forEach(classification => {
      grid += '<div class="inv-approvals">'
      grid += '<h1>' + classification.classification_name + '</h1>' 
      grid += '<br >'
      grid += '<div class="action-forms">'
      grid += '<form style="background: transparent !important; justify-content: center; width: 100% !important; " id="approveForm' + classification.classification_id + '" method="post" action="../../inv/classApproval">'
      grid += '<button class="approve-btn" type="submit">Approve Class</button>'
      grid += '<input type="hidden" name="classification_id" value="' + classification.classification_id + '"/>'
      grid += '<input type="hidden" name="user_id" value="'+ jwt_token.account_id + '"/>'
      grid += '</form>'
      grid += '<form style="background: transparent !important; justify-content: center; width: 100% !important; " id="unApproveForm' + classification.classification_id + '" method="post" action="../../inv/deleteClassApproval">'
      grid += '<button class="delete-btn" type="submit">Delete Class</button>'
      grid += '<input type="hidden" name="classification_id" value="' + classification.classification_id + '"/>'
      grid += '</form>'
      grid += '</div>'
      grid += '</div>'
    })
  } else {
    grid += '<p class="notice">There are no classifications pending approval.</p>'
  }
  grid += '</div>'
  return grid
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.buildLoginGrid = async function () {
  let grid = '<link rel="stylesheet" href="/css/background.css">'
  return grid
}

/* ************************
 * Build the account management view HTML
 ************************** */
Util.buildAccountManagementrGrid = async function(token) {
  let grid= '<h1 class="main-header">Welcome Back ' + token.account_firstname + '!</h1>';
  grid += '<div class="management-links">'

  if(token.account_type == "Admin" || token.account_type == "Employee") {
    grid += ' <a href="/inv">Inventory Management</a>'
  }

  if(token.account_type == "Admin") {
    grid += ' <a href="/inv/approval">Approvals</a>'
  }

  grid += '<a href="/account/update/' + token.account_id + '">Update Account</a>'
  grid += '</div>'

  return grid
}

/* ************************
 * Build the classification select list
 * ************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getApprovedClassifications() // Add the ability to add a new vehicle to approved classifications even without at least one vehicle attached
    let classificationList = '<label for="classificationList">Choose a class:</label><br>'
    classificationList += '<select name="classification_id" id="classificationList" required>'
    if(data.length > 0) {
      classificationList += "<option value=''>Choose a Classification</option>"
      data.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
          classification_id != null &&
          row.classification_id == classification_id
        ) {
          classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
      })
      classificationList += "</select>"
    } else {
      classificationList += "<option value=''>No Classifications Found</option></select>"
    }
    return classificationList
}

/* ************************
 * Build the classification select list with only approved classifications with at least one vehicle
 * ************************** */
Util.buildClassificationListWithInv = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList = '<label for="classificationList">Choose a class:</label><br>'
    classificationList += '<select name="classification_id" id="classificationList" required>'
    if(data.length > 0) {
      classificationList += "<option value=''>Choose a Classification</option>"
      data.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
          classification_id != null &&
          row.classification_id == classification_id
        ) {
          classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
      })
      classificationList += "</select>"
    } else {
      classificationList += "<option value=''>No Classifications Found</option></select>"
    }
    return classificationList
}

  /* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 Util.CheckRole = (req, res, next) => {
   const jwt_token = res.locals.accountData
   res.locals.user = jwt_token
  if (jwt_token.account_type == "Admin" || jwt_token.account_type == "Employee") {
    next()
  } else {
    req.flash("notice", "You do not have permission to access that page.")
    return res.redirect("/account/account-error")
  }
}

Util.CheckAdmin = (req, res, next) => {
  const jwt_token = res.locals.accountData
  res.locals.user = jwt_token
  if (jwt_token.account_type == "Admin") {
    next()
  } else {
    req.flash("notice", "You do not have permission to access that page.")
    return res.redirect("/account/account-error")
  }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util