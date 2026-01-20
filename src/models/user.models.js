import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String
        },
        coverImage: {
            type: String,
        },
        avatar: {
            type: String, //cloudinary url
        }
    },
    { timestamps: true });

    //FOR PASSWORD ENCRYPTED

userSchema.pre("save",function (next){
    if( ! this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect = async function name(params) {
    
}
export const User = mongoose.model("User", userSchema);