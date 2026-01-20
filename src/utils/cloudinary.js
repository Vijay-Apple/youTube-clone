import {v2 as cloudinary} from 'cloudinary'


(async function (){

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    })
})

const uploadOnCloudinary=async (localPath)=>{
    try {
        if(!localPath) return null

        const response=await cloudinary.uploader.upload(localPath,{
            resource_type:'auto'
        })
        //file has been upload successfully
        console.log("image is upload on cloudinary",response.url)
        return response;

    } catch (error) {
        fs.unlinkSync(localPath)  //it remove the locally saved temporary file and images
        return null;
    }
}
export  {uploadOnCloudinary};