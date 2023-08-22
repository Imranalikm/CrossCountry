const { userLogout } = require("../controller/user/homeController");
const userModel = require('../models/userModel');



const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const id = req.session.user_id;
      const user = await userModel.findOne({ _id: id });

      if (user && user.isAccess) {
       
        next();
      } else {
        req.session.user_id = null;
        res.redirect('/login');
      }
    } else {
      req.session.user_id = null;
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
    
    res.status(500).send('Internal Server Error');
  }
};


const isLogout = (req, res, next)=>{
    try {

        if(req.session.user_id){
            res.redirect('/');
        }else{
            next();
        }
        
    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    isLogin,
    isLogout,
} 
    