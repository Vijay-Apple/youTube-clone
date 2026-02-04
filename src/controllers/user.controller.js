
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';



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

const generateAccessAndRefreshToken = async (userId) => {
   try {
      const user = await User.findById(userId)

      const accessToken = user.generateAccessToken()

      const refreshToken = user.generateSecretToken()

      user.refreshToken = refreshToken
      user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }


   } catch (error) {
      throw new ApiError(500, "something went wrong while generating accessAndRefresh token")
   }

}
// getting user details from frentend 

const registerUser = asyncHandler(async (req, res) => {
   const { fullName, email, userName, password } = req.body;
   // console.log("email :", email);
   for (let key in req.body) {
      console.log(req.body[key]);
   }

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

const loginUser = asyncHandler(async (req, res) => {
   // req.bidy->data,
   // get user details email,username
   // validation password ,username
   // accessToken.refreshToken
   // what i want give to user details on frontend
   //send cokies

   const { userName, email, password } = req.body
   if (!userName && !email) {
      throw new ApiError(400, "userName and email is required");

   }

   const user = await User.findOne({
      $or: [{ userName }, { email }]
   })
   if (!user) {
      throw new ApiError(404, "user does not exists")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid) {
      throw new ApiError(401, "invalid user credentials")
   }

   const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

   const loogedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,
            {
               user: loogedInUser, accessToken, refreshToken
            },
            "user Logged in succesfully"
         )
      )


})
const logoutUser = asyncHandler(async (req, res, next) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {
            refreshToken: 1
         }
      },
      { new: true }
   )
   const options = {
      httpOnly: true,
      secure: true
   }
   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User LggedOut Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

   if (!incomingRefreshToken) {
      throw new ApiError(401, "No refresh token provided");
   }

   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken._id);

      if (!user) {
         throw new ApiError(401, "Invalid refresh token");
      }

      if (incomingRefreshToken !== user.refreshToken) {
         throw new ApiError(401, "Refresh token expired or reused");
      }

      const { accessToken, refreshToken } =
         await generateAccessAndRefreshToken(user._id);

      const options = {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "strict"
      };

      return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(
            new ApiResponse(
               200,
               { accessToken, refreshToken },
               "Access token refreshed"
            )
         );
   } catch (error) {
      throw new ApiError(401, error.message || "Invalid refresh token");
   }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
   const { oldPassword, newPassword } = req.body
   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
   if (!isPasswordCorrect) {
      throw new ApiError(401, "password is not matched");
   }
   user.password = newPassword;
   await user.save({ validateBeforeSave: false })

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "password change successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(new ApiResponse(200, req.user, "current user fatched successfully")
      )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
   const { fullName, email } = req.body
   if (!fullName || !email) {
      throw new ApiError(400, "all fields are required")
   }
   const user = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            fullName: fullName,
            email: email
         },
      },
      { new: true }
   ).select("-password")

   return res
      .status(200)
      .json(new ApiResponse(200, user, "account details are updated dsuccessfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocal_Path = req.file?.path
   if (!avatarLocal_Path) {
      throw new ApiError(400, "avatar file is missing");
   }
   const avatar = await uploadOnCloudinary(avatarLocal_Path);
   if (!avatar.url) {
      throw new ApiError(400, "error while uploading avatar file")
   }
   const user = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      { new: true }
   ).select("-password");

   return res
      .status(200)
      .json(new ApiResponse(200, user, "avatar update succefully"))



})

const updateCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path
   if (!coverImageLocalPath) {
      throw new ApiError(400, "coverImage is missing")
   }
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if (!coverImage.url) {
      throw new ApiError(400, "error while uploading coverImage file")
   }
   const user = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      { new: true }
   ).select("-password");

   return res
      .status(200)
      .json(new ApiResponse(200, user, "coverImage update succefully"))


})

const getUserChannelProfile = asyncHandler(async (req, res) => {
   const { userName } = req.params
   if (!userName) {
      throw new ApiError(401, "userName is missing")
   }
   const channel = await User.aggregate([
      {
         $match: {
            userName: userName
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"

         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
         }
      },
      {
         $addFields: {
            subscriberCount: {
               $size: "$subscribers"
            },
            channelsSubscribedToCount: {
               $size: "$subscribedTo"
            },
            isSubscribed: {
               $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false
               }
            }
         }
      },
      {
         $project: {
            fullName: 1,
            userName: 1,
            subscriberCount: 1,
            channelsSubscribedToCount: 1,
            email: 1,
            coverImage: 1,
            avatar: 1

         }
      }
   ])
   if (!channel?.length) {
      throw new ApiResponse(404, "channel is not exists")
   }
   return res
      .status(200)
      .json(new ApiResponse(
         200,
         channel[0],
         "user channel fetched successFully"
      ))

})

const getWatchHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate(
      [
         {
            $match: {
               _id: new mongoose.Types.ObjectId(req.user._id)
            }

         },
         {
            $lookup: {
               from: "videos",
               localField: "watchHistory",
               foreignField: "_id",
               as: "watchHistory",
               pipeline: [
                  {
                     $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                           {
                              $project: {
                                 fullName: 1,
                                 userName: 1,
                                 avatar: 1
                              }
                           }
                        ]
                     }
                  },
                  {
                     $addFields: {
                        owner: {
                           $first: "$owner"
                        }
                     }
                  }
               ]
            }

         },
      ]
   )
   if (!user?.length) {
      throw new ApiError(404, "user is not defined")
   }
   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            user[0].watchHistory,
            "warch history fetched successfully"
         )
      )
})


export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateCoverImage,
   updateUserAvatar,
   getWatchHistory,
   getUserChannelProfile

};