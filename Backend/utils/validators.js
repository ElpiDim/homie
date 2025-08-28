const { check, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerSchema = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  check('role').optional().isIn(['tenant', 'owner']),
];

const loginSchema = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

const updateMeSchema = [
    check('name').optional().isString().withMessage('Name must be a string'),
    check('age').optional().isInt({ min: 18 }).withMessage('Age must be a number and at least 18'),
    check('householdSize').optional().isInt({ min: 1 }).withMessage('Household size must be a positive number'),
    check('hasFamily').optional().isBoolean().withMessage('hasFamily must be a boolean'),
    check('hasPets').optional().isBoolean().withMessage('hasPets must be a boolean'),
    check('smoker').optional().isBoolean().withMessage('smoker must be a boolean'),
    check('occupation').optional().isString().withMessage('Occupation must be a string'),
    check('salary').optional().isNumeric().withMessage('Salary must be a number'),
    check('isWillingToHaveRoommate').optional().isBoolean().withMessage('isWillingToHaveRoommate must be a boolean'),
];

const updatePreferencesSchema = [
    check('preferences.type').optional().isIn(['rent', 'sale']),
    check('preferences.location').optional().isString(),
    check('preferences.minPrice').optional().isNumeric(),
    check('preferences.maxPrice').optional().isNumeric().custom((value, { req }) => {
        if (value < req.body.preferences.minPrice) {
            throw new Error('Max price cannot be less than min price');
        }
        return true;
    }),
    check('preferences.minSqm').optional().isNumeric(),
    check('preferences.maxSqm').optional().isNumeric().custom((value, { req }) => {
        if (value < req.body.preferences.minSqm) {
            throw new Error('Max sqm cannot be less than min sqm');
        }
        return true;
    }),
    check('preferences.bedrooms').optional().isInt({ min: 1 }),
    check('preferences.bathrooms').optional().isInt({ min: 1 }),
    check('preferences.petsAllowed').optional().isBoolean(),
    check('preferences.smokingAllowed').optional().isBoolean(),
    check('preferences.furnished').optional().isBoolean(),
];

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateMeSchema,
  updatePreferencesSchema,
};
