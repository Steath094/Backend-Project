import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// i have to manually add dotenv confiq because it was not working without it
import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
      if (!localFilePath) return null
      //upload the file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto"
      })
    //   console.log(response);

      // file has been uploaded successfull
    //   console.log("file is uploaded on cloudinary ", response.url);
      fs.unlinkSync(localFilePath)
      return response;

  } catch (error) {
      fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
    // console.log(error);
    
      return null;
  }
};

const deleteFromCloudinary = async (cloudinaryURL) =>{
  try {
    // Extract the public ID from the URL
    const urlParts = cloudinaryURL.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1]; // Example: 'image.png'
    const [publicId] = fileNameWithExtension.split('.'); // Removes file extension

    // Delete the file from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
} catch (error) {
    console.error('Error deleting file:', error);
    return null;
}
}
export { uploadOnCloudinary, deleteFromCloudinary };
