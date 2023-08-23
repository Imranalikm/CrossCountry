const bannerModel = require('../../models/bannerModel');
const categoryModel = require('../../models/categoryModel');
const cloudinaryUpload = require('../../utils/uploadImage');

const loadBanner = async (req, res)=>{
    try {
        const banners = await bannerModel.find().populate("category");
        res.render('admin/banner',{banners});
    } catch (error) {
        
    }
}

const loadAddBanner = async (req, res)=>{
    const categories = await categoryModel.find();
    res.render('admin/addBanner',{categories});
}

const addBanner = async (req, res)=>{
    try {

        const {
            caption1Text,
            caption1Color,
            caption2Text,
            caption2Color,
            category
        } = req.body;

        const { Image } = req.files;

        const bannerImage = await cloudinaryUpload.imageUpload2(Image);

        const newBanner = new bannerModel({
            caption1: {
                text: caption1Text,
                color: caption1Color
            },
            caption2: {
                text: caption2Text,
                color: caption2Color
            },
            category,
            bannerImage
        })

         await newBanner.save();
        res.redirect('/admin/banner');

    } catch (error) {
        console.log(error);
    }
}
const loadEditBanner = async (req, res)=>{
    try {

        const { bannerId } = req.query;

        const banner = await bannerModel.findOne({_id: bannerId});

        res.render("admin/editBanner",{banner});
        
    } catch (error) {
        console.log(error);
    }
}

const editBanner = async (req, res)=>{
    try {

        const {
            title,
            description
        } = req.body;

        const { bannerId } = req.query;

        await bannerModel.findByIdAndUpdate(bannerId,{
            title: title,
            description: description,
        })

        res.redirect('/admin/banner');
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadBanner,
    loadAddBanner,
    addBanner,
    loadEditBanner,
    editBanner,
} 