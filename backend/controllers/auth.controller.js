import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, error: "User already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hrs from creation
        });

        if (newUser) {
            await newUser.save();

            // generating JWT token
            generateTokenAndSetCookie(res, newUser._id);
            res.status(201).json({
                success: true,
                message: "user created successfully",
                user: {
                    ...newUser._doc,
                    password: undefined
                }
            });
        } else {
            res.status(400).json({ success: false, error: "Couldn't Sign up" });
        }
    } catch (error) {
        console.log("Error in Signup controller: ", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

export const login = async (req, res) => {

}

export const logout = async (req, res) => {

}