const express = require("express");
const User = require("./../models/User");

const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userInfo } = require("os");
const fetchuser = require("./../middleware/fetchuser");
const JWT_SECRET = "SaurabhGenius";

router.post("/createUser", [body('email', 'Enter a valid email').isEmail(),
body("name", "enter a valid name").isLength({ min: 3 }),
body('password', "Password must be atleast 5 length").isLength({ min: 5 })],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });

        }
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                res.json({ error: "Email already registered" });
            }
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email
            });
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json(authToken);

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    });
router.post("/login", [body('email', 'Enter a valid email').isEmail(),
body('password', "Password can not be blank").exists()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let user = await User.findOne({ email: req.body.email });
            if (!user) {
                res.status(400).json({ error: "Please login with correct credentials" });

            }
            const passwordCompare = await bcrypt.compare(req.body.password, user.password);
            if (!passwordCompare) {
                res.status(400).json({ error: "Please login with correct credentials" });
            }
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json(authToken);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    });
router.post("/getuser", fetchuser,  async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user);
        } catch(error){
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    });

module.exports = router;
