import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    const token = req.cookies["auth-token"];
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized. Token not provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized. Invalid Token" });

        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("Error in verifyToken Middleware: ", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}