const userModel = require('../../models/userModel');
const addressModel = require('../../models/addressModel');
const cartModel = require ('../../models/cartModel');

const loadAddress = async (req, res)=>{
    const id = req.session.user_id;
    const userData = await userModel.findOne({_id: id});
    const contactAddress = await addressModel.findOne({user: id,type: "contact"});
    const mainAddress = await addressModel.findOne({user: id,type: "main"});
    const secondaryAddress = await addressModel.find({user: id,type: "secondary"});
   
    const cart = await cartModel.findOne({ userId: id });

    res.render("user/address",{id, user: userData, contact: contactAddress,main: mainAddress, secondary: secondaryAddress,cart});
}

const loadAddAddress = async (req, res)=>{
    const type = req.query.type;
    const id = req.session.user_id;
    const userData = await userModel.findOne({_id: id});
    const cart = await cartModel.findOne({ userId: id });
    
    res.render("user/addAddress",{type, id, user:userData,cart});
}

const addAddress = async (req, res)=>{
    try {

        const id = req.session.user_id;

        const { 
                buildingName,
                street, 
                city,
                state,
                country,
                type,
            } = req.body;

        let pincode = parseInt(req.body.pincode);
        let phonenumber = parseInt(req.body.number);

        const newAddress = new addressModel({
            buildingName,
            street,
            city,
            state,
            pincode,
            country,
            phonenumber,
            user: id,
            type,
        })

        await newAddress.save();
        res.redirect('/address');
        
    } catch (error) {
        res.status(404).render('user/error404');
        console.log(error);
    }
    
}

const loadEditAddress = async (req, res)=>{
    const { type,id} = req.query;
    const id2 = req.session.user_id;
    const userData = await userModel.findOne({_id: id2});
    const address = await addressModel.findOne({_id:id});
    const cart = await cartModel.findOne({ userId: id2 });
    res.render("user/editAddress",{type, address,id, user:userData,cart});
}

const editAddress = async (req, res)=>{

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

        res.redirect('/address');
        
    } catch (error) {
        res.status(404).render('user/error404');
        console.log(error);
    }
    
}

const deleteAddress = async (req, res)=>{
    try {

        const id = req.query.id;
        await addressModel.deleteOne({_id: id});
        res.json({response: true});

    } catch (error) {
        res.status(404).render('user/error404');
        console.log(error)
    }
}

module.exports = {
    loadAddress,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,
}