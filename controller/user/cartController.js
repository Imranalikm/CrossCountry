const ObjectId = require('mongoose').Types.ObjectId;
const cartModel = require('../../models/cartModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');


const loadCart = async (req, res)=>{
    const id = req.session.user_id;
    const user = await userModel.findOne({_id: id});
    let cart = await cartModel.findOne({userId: req.session.user_id})
    let productList = [];
    let products;
    if(cart){

        for(const item of cart.items){
            const product = await productModel.findOne({_id: item.productId});
            
            if(item.quantity > product.quantity){
                await cartModel.updateOne(
                    {
                        userId: id,
                        "items.productId": item.productId
                    },
                    {$set: {"items.$.quantity": product.quantity}}
                )
            }
        }   



        products = await cartModel
                            .findOne({userId: req.session.user_id})
                            .populate("items.productId");
        
        products.items.forEach((item)=>{
            productList.push(item.productId)
        })
        
    }

    
    res.render("user/cart",{id, user, products, productList,cart});
}




const addToCart = async (req, res)=>{
    try {

        const { productId } = req.query;
        const userId = req.session.user_id;
        
        
        
        const cart = await cartModel.findOne({userId: userId});
        const product = await productModel.findOne({_id: productId});


      
        
       
        if(cart){

            let productExist = await cartModel.findOne({userId: userId, "items.productId": productId});

            if(productExist){

                const cartProduct = cart.items.find((item) => item.productId == productId)

                if(cartProduct.quantity >= product.quantity){
                    res.json({response: false})
                }else{

                    
                    await cartModel.findOneAndUpdate({userId: userId, "items.productId": productId},
                    {
                        $inc: {
                            "items.$.quantity": 1,
                            "items.$.totalPrice": product.price,
                        }
                    })
        
                }
            }else{
                await cartModel.findOneAndUpdate({userId: userId},
                    {
                        $push: {
                            items: [
                                {
                                    productId,
                                    totalPrice: product.price,
                                }
                            ]
                        }
                    })
            }

        }else{
            const newItem = new cartModel({
                userId: userId,
                items: [
                    {
                        productId,
                        totalPrice: product.price
                    }
                ]
            })
            await newItem.save();
        }

        const cartTotalPrice = await cartModel.aggregate([
            {
                $match: {userId: new ObjectId(userId)}
            },
            {
                $unwind: "$items"
            },
            {
                  $group: {
                    _id: null,
                    total: {$sum: "$items.totalPrice"}
                  } 
            }
            
        ])


        await cartModel.updateOne(
            {userId: userId},
            {$set: {cartPrice: cartTotalPrice[0].total }}
        )
     
        if (!res.headersSent) {
            res.json({response: true});
        }

        
    } catch (error) {
        res.status(404).render('user/error404');
        console.log(error);
    }
}

const quantityDecrement = async (req, res)=>{
    try {


        const {userId , productId} = req.query;

        const product = await productModel.findOne({_id: productId});
       

        await cartModel.findOneAndUpdate({userId: userId, "items.productId": productId},
        {
            $inc: {
                "items.$.quantity": -1,
                "items.$.totalPrice": -product.price,
                cartPrice: -product.price,
            }
        })


        res.send({response: true})
        
    } catch (error) {
        res.status(404).render('user/error404');
        console.log(error);
        
    }
    
}

const quantityIncrement = async (req, res)=>{
    try {

        const {userId , productId} = req.query;

        const product = await productModel.findOne({_id: productId});

        await cartModel.findOneAndUpdate({userId: userId, "items.productId": productId},
            {
                $inc: {
                    "items.$.quantity": 1,
                    "items.$.totalPrice": product.price,
                    cartPrice: product.price,
                }
        })

        res.send({response: true})
        
    } catch (error) {
        res.status(404).render('user/error404');
        console.log(error);
        
    }
    
}

const removeItem = async (req, res)=>{
    try {

        const {
            productId,
            userId,
        } = req.body;
    
        // console.log(productId);
        // console.log(req.body);
        

        await cartModel.findOneAndUpdate({userId: userId, "items.productId": productId},
            {
                $pull: {
                    "items": {productId: productId}
                }
            })

        const cart = await cartModel.findOne({userId: userId})

        
        if(cart.items.length > 0){

            const cartTotalPrice = await cartModel.aggregate([
                {
                    $match: {userId: new ObjectId(userId)}
                },
                {
                    $unwind: "$items"
                },
                {
                    $group: {
                        _id: null,
                        totalcost: {$sum: "$items.totalPrice"}
                    } 
                }
                
            ])
            
            await cartModel.updateOne(
                {userId: userId},
                {$set: {cartPrice: cartTotalPrice[0].totalcost }}
            )

        }else{

            await cartModel.updateOne({userId: userId},{cartPrice: 0});

        }

        
    
        res.send({response: true})
        
    } catch (error) {
        console.log(error);
        res.status(404).render('user/error404');
    }
    
}

module.exports = {
    loadCart,
    addToCart,
    quantityDecrement,
    quantityIncrement,
    removeItem,
}