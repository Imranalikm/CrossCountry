const addressModel = require("../../models/addressModel");
const userModel = require("../../models/userModel");
const cartModel = require("../../models/cartModel");
const orderModel = require("../../models/orderModel");
const orderItemModel = require("../../models/orderItemModel");
const productModel = require("../../models/productModel");
const couponModel = require("../../models/couponModel");

const Razorpay = require('razorpay');
const walletModel = require("../../models/walletModel");

const loadCheckoutAddress = async (req, res)=>{
    const id = req.session.user_id;
    

        const userId = await userModel.findById(id);
        const wallet = await walletModel.findOne({user: id});

    const user = await userModel.findOne({_id: id});
    const address = await addressModel.find({_id: id});
    const contactAddress = await addressModel.findOne({user: id,type: "contact"});
    const mainAddress = await addressModel.findOne({user: id,type: "main"});
    const secondaryAddress = await addressModel.find({user: id,type: "secondary"});
    const cart = await cartModel.findOne({ userId: id });

    res.render('user/checkoutAddress',{
        id, 
        user, 
        contact: contactAddress, 
        main: mainAddress, 
        secondary: secondaryAddress, 
        address,
        wallet,
        cart
    });

}


const checkoutAddAddress = async (req, res)=>{

    try {

        const user_id = req.session.user_id;

        const { 
            building,
            street,
            city,
            state,
            country,
            type
        } = req.body;

        const pincode = Number(req.body.pincode);
        const phonenumber = Number(req.body.phone);

        const newAddress = new addressModel({
            buildingName: building,
            street,
            city,
            state,
            pincode,
            country,
            phonenumber,
            user: user_id,
            type,
        })

        await newAddress.save();
        res.redirect('/checkout/address');

        
    } catch (error) {
        console.log(error);
        res.status(404).render('user/error404');
    }
    
}
const loadEditCheckoutAddress = async (req, res)=>{
    const { type,id} = req.query;
    const id2 = req.session.user_id;
    const userData = await userModel.findOne({_id: id2});
    const address = await addressModel.findOne({_id:id});
    const cart = await cartModel.findOne({ userId: id2 });
    res.render("user/editCheckoutAddress",{type, address,id, user:userData,cart});
}

const editCheckoutAddress = async (req, res)=>{

    try {

        const addressId = req.query.addressId;

        const { 
            buildingName,
            street, 
            city,
            state,
            country,
        } = req.body;

        let pincode = parseInt(req.body.pincode);
        let phonenumber = parseInt(req.body.number);

        await addressModel.findByIdAndUpdate(addressId, {
            buildingName,
            street,
            city,
            state,
            pincode,
            country,
            phonenumber,
        })

        res.redirect('/checkout/address');
        
    } catch (error) {
        res.status(404).render('user/error404');
        console.log(error);
    }
    
}

const selectAddress = async (req, res)=>{

    const {addressId ,userId} = req.query;
    const id = req.session.user_id;

    const user = await userModel.findOne({_id: id});
  
    

        const User = await userModel.findById(id);
        const wallet = await walletModel.findOne({user: id});


    if(userId){
        const address = await addressModel.findOne({_id: addressId})
        const cart = await cartModel.findOne({userId});
        const coupons = await couponModel.find();
        let productList = [];
        const product = await cartModel
                                .findOne({userId: userId})
                                .populate("items.productId");
        
        // console.log(product);
        // product.items.forEach((item)=>{
        //     productList.push(item.productId)
        // })
        for(const item of product.items){
            productList.push(item.productId)
        }

        res.render('user/checkout',{cart, productList, address, coupons,user,id,wallet});

    }else{

        res.redirect('/');

    }
    
    
}

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_KEY_SECRET,
});


const razorPayPaymet = async (req, res)=>{
    try {

        const { coupon } = req.body;

        const userId = req.session.user_id;

        const user = await userModel.findOne({_id: userId});
        const cart = await cartModel.findOne({userId: userId});

        let amount = cart.cartPrice * 100;

        if(coupon){
            const coupon = await couponModel.findOne({_id: req.body.coupon});
            amount = (cart.cartPrice - coupon.discount) * 100; 
        }
        

        const options = {
            amount: amount,
            currency: "INR",
            receipt: "crosscountryshop123@gmail.com",
        }

        razorpayInstance.orders.create(options,
            (err, order)=>{
                if(!err){
                    res.status(200).send({
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZOR_KEY_ID,
                        name: user.username,
                        email: user.email,
                    })
                }else{
                    res.status(400).send({success: false, msg: "something went wrong!"});
                }
            })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "something went wrong"});
    }
}

const checkout = async (req, res)=>{
    const userId = req.session.user_id;

    const {
        payment,
        address,
        couponId,
        payment_id,
    } = req.body;


    const cart = await cartModel.findOne({userId: userId});

    const orderItemIdList = Promise.all(cart.items.map(async (item)=>{
        const product = await productModel.findOne({_id: item.productId});
        const newItem = new orderItemModel({
            product: item.productId,
            quantity: item.quantity,
            productPrice: product.price,
        })

        const newOrderItem = await newItem.save();
        return newOrderItem._id;
    }))

    const items = await orderItemIdList;

    let newOrder = orderModel({
        user: userId,
        address: address,
        items: items,
        price: cart.cartPrice,
        payment_status: false,
        payment_method: payment,
    });

    if(payment == "wallet"){
        const wallet = await walletModel.findOne({user: userId});

        if(!wallet){
            res.json({wallet: "false"});
            return;
        }

        let cartTotalPrice = cart.cartPrice;

        if(couponId){
            const coupon = await couponModel.findOne({_id: couponId});
            if(wallet.balance < (cartTotalPrice - coupon.discount)){
                res.json({wallet: "noprice"})
                return;
            }

            cartTotalPrice -= coupon.discount
            
        }else{

            if(wallet.balance < cartTotalPrice){
                res.json({wallet: "noprice"})
                return;
            }
        }

        let balance = wallet.balance;
        const newBalance = balance - cartTotalPrice;
        const history = {
            type: "subtract",
            amount: cartTotalPrice,
            newBalance: newBalance
        }

        wallet.balance = newBalance;
        wallet.history.push(history);
        await wallet.save();
        newOrder.payment_status = true;

    }

    
    if(couponId){

        const coupon = await couponModel.findOne({_id: couponId});
            
        if(payment_id){

            newOrder.price = cart.cartPrice - coupon.discount;
            newOrder.payment_status = true;
            newOrder.razorpay_order_id = payment_id;
            newOrder.coupon = coupon._id;

        }else{

            newOrder.price = cart.cartPrice - coupon.discount;
            newOrder.coupon = coupon._id;

        }

    }else{

        if(payment_id){

            newOrder.payment_status = true;
            newOrder.razorpay_order_id = payment_id;

        }

    }
    


    const saveOrder = await newOrder.save()


    cart.items.forEach( async (item)=>{
        const product = await productModel.findOne({_id: item.productId});
        await productModel.updateMany({_id: item.productId},
            {$set: {quantity: product.quantity - item.quantity}})
    })


    await cartModel.deleteOne({userId: userId});

    res.json({response: true, orderId: saveOrder._id});

}



module.exports = {
    loadCheckoutAddress,
    checkoutAddAddress,
    selectAddress,
    checkout,
    razorPayPaymet,
    loadEditCheckoutAddress,
    editCheckoutAddress
}