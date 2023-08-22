const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({

    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccess: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    profile: {
        type: String,
        default: "",
    },
    createdAt: {
       type: Date,
       default: Date.now(),
    },
    wishlist:[],

})

module.exports = mongoose.model('users', userSchema);