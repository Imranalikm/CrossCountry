const bcrypt = require('bcrypt');
const userModel = require('../../models/userModel');
const hash = require('../../utils/toHash');
const otp = require('../../utils/sendOtp');

const loadAdminLogin = (req, res) => {
    res.render('auth/adminLogin', { message: null });
};

const verifyAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userData = await userModel.findOne({ email: email });

        if (userData) {
            const passMatch = await bcrypt.compare(password, userData.password);

            if (passMatch) {
                if (userData.isAdmin) {
                    req.session.admin_id = userData._id;
                    res.redirect('/admin/dashboard');
                } else {
                    // You don't have the access
                    res.render('auth/adminLogin', { message: "You don't have the access" });
                }
            } else {
                // Password is incorrect
                res.render('auth/adminLogin', { message: "Password is incorrect" });
            }
        } else {
            // Admin not found
            res.render('auth/adminLogin', { message: "Admin not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    loadAdminLogin,
    verifyAdminLogin
};
