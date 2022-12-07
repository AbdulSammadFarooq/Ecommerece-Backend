const { check, validationResult } = require("express-validator");

// registration validator
exports.registerValidator = [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
    check("password", "Password must be at least 6 characters long").isLength({min:6}),
    // check("phone", "phone is required").not().isEmpty(),
    // check("address", "address is required").not().isEmpty(),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
          return res.status(422).json({ errors: errors.array() });
        next();
      },
]


// login validator
exports.loginValidator = [
    check("email","Please enter valid email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
          return res.status(422).json({ errors: errors.array() });
        next();
      },

]


// forget password validator
exports.forgetPasswordValidator = [
  check("email","Please enter valid email").isEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
] 


// reset password validator 
exports.resetPasswordValidator = [
  check("password", "Password must be at least 6 characters long").isLength({min:6}),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
]
