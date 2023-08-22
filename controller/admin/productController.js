const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const {multipleImage, imageUpload} = require('../../utils/uploadImage');
const deleteImage = require('../../utils/deleteImage');

const loadProducts = async (req, res)=>{
    const products = await productModel.find();
    const categories = await categoryModel.find();
    res.render('admin/product',{  products, categories});
}

const loadAddProducts = async (req, res)=>{
    const categories = await categoryModel.find();
    res.render('admin/addProduct',{categories});
}

const addProducts = async (req, res) => {
    try {
        
        const productName = req.body.productName;
        const category = req.body.category;
        let price = req.body.price;
        let quantity = req.body.quantity;
        let sizes =req.body.size
        const blurb = req.body.blurb;
        const description = req.body.description;
        
        const images = req.files.image;

        price = parseFloat(price);
        quantity = parseInt(quantity);
        
        const urlList = await multipleImage(images);

        const errors = {};
        for (let i = 0; i < images.length; i++) {
            const result = await imageUpload(images[i]);
            if (!result.url) {
                errors['image' + i] = result.error;
            }
        }

        if (Object.keys(errors).length > 0) {
            res.render('addProducts', {
                productName: productName,
                category: category,
                price: price,
                quantity: quantity,
                sizes: sizes,
                blurb: blurb,
                description: description,
                errors
            });
            return;
        }

        const newProduct = productModel({
            productName: productName,
            category: category,
            price: price,
            quantity: quantity,
            sizes: sizes,
            blurb: blurb,
            description: description,
            image: urlList,
        });
        
        await newProduct.save()
        
        res.redirect('/admin/product');
        
    } catch (err) {
        console.log(err);
    }
};

const loadEditProduct = async (req, res)=>{
    const id = req.query.id;

    const categories = await categoryModel.find();
    const product = await productModel.findOne({_id: id});
    res.render('admin/editProduct',{categories,product});
}

const editProduct = async (req, res)=>{

    try {

        const id = req.query.id;

        const productName = req.body.productName;
        const category = req.body.category;
        let price = req.body.price;
        let quantity = req.body.quantity;
        const blurb = req.body.blurb;
        const description = req.body.description;
        

        price = parseFloat(price);
        quantity = parseInt(quantity);


        await productModel.findByIdAndUpdate(id, {
            productName: productName,
            category: category,
            price: price,
            quantity: quantity,
            blurb: blurb,
            description: description,
        })

        res.redirect('/admin/product');

        
    } catch (error) {
        console.log(error);
    }
    
}

const deleteProduct = async (req, res)=>{
    try {
        const {id, active} = req.query;

        if(active == "true"){
            await productModel.findByIdAndUpdate(id, {$set: {isActive: false}});
        }else if(active == "false"){
            await productModel.findByIdAndUpdate(id, {$set: {isActive: true}});
        }
                
        res.redirect('/admin/product');
        
    } catch (error) {
        console.log(error);
    }
}

const loadImages = async (req, res)=>{

    try {

        const { id } = req.query;
        const product = await productModel.findOne({_id: id});

        res.render('admin/editImages',{product});
        
    } catch (error) {
        console.log(error);
    }
    
}



const deleteProductImage = async (req, res)=>{
    const { public_id, productId } = req.query;

    await deleteImage(public_id);
   

    await productModel.updateOne({_id: productId, "image.public_id": public_id},
        {
            $pull: {
                "image": {public_id: public_id}
            }
        }
    )



    
    res.json({response: true})
}

const loadAddImage = (req, res)=>{
    try {

        const {productId} = req.query;
        
        res.render('admin/addImage',{productId})

    } catch (error) {
        console.log(error);
    }
}

const editImage = async (req, res)=>{
    try {

        const { image } = req.files;
        const { productId } = req.query;

        const result = await imageUpload(image);

        await productModel.updateOne({_id: productId},
            {
                $push: {
                    image: result 
                }
            })
        
        res.redirect('/admin/product')
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadProducts,
    loadAddProducts,
    addProducts,
    loadEditProduct,
    editProduct,
    deleteProduct,
    loadImages,
    loadAddImage,
    editImage,
    deleteProductImage,
}

