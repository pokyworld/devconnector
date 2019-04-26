const config = require('config');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    // Check for token
    if (!token) return res.status(401).json({ success: false, message: "No token. Authorization denied!" });

    try {
        // Verify token
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // Add user from payload
        req.user = decoded;
        next();

    } catch (e) {
        res.status(400).json({ success: false, message: "Token is not valid" });
    }
}

module.exports = auth;