const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middeware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

//@route GET api/auth
//@desc  Get logged in user
//access Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ msg: 'user not found' });
    }
    if (user.confirmed != true) {
      return res.status(400).json({ msg: 'Confirm email' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

//@route POST api/auth
//@desc  Login
//access Public
router.post(
  '/',
  [
    check('email', 'Input Email').isEmail(),
    check('password', 'Input Password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'User does not exist' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Password' });
      }

      if (user.confirmed != true) {
        return res.status(400).json({ msg: 'Confirm email' });
      }

      const payload = {
        user: { id: user.id },
      };

      jwt.sign(
        payload,
        jwtSecret,
        {
          expiresIn: '1d',
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

module.exports = router;
