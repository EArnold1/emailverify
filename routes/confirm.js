const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');

//@route GET api/users
//@desc  Confirm email
//access Public
router.get('/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, jwtSecret);
    const { id } = decoded.user;

    let user = await User.findById(id);
    if (!user) {
      res.status(404).json({ msg: 'User does not exist' });
    }
    user.confirmed = true;
    await user.save();
    res.json({ msg: 'Confirmed', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'server Error' });
  }
});

module.exports = router;
