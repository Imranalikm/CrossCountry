const cartModel = require('../../models/cartModel');
const productModel = require('../../models/productModel');
const userModel = require('../../models/userModel');

const loadWishlist = async (req, res) => {
    const id = req.session.user_id;

    const user = await userModel.findOne({ _id: id })
    const cart = await cartModel.findOne({ userId: id });  
    const products = await productModel.find({
        _id: { $in: user.wishlist },
    }).lean()

    res.render('user/wishlist', { user, products,id,cart });
};


const addToWishlist = async (req, res) => {
    const id = req.session.user_id;
    const {productId} = req.query;
    
    console.log(productId);
;
    try {
        await userModel.updateOne({ _id: id }, { $push: { wishlist: productId } });
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Failed to add to wishlist" });
        res.status(404).render('user/error404');
    }
}

const removeFromWishlist = async (req, res) => {
    const productId = req.query.prodId
    const user = req.session.user_id;
    await userModel.updateOne({ _id: user },
        {
            $pull: {
                wishlist: productId,
            },
        });
  
    res.json({ success: true });
}
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.query;
        const userId = req.session.user_id;

        const user = await userModel.findById(userId);
        const productIndex = user.wishlist.indexOf(productId);

        if (productIndex === -1) {
            // If the product is not in the wishlist, add it
            user.wishlist.push(productId);
        } else {
            // If the product is in the wishlist, remove it
            user.wishlist.splice(productIndex, 1);
        }

        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
};



module.exports = {
    loadWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist

}