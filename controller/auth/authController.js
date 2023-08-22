const bcrypt = require('bcrypt');

const userModel = require('../../models/userModel');
const hash = require('../../utils/toHash')
const otp = require('../../utils/sendOtp');


const loadSignUp = (req, res)=>{
    res.render('auth/signup',{message: null});
}

const createUser = async (req, res)=>{
    try{

        const { username, email, password} = req.body;
        
        const userData = await userModel.findOne({email: email});

        if(userData){
            res.render('auth/signup',{message: "This email has another account"})
        }else{
            const passwordHash = await hash(password);
            const newUser = userModel({
                username: username,
                email: email,
                password: passwordHash,
            })

            const savedUser = await newUser.save();

            const options = {
                maxAge: 1000 * 60 * 2,
                httpOnly: true,
            }

            const result = await otp.sendOtp(savedUser);
            res.cookie('hashOtp', result, {httpOnly: true});

            res.render('auth/otp',{id: savedUser._id, message: null, localAction: `/signup/otp?id=${savedUser._id}`});
        }

    }catch(err){
         console.log(err);
    }
}






const verifyOtp = async (req, res)=>{
    
    try {
        const userId = req.query.id;

        const secret = req.cookies['hashOtp'];
        const OTP = req.body.otp;
   

        const verified = await bcrypt.compare(OTP, secret) 
        
        if(verified){
            await userModel.findByIdAndUpdate(userId, {$set: {isVerified: true}});
            console.log("otp verification success");
            res.redirect('/login');
        }else{
            console.log("otp verification failed");
            res.render('auth/otp',{id: userId, message: "Incorrect OTP", localAction: `/signup/otp?id=${userId}`});

        }
        
    } catch (error) {

        console.log(error)
        
    }
    
}

const resendOtp = async (req, res) => {
    try {
      const userId = req.params.userId; // Access the user ID from the request parameters
  
      // Retrieve the user data based on the userId (replace "userData" with the actual variable name for your user data)
      const userData = await userModel.findById(userId);
  
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      // Generate and send a new OTP to the user (use your OTP library here)
      const result = await otp.sendOtp(userData);

            res.cookie('hashOtp', result, {httpOnly: true});
  
      // Update the OTP and its hash in the database (assuming you have fields for storing OTP and its hash in your userModel)
   
      await userData.save();
  
      // Respond with a success message and the new OTP (optional)
      res.json({ success: true, message: 'OTP resent successfully.' });
    } catch (error) {
      // Handle errors and respond with an error message
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
    }
  };
  
 


const loadLogin = (req,res)=>{
    res.render('auth/login',{message: null});
}

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userData = await userModel.findOne({ email: email });

        if (userData) {
            const passMatch = await bcrypt.compare(password, userData.password);

            if (passMatch) {
                if (userData.isAdmin) {
                    // Deny access for admin users
                    res.render('auth/login', { message: "Access denied for admin users" });
                } else {
                    if (userData.isVerified && userData.isAccess) {
                        req.session.user_id = userData._id;
                        res.redirect('/');
                    } else {
                        // You don't have the access
                        res.render('auth/login', { message: "You don't have the access" });
                    }
                }
            } else {
                // Password is incorrect
                res.render('auth/login', { message: "Password is incorrect" });
            }
        } else {
            // User not found
            res.render('auth/login', { message: "User not found" });
        }

    } catch (err) {
        console.log(err);
    }
}

const loadForgotPassword = (req, res)=>{
    res.render("auth/forgotPassword",{message: null});
}

const forgotPassword = async (req, res)=>{
    const email = req.body.email;

    const emailMatch = await userModel.findOne({email: email});

    if(!emailMatch){
        res.render("auth/forgotPassword",{message: "This email has no account"});
    }else{
        const result = await otp.sendOtp(emailMatch);
        res.cookie('forgotHash', result, {httpOnly: true});
        res.render('auth/otp',{id: emailMatch._id, message: null, localAction: `/forgotPassword/otp?id=${emailMatch._id}`});
    }

}

const verifyForgotPasswordOtp = async (req, res)=>{
    try {
        const userId = req.query.id;

        const secret = req.cookies['forgotHash'];
        const OTP = req.body.otp;
   

        const verified = await bcrypt.compare(OTP, secret) 
        
        if(verified){
            console.log("otp verification success");
            res.cookie('id', userId, {httpOnly: true});
            res.render("auth/newPassword",{action: "/forgotPassword/newPassword"});
        }else{
            console.log("otp verification failed");
            res.render('auth/otp',{id: userId, message: "Incorrect OTP", localAction: `/forgotPassword/otp?id=${userId}`});

        }
        
    } catch (error) {

        console.log(error)
        
    }
}

const newPassword = async (req, res)=>{
    const id = req.cookies['id'];
    
    const newPassword = req.body.password;
    const hashNewPassword = await hash(newPassword);
    await userModel.findByIdAndUpdate(id, {password: hashNewPassword});
    res.redirect('/login');
}



module.exports = {
    loadSignUp,
    loadLogin,
    createUser,
    resendOtp,
    verifyLogin,
    verifyOtp,
    loadForgotPassword,
    forgotPassword,
    verifyForgotPasswordOtp,
    newPassword,
}

