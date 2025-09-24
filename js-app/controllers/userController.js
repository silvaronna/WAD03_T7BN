const fs = require("fs");
const path = require("path");

// path file json
const DBpath = path.join(__dirname, "../db.json");

// baca isi file db.json 
function readDB(){
    const data = fs.readFileSync(DBpath, "utf-8");
    return JSON.parse(data);
}

// tulis isi file db.json
function writeDB(data){
    fs.writeFileSync(DBpath, JSON.stringify(data, null, 2), "utf-8");
}

const userController = {
    // untuk get all users
    getAllUsers: (req, res) => {
        const db = readDB();
        res.json(db.users);
    },

    // untuk tambah user
    addUser: (req, res) => {
        try {
            const db = readDB();
            const { username, name, email, role } = req.body;

            if (!username || !name || !email || !role) {
                return res.status(400).json({ error: "Semua field wajib diisi" });
            }

            // Validasi username unik
            if (db.users.find(u => u.username === username)) {
                return res.status(400).json({ error: "username sudah dipakai" });
            }

            // jika bukan buyer/seller tolak
            if (!["buyer", "seller"].includes(role)) {
                return res.status(400).json({ error: "role tidak valid! hanya buyer/seller" });
            }

            const newUser = { username, name, email, role };

            db.users.push(newUser);
            writeDB(db);

            // res.status(201).json(newUser);
            res.status(201).json({ 
                success: true,
                message: "User berhasil ditambahkan",
                data: newUser
            })
        } catch (err) {
            return res.status(500).json({ success: false, error: "Terjadi kesalahan saat membuat user" });
        }
    },

    updateUser: (req, res) => {
        try {
            const { username } = req.params;
            const { name, email, role } = req.body;

            const db = readDB();
            const user = db.users.find(u => u.username === username);

            if (!user) {
                return res.status(404).json({ error: "User tidak ditemukan" });
            }

            if (role && !["buyer", "seller"].includes(role)) {
                return res.status(400).json({ error: "role tidak valid! hanya buyer/seller" });
            }

            if (name) user.name = name;
            if (email) user.email = email;
            if (role) user.role = role;

            writeDB(db);
            res.status(200).json({ 
                success: true,
                message: "User berhasil diupdate",
                data: user
            })
            // res.json(user);
        } catch (err) {
            return res.status(500).json({ success: false, error: "Terjadi kesalahan saat mengupdate user" });
        }
    },

    deleteUser: (req, res) => {
        try {
            const { username } = req.params;

            const db = readDB();
            const userIndex = db.users.findIndex(u => u.username === username);

            if (userIndex === -1) {
                return res.status(404).json({ success: false, error: "User tidak ditemukan" });
            }

            // save data user untuk dikirim ke message
            const deletedUser = db.users[userIndex];

            // hapus user dari array
            db.users.splice(userIndex, 1);

            // save ke Json
            writeDB(db);

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
