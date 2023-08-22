const cartModel = require('../../models/cartModel');
const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');
const bannerModel = require('../../models/bannerModel');


const loadHome = async (req, res)=>{

    try{

        const id = req.session.user_id;
        
        const user = await userModel.findOne({_id: id});
        const cart = await cartModel.find();
        const products = await productModel.find().limit(4).sort({_id:-1});
        const banners = await bannerModel.find();
        
       
        const categories = await categoryModel.find();
        res.render('user/home',{categories, products, user, id,cart,banners,});


    }catch(err){
        res.status(404).render('user/error404');
        console.log(err);

    }
}


const userLogout = (req, res)=>{
    try {

        req.session.user_id = null
        res.redirect('/');
        
    } catch (error) {
        console.log(error);
        res.status(404).render('user/error404');
    }
}



module.exports = {
    loadHome,
    userLogout,
}