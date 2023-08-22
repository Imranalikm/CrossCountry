const router = require('express').Router();

const  adminUserController = require('../controller/admin/userController');
const  dashboardController = require('../controller/admin/dashboardController');
const categoryController = require('../controller/admin/categoryController');
const productController = require ('../controller/admin/productController');
const orderController = require('../controller/admin/orderController')
const couponController = require('../controller/admin/couponController');
const bannerController = require('../controller/admin/bannerController');
const adminAuthController = require('../controller/auth/adminAuthController');

const adminAuth = require('../middleware/admin');


router.get('/login',adminAuth.isLogin,adminAuthController.loadAdminLogin);
router.post('/login',adminAuthController.verifyAdminLogin);



router.get('/category',adminAuth.isLogin,categoryController.loadCategory)
router.get('/category/add',adminAuth.isLogin,categoryController.loadAddCategory);
router.post('/category/add',categoryController.addCategory);
router.get('/category/edit',adminAuth.isLogin,categoryController.loadEditCategory);
router.post('/category/edit',categoryController.editCategory);

router.get('/product',adminAuth.isLogin,productController.loadProducts);
router.get('/product/add',adminAuth.isLogin,productController.loadAddProducts);
router.post('/product/add',productController.addProducts);
router.get('/product/edit',adminAuth.isLogin,productController.loadEditProduct);
router.post('/product/edit',productController.editProduct);
router.get('/product/image',adminAuth.isLogin,productController.loadImages);
router.delete('/product/image/delete',productController.deleteProductImage)
router.get('/product/image/add',adminAuth.isLogin,productController.loadAddImage);
router.post('/product/image/add',productController.editImage);
router.get('/product/delete',productController.deleteProduct);


router.get('/order',adminAuth.isLogin,orderController.loadorder);
router.get('/orderDetails',adminAuth.isLogin,orderController.loadOrderDetails);
router.post('/order/status',orderController.statusChange);


router.get('/coupon',adminAuth.isLogin,couponController.loadCoupon);
router.get('/coupon/add',adminAuth.isLogin,couponController.loadAddCoupon);
router.post('/coupon/add',couponController.addCoupon);
router.get('/coupon/edit',adminAuth.isLogin,couponController.loadEditCoupon);
router.post('/coupon/edit',couponController.editCoupon);
router.post('/coupon/apply',couponController.applyCoupon); 


router.get('/banner',bannerController.loadBanner);
router.get('/banner/add',bannerController.loadAddBanner);
router.post('/banner/add',bannerController.addBanner);
router.get('/banner/edit',adminAuth.isLogin,bannerController.loadEditBanner);
router.post('/banner/edit',bannerController.editBanner);



router.get('/dashboard',adminAuth.isLogin,dashboardController.loadDashboard);
router.get('/sale',adminAuth.isLogin,dashboardController.loadSalesReport);
router.post('/sale/monthly',dashboardController.monthlySaleReport);
router.post('/sale/daily',dashboardController.dailySalesReport);
router.post('/sale/date',dashboardController.byDateSaleReport);

router.get('/user',adminAuth.isLogin,adminUserController.loadUser);
router.get('/user/edit',adminAuth.isLogin,adminUserController.loadEditUser);
router.post('/user/edit',adminUserController.editUser);

router.get('/logout',dashboardController.adminLogout);


module.exports = router;