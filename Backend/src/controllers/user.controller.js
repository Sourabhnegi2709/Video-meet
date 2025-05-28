import User from '../models/usermodels.js';
import Meeting from '../models/meeting.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Login Controller
export const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ name });

        if (!user) {
            console.log("❌ User Not Found");
            return res.status(401).json({ message: "Invalid name or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid name or password." });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login successful",
            user: { name: user.name, username: user.username },
            token
        });

    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Register Controller
export const register = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        console.log("🆕 Registering User:", username);
        console.log("🔑 Original Password:", password);

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("🔐 Hashed Password Before Saving:", hashedPassword);

        const user = new User({ name, username, password: hashedPassword });

        await user.save();

        console.log("✅ User Saved in DB:", user);

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("❌ Register Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};



// Logout Controller
export const logout = (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("❌ Logout Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

