const getProfile = async (req, res) => {
    try {
        // req.user comes from the protect middleware
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile };
