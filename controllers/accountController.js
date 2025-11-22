const accountModel = require("../models/account-model")
const Util = require("../utilities")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { error } = require("./invController")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
 async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  let grid = await utilities.buildLoginGrid()
  res.render("account/login", {
    title: "Login",
    nav,
    grid,
    errors: null,
  })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) { // Why isn't the grid showing up?
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  let grid = utilities.buildLoginGrid()
  const { account_firstname, account_lastname, account_email, account_password } = req.body 

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", { 
      title: "Login",
      nav,
      grid,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const jwt_token = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
  let grid = await utilities.buildAccountManagementrGrid(jwt_token)
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    grid,
    errors: null,
  })
}

// Deliver account update view
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const jwt_token = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
  res.render("account/update", {
    title: "Account Update",
    nav,
    errors: null,
    account_id: jwt_token.account_id,
    account_firstname: jwt_token.account_firstname,
    account_lastname: jwt_token.account_lastname,
    account_email: jwt_token.account_email,
  })
}

async function updateAccountInfo(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )
  if (updateResult) {
    const accountData = await accountModel.getAccountByEmail(account_email)
    delete accountData.account_password
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    req.flash(
      "notice",
      `Congratulations, your account has been updated ${account_firstname}.`
    )
    res.status(201).redirect("/account")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", { 
      title: "Account Update",
      nav,
      errors: null, 
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
*  Process password update
* *************************************** */
async function updateAccountPassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
    const updateResult = await accountModel.updateAccountPassword(
      hashedPassword,
      account_id
    )
    if (updateResult) {
      req.flash(
        "notice",
        `Congratulations, your password has been updated.`
      )
      res.status(201).redirect("/account")
    } else {
      req.flash("notice", "Sorry, the password update failed.")
      res.status(501).render("account/update", { 
        title: "Account Update",
        nav,
        errors: null,
        account_id,
      })
    }
  }
  catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    res.status(500).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
      account_id,
    })
  }
}

// Display account error view
async function buildAccountError(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-error", { 
    title: "Account Error",
    errors: null,
    nav,
  })
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountError, buildAccountUpdate, updateAccountInfo, updateAccountPassword }