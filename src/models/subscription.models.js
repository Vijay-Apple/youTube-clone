import { mongoose, Schema, Types } from "mongoose";

const subscriptionShema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,   //one who is subscribe
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionShema)