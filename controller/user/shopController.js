const  categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');


// const loadShop = async (req, res)=>{
//     const id = req.session.user_id;
        
//     const user = await userModel.findOne({_id: id});

//     const products = await productModel.find().sort({_id:-1});
//     const categories = await categoryModel.find();
//     res.render('user/shop',{categories, products, user, id,searchQuery: ''});
// }



const PRODUCTS_PER_PAGE = 6; 

const getProductList = async (req, res, next) => {
    try {
        const id = req.session.user_id;
        const user = await userModel.findOne({ _id: id });

        const page = +req.query.page || 1;
        const searchQuery = req.query.search || '';
        const categoryId = req.query.category || '';
        const sortOption = req.query.sort || '';

        const filter = { isActive: true };

        if (categoryId) {
            filter.category = categoryId;
        }

        if (searchQuery) {
            filter.$or = [
                { productName: { $regex: searchQuery, $options: 'i' } }
               
            ];
        }

        let sort = {};

        if (sortOption === 'lowToHigh') {
            sort = { price: 1 };
        } else if (sortOption === 'highToLow') {
            sort = { price: -1 };
        } else if (sortOption === 'latest') {
            sort = { _id: -1 };
        }

        const totalProducts = await productModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

        const products = await productModel
            .find(filter)
            .sort(sort)
            .skip((page - 1) * PRODUCTS_PER_PAGE)
            .limit(PRODUCTS_PER_PAGE)
            .populate('category');
        
         const productCount =await productModel
         .find(filter)
         .sort(sort)
         .populate('category');
     
        const categories = await categoryModel.find();

        res.render('user/shop', {
            products,
            categories,
            user,
            id,
            currentPage: page,
            totalPages,
            searchQuery,
            categoryId,
            sortOption,
            productCount
        });
    } catch (err) {
        console.error(err);
        res.status(404).render('user/error404');
    }
};

module.exports = {
    getProductList,
    // loadShop,
};
