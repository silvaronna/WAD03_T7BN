const userService = require("../services/userService");

const userController = {
    // untuk get all users
    getAllUsers: (req, res) => {
        const users = userService.getAllUsers();
        res.json(users);
    },

    // untuk tambah user
    addUser: (req, res) => {
        try {
            const newUser = userService.addUser(req.body)
            res.status(201).json({ 
                success: true,
                message: "User berhasil ditambahkan",
                data: newUser
            })
        } catch (err) {
            res.status(err.status || 500).json({ success: false, message: err.message });        
        }
    },

    updateUser: (req, res) => {
        try {
            const updatedUser = userService.updateUser(req.params.username, req.body)

            res.status(200).json({ 
                success: true,
                message: "User berhasil diupdate",
                data: updatedUser
            })
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, error: err.message || "Terjadi kesalahan saat mengupdate user" });
        }
    },

    deleteUser: (req, res) => {
        try {
   
            const deletedUser = userService.deleteUser(req.params.username)

            return res.status(200).json({
                success: true,
                message: "User berhasil dihapus",
                data: deletedUser
            });

        } catch (err){
            return res.status(500).json({ success: false, error: "Terjadi kesalahan saat menghapus user" });
        }
    }
};

module.exports = userController;
