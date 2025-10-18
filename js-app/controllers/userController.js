const userService = require("../services/userService");

const userController = {
    // untuk get all users
    getAllUsers:  async (req, res) => {
        const users = await userService.getAllUsers();
        res.json(users);
    },

    // untuk tambah user
    addUser: async (req, res) => {
        try {
            const newUser = await userService.addUser(req.body)
            res.status(201).json({ 
                success: true,
                message: "User berhasil ditambahkan",
                data: newUser
            })
        } catch (err) {
            res.status(err.status || 500).json({ success: false, message: err.message });        
        }
    },

    updateUser: async (req, res) => {
        try {
            const updatedUser = await userService.updateUser(req.params.username, req.body)

            res.status(200).json({ 
                success: true,
                message: "User berhasil diupdate",
                data: updatedUser
            })
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, error: err.message || "Terjadi kesalahan saat mengupdate user" });
        }
    },

    deleteUser: async (req, res) => {
        try {

            const deletedUser = await userService.deleteUser(req.params.username)

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
