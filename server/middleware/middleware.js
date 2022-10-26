import jwt from "jsonwebtoken";
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
            if (error) {
                return res.sendStatus(500);
            }

            //Check if the user exists
            User.findOne({
                where: { id: decoded.id }
            }).then((user) => {
                if (user) {
                    req.user = user.toJSON();
                    return next();
                }
            }).catch((error) => {
                return res.status(403).json({ error: "User not found" });
            });

        });
    }
    else {
        return res.sendStatus(403);
    }
};

const handleError = async (error, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        error: error.message
    });
};

const routeNotFound = async (req, res) => {
    res.status(404).json({ error: "Route not found" });
};

export default { routeNotFound, authMiddleware, handleError }

