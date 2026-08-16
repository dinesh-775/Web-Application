import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function auth(req, res, next) {
    try {
        const h = req.headers.authorization || "";

        const token = h.startsWith("Bearer ")
            ? h.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = await User.findById(payload.id)
            .select("-passwordHash");

        if (!req.user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        next();
    } catch (e) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

export function roles(...allowed) {
    return (req, res, next) => {
        if (allowed.includes(req.user?.role)) {
            return next();
        }

        return res.status(403).json({
            message: "Forbidden"
        });
    };
}

export async function optionalAuth(req, res, next) {
    try {
        const h = req.headers.authorization || "";

        const token = h.startsWith("Bearer ")
            ? h.slice(7)
            : null;

        if (token) {
            const payload = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user = await User.findById(payload.id)
                .select("-passwordHash");
        }
    } catch (e) {
        // Optional authentication:
        // continue even if token is invalid.
    }

    next();
}