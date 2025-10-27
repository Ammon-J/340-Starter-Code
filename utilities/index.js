const invModel = require("../models/inventory-model")
const accModel = require("../models/account-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul class="nav-ul">'
  list += '<li><a style="text-decoration: none; color: white;" href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a style="text-decoration: none; color: white;"  href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
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
 * Constructs the nav HTML unordered list
 ************************** */
Util.buildLoginGrid = async function () {
  let grid = '<link rel="stylesheet" href="/css/background.css">'
  return grid
}

Util.buildRegisterGrid = async function() {
  let grid = '<link rel="stylesheet" href="/css/background.css">'
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util