const orderModel = require("../../models/orderModel")
const orderItemModel = require('../../models/orderItemModel');
const userModel = require("../../models/userModel");
const couponModel = require("../../models/couponModel");

const loadorder = async (req, res)=>{
    
    const orders = await orderModel.find().sort({order_date: -1});
    const users = await orderModel.find().populate("user").sort({order_date: -1});


    res.render('admin/order',{orders,users});
}


const loadOrderDetails = async (req, res)=>{

    const {
        userId,
        orderId,
    } = req.query;

    // console.log(orderId);
    
    const user = await userModel.findOne({_id: userId});
    const order = await orderModel.findOne({_id: orderId});
    const cartAddress = await orderModel.findOne({_id: orderId}).populate("address");
    const coupon = await couponModel.findOne({_id: order.coupon});


    let products = [];
    for(const item of order.items){
        const product = await orderItemModel.findOne({_id: item}).populate("product")
        products.push(product)
    }
    
    console.log(order);

    res.render('admin/orderDetails',{user, order, coupon, address: cartAddress.address, products});
}


const statusChange = async (req, res)=>{
    const {
        id,
        status
    } = req.body;

    if(status === "delivered"){
        await orderModel.findByIdAndUpdate(id,{order_status: status, payment_status: true});

    }else{
        await orderModel.findByIdAndUpdate(id,{order_status: status});        
    }

    const order = await orderModel.findOne({_id: id});

    res.json({data: order})
}

module.exports = {
    loadorder,
    loadOrderDetails,
    statusChange,
}