const accountModel = require("../models/account-model")
const Util = require("../utilities")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")

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
  let grid = await utilities.buildRegisterGrid()
  res.render("account/register", {
    title: "Register",
    nav,
    grid,
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
      grid
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
*  Process Registration
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  let grid = utilities.buildLoginGrid()
  const { account_email, account_password } = req.body

  const regResult = await accountModel.accountLogin(
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", { 
      title: "Login",
      error,
      nav,
      grid
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin }