const addressModel = require("../../models/addressModel");
const orderItemModel = require("../../models/orderItemModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");
const couponModel = require('../../models/couponModel');
const walletModel = require('../../models/walletModel');
const cartModel = require('../../models/cartModel');
const wishlistModel = require("../../models/wishlistModel");

const loadorder = async (req, res)=>{
    const userId = req.session.user_id;
    const userData = await userModel.findOne({_id: userId});
    const orders = await orderModel.find({user: userId}).sort({order_date: -1});

    // let products = [];
    // if(orders){

    //     for(const order of orders){
    //         const product = await orderItemModel.findOne({user}).populate("product")
    //         products.push(product)
    //     }
    // }

    const products = await orderModel.find({user: userId})
                            .populate({
                                path: 'items',
                                model: 'orderItem',
                                populate: {
                                    path: 'product',
                                    model: 'product'
                                }
                            });

    const cart = await cartModel.findOne({userId: userId});
    // const wishlist = await wishlistModel.findOne({userId});

    res.render('user/order',{id: userId, products, orders, user: userData, cart});
}

const loadOrderDetails = async (req, res)=>{
    try {

        const userId = req.session.user_id; 
        const { orderId } = req.query;

        const user = await userModel.findOne({_id: userId});

        const order = await orderModel.findOne({_id: orderId})
                                .populate({
                                    path: 'items',
                                    model: 'orderItem',
                                    populate: {
                                        path: 'product',
                                        model: 'product'
                                    }
                                }) 
        
        const coupon  = await couponModel.findOne({_id: order.coupon});
       
        const cartAddress = await orderModel.findOne({_id: orderId}).populate("address");
        const cart = await cartModel.findOne({userId: userId});

        res.render('user/orderDetails',{id: userId, user, order, coupon, address: cartAddress.address, cart});
        
    } catch (error) {
        console.log(error);
        res.status(404).render('user/error404');
    }
}

const cancelOrder = async (req, res)=>{

    try {

        const {
            orderId
        } = req.body;

        const order = await orderModel.findOne({_id: orderId})
                                    .populate('items');
    
    

        

        if(order.payment_method == "online" || order.payment_method == "wallet"){
            const wallet = await walletModel.findOne({user: order.user});
            let balance = wallet.balance;
            const newBalance = balance + order.price;
            const history = {
                type: "add",
                amount: order.price,
                newBalance: newBalance,
            }

            wallet.balance = newBalance;
            wallet.history.push(history);
            wallet.save();
        }

        await orderModel.findByIdAndUpdate(orderId,{order_status: "cancelled"})

        
        for(const item of order.items){
            
            await productModel.updateOne({_id: item.product },
                {
                    $inc: {quantity: item.quantity}
                })
    
        }

        res.send({response: true});
        
    } catch (error) {

        console.log(error);
        res.status(404).render('user/error404');
        
    }
    

}

const loadOrderSuccessPage = async (req, res)=>{
    
    const { orderId } = req.query;

    const order = await orderModel.findOne({_id: orderId});
    const user = await userModel.findOne({_id: order.user});
    const address = await addressModel.findOne({_id: order.address});
    
    const product = await orderModel.findOne({_id: orderId})
                                .populate({
                                    path: 'items',
                                    model: 'orderItem',
                                    populate: {
                                        path: 'product',
                                        model: 'product'
                                    }
                                }) 
    const coupon = await couponModel.findOne({_id: order.coupon})
   

    res.render('user/orderSuccess',{user, order, address, product, coupon});
}

const orderReturn = async (req, res)=>{
    try {

        const {
            orderId
        } = req.body;

        const order = await orderModel.findById(orderId).populate("items");
        let wallet = await walletModel.findOne({user: order.user});
        
        if(!wallet){
            wallet = new walletModel({
                user: order.user,
                balance: order.price,
                history: [{
                    type: "add",
                    amount: order.price,
                    newBalance: order.price
                }]
            })

            await wallet.save();

            order.order_status = "returned";
            await order.save();

        }else{
            let balance = wallet.balance;
            let newBalance = balance + order.price;
            let history = {
                type: "add",
                amount: order.price,
                newBalance: newBalance
            }

            wallet.balance = newBalance;
            wallet.history.push(history);
            await wallet.save();

            order.order_status = "returned";
            await order.save();
        }

        for(const item of order.items){
            
            await productModel.updateOne({_id: item.product },
                {
                    $inc: {quantity: item.quantity}
                })
    
        }


        if(wallet){
            res.send({success: true});
        }else{
            res.send({success: false});
        }
        
        
    } catch (error) {
        console.log(error);
        res.status(404).render('user/error404');
    }
}


const showFailPage = async (req, res) => {
    try {
        // const userId = req.session.user_id;
        // const userData = await userModel.findOne({ _id: userId });
        // const newOrder = new orderModel({
        //     user: userData,
        //     paymentStatus: false,
        //     orderStatus: 'payment failed',
        //     price: req.query.price,
        //     address: req.query.address,
        //     // Other properties...
        // });

        // await newOrder.save();
        res.render('user/paymentFail');
    } catch (error) {
        console.error(error);
    }
};

const downloadInvoive = async (req,res) => {
    try {
        const orderId = req.query.orderId
        const order = await orderModel.findOne({ _id: orderId }).populate([
            {
                path: 'user',
                model: 'users'
            },
            {
                path: 'address',
                model: 'address'
            },
            {
                path: 'items',
                model: 'orderItem',
                populate: {
                    path: 'product',
                    model: 'product'
                }
            }
        ]);
        res.render('user/invoiceDownload',{order})
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.render("user/error404");
    }
}





module.exports = {
    loadorder,
    loadOrderDetails,
    cancelOrder,
    loadOrderSuccessPage,
    orderReturn,
    showFailPage,
    downloadInvoive
}