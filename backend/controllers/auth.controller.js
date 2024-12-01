import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
    sendPasswordResetEmail,
    sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail
} from "../mailtrap/email.js";

export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, emessage: "All fields are required" });
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, emessage: "User already Exists" });
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
            //sending verification email
            await sendVerificationEmail(newUser.email, verificationToken);

            res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    ...newUser._doc,
                    password: undefined
                }
            });
        } else {
            res.status(400).json({ success: false, emessage: "Couldn't Sign up" });
        }
    } catch (error) {
        console.log("Error in Signup controller: ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "No such user exists. Try Signing up" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid Login Credentials" });
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        console.log("Error in Login controller: ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("auth-token");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in Logout controller: ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() } // expires at date > date.now()
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "invalid or expired Verification Code" });
        }

        user.isVerified = true;
        //cleanup state after verification
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        console.log("Error in email verification controller: ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "No such user exists. Try Signing up" });
        }

        //generating resetPassword token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        // sending password reset email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json({ success: true, message: "Password Reset link send to your email" });
    } catch (error) {
        console.log("Error in forgot password controller: ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "invalid or expired reset password token" });
        }

        // updating the password
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword,
            user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);
        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log("Error in reset password controller: ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        console.log("Error in checkAuth controller: ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}