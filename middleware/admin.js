const isLogin = (req, res, next)=>{
    try {
        if(req.session.admin_id){
            next();
        }else{
            res.render('auth/adminLogin',{message:""});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = (req, res, next)=>{
    try {

        if(req.session.admin_id){
            res.redirect('/admin/dashboard');
        }else{
            next();
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    isLogin,
    isLogout,
} 
    