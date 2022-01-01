const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('config');
const pEmail = config.get('pEmail');
const pPassword = config.get('pPassword');

const { check, validationResult } = require('express-validator');

//Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: pEmail,
    pass: pPassword,
  },
});

//@route POST api/users
//@desc  Register
//access Public
router.post(
  '/',
  [
    check('email', 'Insert your Email').isEmail(),
    check('password', 'Insert your Password').isLength({ min: 4 }),
    check('name', 'Insert your Name').not().isEmpty(),
  ],
  async (req, res) => {
    //Errors Checking
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
      //Check email
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'user already exists' });
      }
      user = new User({
        name,
        email,
        password,
      });
      //Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //Jwt sign
      const payload = {
        user: { id: user.id },
      };
      //fix token issue
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: '1d',
        },
        async (err, token) => {
          if (err) throw err;

          //Mail content
          const mailOptions = {
            from: '"Web-Arnold" <webarnold17@gmail.com>', //follow this sending format
            to: email,
            subject: 'Confirm Email',
            text: `http://localhost:5000/api/confirm/${token}`,
            html: `
                  <p> Click link below to verify your email </p>
                  
            `,
            //complete!!!!
          };
          //Send Mail
          const info = await transporter.sendMail(mailOptions);

          return res.json({ token, info });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
