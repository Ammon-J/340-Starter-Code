const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const utilities = require("../utilities")

router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
)

// Deliver account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Deliver account update view
router.get("/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountUpdate)
)

// Process account update
router.post("/update-info",
  regValidate.updateInfoRules(),
  regValidate.checkInfoData,
  utilities.handleErrors(accountController.updateAccountInfo)
)

// Process password update
router.post("/update-password",
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updateAccountPassword)
)

// Process logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
})

// Add: endpoint for client-side session fetch (used by header.ejs when jwt is HttpOnly)
router.get(
  "/session-info",
  utilities.handleErrors(async (req, res) => {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        return res.status(401).json(null);
      }
      // Verify token and extract user (adjust based on your jwt verify logic)
      // Example: const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      // For now, return a placeholder; integrate your actual token verification
      res.json({
        displayName: req.locals?.user?.user_firstname || "User", // adjust based on your user object structure
        user: req.locals?.user || null
      });
    } catch (err) {
      console.error('session-info error:', err);
      res.status(401).json(null);
    }
  })
)

// Deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.get("/account-error", utilities.handleErrors(accountController.buildAccountError))

module.exports = router;