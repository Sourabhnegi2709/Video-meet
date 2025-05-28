import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    history: [
        {
            roomId: {
                type: String,
                required: true,
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
});


const User = mongoose.model("User", userSchema);

export default   User ;
