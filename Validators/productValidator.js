const { check, validationResult } = require("express-validator");

exports.productValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("price", "Price is required").not().isEmpty(),
  check("description", "Description of the product is required").not().isEmpty(),
  check("seller", "Seller is required").not().isEmpty(),
  check("stock", "stock is required").not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];