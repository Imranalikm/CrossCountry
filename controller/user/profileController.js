const userModel = require('../../models/userModel');
const bcrypt = require('bcrypt');
const hash = require('../../utils/toHash');
const cartModel = require ('../../models/cartModel');


const loadProfile = async (req, res)=>{
    const id = req.session.user_id;
    const userData = await userModel.findOne({_id: id});
    const cart = await cartModel.findOne({ userId: id });  
    res.render("user/profile",{id, user: userData,cart});
}

const loadEditUser = async (req, res)=>{
    const id = req.query.id;
    const user = await userModel.findOne({_id: id});
    const cart = await cartModel.findOne({ userId: id });  
    res.render("user/editUser", {user,id,cart});
}

const editUser = async (req, res)=>{
    const id = req.query.id;
    const username = req.body.username;
    const user = await userModel.findByIdAndUpdate(id,{$set: {username: username}});;
    
    res.redirect('/profile');
}

const loadOldPassword = async (req, res)=>{
    const id = req.session.user_id;
    const user = await userModel.findOne({_id: id});
    const cart = await cartModel.findOne({ userId: id });  
    res.render('user/oldPassword',{id,message: null,user,cart});
}

const verifyOldPassword = async (req, res)=>{
    try {

        const id = req.query.id;
        const oldPassword = req.body.oldPassword
        
        const userData = await userModel.findOne({_id: id});
        const cart = await cartModel.findOne({ userId: id });  

        const passMatch = await bcrypt.compare(oldPassword, userData.password);

        if(!passMatch){
            res.render('user/oldPassword',{id, message: "The old password is incorrect",cart});
        }else{
            res.render('auth/newPassword',{action: "/profile/newPassword",cart})
        }

    } catch (error) {
        console.log(error);
        res.status(404).render('user/error404');    
    }
    
}

const profileNewPassword = async (req, res)=>{
    const id = req.session.user_id;
    
    const newPassword = req.body.password;
    const hashNewPassword = await hash(newPassword);
    await userModel.findByIdAndUpdate(id, {password: hashNewPassword});
    res.redirect('/profile');
}




module.exports = {
    loadProfile,
    loadEditUser,
    editUser,
    loadOldPassword,
    verifyOldPassword,
    profileNewPassword,
}