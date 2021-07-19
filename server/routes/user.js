const express = require("express");
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { User, Item } = require("../model/schema");
const auth = require('../middleware/auth');
const config = require("../config");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
    "/signup",
    [
        check("username", "Username cannot be empty")
        .not()
        .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Password must have between 6 and 30 characters").isLength({
            min: 6,
            max: 30
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            username,
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    message: "User Already Exists"
                });
            }

            user = new User({
                username,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                config.randomString, {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

/**
 * @method - POST
 * @param - /login
 * @description - User Login
 */

router.post(
    "/login",
    [
      check("email", "Please enter a valid email").isEmail(),
      check("password", "Please enter a valid password").isLength({
        min: 6
      })
    ],
    async (req, res) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }
  
      const { email, password } = req.body;
      try {
        let user = await User.findOne({
          email
        });
        if (!user)
          return res.status(400).json({
            message: "User Doesn't Exist Or Password Is Incorrect"
          });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({
            message: "User Doesn't Exist Or Password Is Incorrect"
          });
  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          config.randomString,
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token
            });
          }
        );
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });
      }
    }
  );
  

/**
 * @method - POST
 * @param - /track
 * @description - Track New Item
 */

router.post('/track', auth, async (request, response) => {

  const { name, identifier, url, price } = request.body;
  
  try{
    const oldItem = await Item.findOne({
      identifier: identifier
    });

    if(!oldItem) {
      newItem = new Item({
        name, identifier, url, price
      });

      newItem.save();
    }

    const user = await User.findByIdAndUpdate(request.user.id, {
      $addToSet: {
        "itemList" : identifier
      }
    });

    if(!user) {
      throw new Error('User not found');
    }

    response.status(200).json({
      message: "Item Added Successfully"
    });
    
  } catch (e) {
    console.error(e);
    response.status(500).json({
      message: "Server Error"
    });
  }
})

/**
 * @method - GET
 * @description - Fetch User Item List
 * @param - /user/fetch
 */

router.get('/fetch', auth, async (request, response) => {
  const id = request.user.id;


  try {
    const user = await User.findById(id);

    if(!user) {
      throw new Error('User Not Found');
    }

    const itemList = await Promise.all(user.itemList.map(async (curr) => {
      try{
        const item = await Item.findOne({identifier: curr});
        return item;
      } catch (e){
        throw e;
      }
    }));


    response.status(200).json({
      status: 'success',
      itemList: itemList
    })

  } catch (e) {
    console.error(e);
    response.status(500).json({
      message: 'Server Error'
    });
  }
})

/**
 * @method - GET
 * @description - Get LoggedIn User
 * @param - /user/me
 */

router.get("/me", auth, async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await User.findById(req.user.id);
      res.json(user);
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
});

module.exports = router;