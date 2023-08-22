const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');
const cartModel = require('../../models/cartModel');


const loadShopDetails = async (req, res)=>{

    try {

        const id = req.session.user_id;
        
        
        const user = await userModel.findOne({_id:id});

        const Proid = req.query.id;

        const products = await productModel.find();
        const categories = await categoryModel.find();
        const cart = await cartModel.findOne({ userId: id });

        await productModel.findOne({_id: Proid})
        .then((product)=>{
            if(!product){
                res.send("");
            }
            res.render('user/shopDetails',{categories, product, products, Proid, user,id,cart});
        })
        .catch(err =>{
            res.send("");
        })
        
        

        

    } catch (error) {
        console.log(error);
        res.status(404).render('user/error404');
    }
    
}


module.exports = {
    loadShopDetails,
}