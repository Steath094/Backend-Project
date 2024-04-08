import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET
});

const uploadOnClodinary = async (localFIle) =>{
    try {
        if (!localFIle) return null;

           const response = await cloudinary.uploader.upload(localFIle, {
                resource_type: "auto"
        })
        console.log("File has been updated succefully");
        response.url;
        return response
    } catch (error) {
        fs.unlinkSync(localFIle) //remove the locally saved temporary file as the upload operation is not succeed
    }
}


export {uploadOnClodinary}
