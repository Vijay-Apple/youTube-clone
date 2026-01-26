
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js';


// const registerUser = asyncHandler(async (req, res) => {
//    res.status(201).json({
//       message: "okk",
//       message2: "register is success"
//    })

// })
/*   ************************

     steps to create register form

     *************************

   1   user details from frontend-postman
   2   validation - not empty
   3   check if user is exists: username,email
   4   check for image,check for avatar
   5   upload them to claudinary,avatar
   6   create user object -create entry in db
   7   remove password and refresh token fields from response 
   8   check for user creation
   9   return response
*/

// getting user details

const registerUser = asyncHandler(async (req, res) => {
   const { fullName, email, userName, password } = req.body;
   console.log("email :", email);

   /******   validation not empty   ******/
   if ([fullName, email, userName, password].some(
      (field) => field?.trim() === ""
   )) {
      throw new ApiError(400, "All fields are required");
   }
   // if (fullName===""){
   //    throw new ApiError(400,"fullName is required");
   // }


   // //    //check user is exist or not in db


   const existedUser = await User.findOne({
      $or: [{ userName }, { email }]
   })
   if (existedUser) {
      throw new ApiError(409, "user with email or username already exists")
   }

   // //    //check for image , check for avatar

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage?.[0]?.path

   if (!avatarLocalPath) {
      throw new ApiError(400, "avatar is required")
   }


   // //    //upload them on cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if (!req.files || !req.files.avatar || !req.files.avatar.length) {
      throw new ApiError(400, "avatar is required");
   }


   // //    // create user object and entry in db

   const user = await User.create({
      fullName,
      email,
      password,
      userName: userName.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || ""
   })

   const userCreated = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if (!userCreated) {
      throw new ApiError(500, "something went wrong while registring the user")
   }
   return res.status(201).json(
      new ApiResponse(200, userCreated, "user register successfully")
   )

})


export { registerUser };
