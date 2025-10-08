const userRepository = require("../repositories/userRepository");

const userService = {
    getAllUsers: () => {
        return userRepository.getAll()
    },

    addUser: ({ username, name, email, role }) => {
        if(!username || !name || !email || !role){
            throw { status: 404, message: "semua field wajib diisi!"}
        }
        
        if(userRepository.findByUsername(username)){
            throw { status: 409,  message: "username sudah digunakan!" }
        }

        if(!["buyer", "seller"].includes(role)){
            throw { status: 400, message: "role tidak valid! hanya buyer / seller yang diizinkan"}
        }

        const newUser = { username, name, email, role }

        return userRepository.add(newUser)
    },

    updateUser: (username, { name, email, role }) => {
        const user = userRepository.findByUsername(username)

        if(!user){
            throw { status: 404, message: "User tidak ditemukan!" }
        }

        if (role && !["buyer", "seller"].includes(role)) {
            throw { status: 400, message: "Role tidak valid! hanya buyer / seller yang diizinkan" }
        }

        const updatedData = {};
        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (role) updatedData.role = role;

        return userRepository.update(username, updatedData)
    },

    deleteUser: (username) => {
        const deleted = userRepository.delete(username)

        if (!deleted){
            throw { status: 404, message: "User tidak ditemukan" }
        }

        return deleted
    }
}

module.exports = userService;