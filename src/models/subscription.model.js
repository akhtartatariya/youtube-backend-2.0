import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // this is who is subscribing
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // this is who is subscribed
    }
},{timestamps:true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema)