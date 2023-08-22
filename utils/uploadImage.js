const cloudinary = require('cloudinary').v2;
const { randomUUID } = require('crypto');




const imageUpload = async (file) => {
    try {
        
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${randomUUID()}`,
        resource_type: 'auto', 
        folder: 'CrossCountry',
        transformation: [{ width: 720, height: 720, crop: 'fill', quality: 80 }],
      });
  
      const myResultObj = {
        public_id: result.public_id,
        url: result.url,
      };
  
      return myResultObj;
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to handle it outside of the function.
    }
  };
  



const multipleImage = async (files)=>{

    try{
    
        let imageUrlList = [];

        if(Array.isArray(files)){

            for(let i=0;i<files.length;i++){
                const file = files[i];
    
                const result = await imageUpload(file);
                imageUrlList.push(result);
            }

        }else{

            const result = await imageUpload(files);
            imageUrlList.push(result);

        }
        

        return imageUrlList;

    }catch(err){
        console.log(err);
    }
}



module.exports = {
    multipleImage,
    imageUpload,
};