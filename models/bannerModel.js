const mongoose = require('mongoose');
const schema = mongoose.Schema;


const bannerSchema = schema({
    caption1: {
        text: {
            type: String,
            required: true,
        },
        color: {
            type: String, 
            required: true,
        }
    },
    caption2: {
        text: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        }
    },    
    bannerImage: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "category",
        required: true,
    }
})

module.exports = mongoose.model('banner',bannerSchema);