const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const {multipleImage, imageUpload} = require('../../utils/uploadImage');


const loadCategory = async (req, res)=>{

    try{
        let productsValue = [];
        const categories = await categoryModel.find();

        

        for(let i=0;i<categories.length;i++){
            productsValue[i] = await productModel.findOne({category: categories[i].categoryName})
                     
        }
    
        res.render('admin/Category',{categories, productsValue});

    }catch(err){
        console.log(err);
    }

}

const loadAddCategory = (req, res)=>{
    res.render('admin/addCategory',{message: null});
}

const addCategory = async (req, res)=>{
    try{
        const categoryName = req.body.categoryName;
        const image = req.files.image;
        
        const urlList = await multipleImage(image);
        const catergoryData = await categoryModel.findOne({categoryName: {$regex: new RegExp(`^${categoryName}$`,"i")}})

        if(catergoryData){
            res.render('admin/addCategory',{message: "This category already exists"});
        }else{
            const newCategory = categoryModel({
                categoryName: categoryName,
                image: urlList,
            })

            await newCategory.save();
            res.redirect('/admin/category');
        }


    }catch(err){
        console.log(err);
    }
}

const loadEditCategory = async (req, res)=>{
    try {

        const id = req.query.id;

        const categoryData = await categoryModel.findOne({_id: id});

        res.render('admin/editCategory',{message: null, category: categoryData});
        
    } catch (err) {
        console.log(err);
    }
}

const editCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const newCategoryName = req.body.categoryName;

        // Check if the new category name is unique and doesn't already exist in the database
        const existingCategory = await categoryModel.findOne({ categoryName: { $regex: new RegExp(`^${newCategoryName}$`, "i") } });

        if (existingCategory) {
            // If the category name already exists, send an error message or handle it appropriately
            res.render('admin/editCategory', { message: "This category already exists", category: existingCategory });
        } else {
            // If the category name is unique, update the category in the database
            await categoryModel.findByIdAndUpdate(id, { categoryName: newCategoryName });
            res.redirect('/admin/category');
        }
    } catch (err) {
       console.log(err);
    }
}






module.exports = {
    loadCategory,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    editCategory,
}