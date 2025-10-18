const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');

// mock repository biar ga konek ke db
jest.mock('../repositories/userRepository');

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    // Testing 1: getAllUsers
    test('getAllUsers: menampilkan semua user', async () => {
        const mockUsers = [
            { username: "johndoe", name: "John Doe", email: "johndoe@example.com", role: "buyer" },
            { username: "janedoe", name: "Jane Doe", email: "janedoe@example.com", role: "seller" }
        ]

        // mock perilaku repository
        userRepository.getAll.mockResolvedValue(mockUsers);

        const result = await userService.getAllUsers();

        expect(result).toEqual(mockUsers);
        expect(userRepository.getAll).toHaveBeenCalledTimes(1);
    })

    test('addUser: berhasil nambah user baru', async () => {
        const newUser = { username: "johndoe", name: "John Doe", email: "johndoe@example.com", role: "buyer" };

        // mock: ketika username belum dipakai
        userRepository.findByUsername.mockResolvedValue(null);
        // mock hasil create
        userRepository.add.mockResolvedValue(newUser);

        const result = await userService.addUser(newUser);

        expect(result).toEqual(newUser);
        expect(userRepository.findByUsername).toHaveBeenCalledWith("johndoe");
        expect(userRepository.add).toHaveBeenCalledWith(newUser);
    })

    test('addUser: gagal nambah user baru karena username sudah dipakai', async () => {
        const newUser = { username: "johndoe", name: "John Doe", email: "johndoe@example.com", role: "buyer" };
    
        // mock: ketika username sudah dipakai
        userRepository.findByUsername.mockResolvedValue({ username: "johndoe" });
        
        await expect(
            userService.addUser(newUser))
            .rejects.toEqual({ status: 409, message: "username sudah digunakan!" })
    })

    test('addUser: gagal nambah user baru karena role tidak valid', async () => {
        const newUser = { username: "johndoe", name: "John Doe", email: "johndoe@example.com", role: "admint" };
    
        // mock: ketika username sudah dipakai
        userRepository.findByUsername.mockResolvedValue(null);
        
        await expect(
            userService.addUser(newUser))
            .rejects.toEqual({ status: 400, message: "role tidak valid! hanya buyer / seller yang diizinkan" })
    })

    test('updateUser: berhasil update user', async () => {
        const existingUser = { username: "johndoe", name: "John Doe", email: "johndoe@example.com", role: "buyer" };
        const updatedUser = { ...existingUser, name: "Johnathan Doelsalim" };

        // mock: ketika username sudah dipakai
        userRepository.findByUsername.mockResolvedValue(existingUser);
        // mock hasil update
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await userService.updateUser("johndoe", updatedUser);

        expect(result).toEqual(updatedUser);
        expect(userRepository.findByUsername).toHaveBeenCalledWith("johndoe");
        expect(userRepository.update).toHaveBeenCalledWith("johndoe", 
            expect.objectContaining({
                name: "Johnathan Doelsalim",
                email: existingUser.email,
                role: existingUser.role
            })
        )
    })

    test('updateUser: gagal update user karena user tidak ditemukan', async () => {
        // mock: ketika user tidak ditemukan
        userRepository.findByUsername.mockResolvedValue(null);
        await expect(
            userService.updateUser("johndoe", { name: "New Name" }))
            .rejects.toEqual({ status: 404, message: "User tidak ditemukan!" })
    })

    test('updateUser: gagal karena role tidak valid', async () => {
        const existingUser = { username: "johndoe", name: "John Doe", email: "johndoe@example.com", role: "buyer" };

        userRepository.findByUsername.mockResolvedValue(existingUser);

        await expect(userService.updateUser("johndoe", { role: "admin" }))
            .rejects.toEqual({ status: 400, message: "Role tidak valid! hanya buyer / seller yang diizinkan" });
    });

    test('deleteUser: berhasil hapus user', async () => {
        const deletedUser = { username: "johndoe" }

        userRepository.delete.mockResolvedValue(deletedUser);

        const result = await userService.deleteUser("johndoe");
        expect(result).toEqual(deletedUser);
        expect(userRepository.delete).toHaveBeenCalledWith("johndoe");
    })

    test('deleteUser: gagal hapus user karena tidak ditemukan', async () => {
        userRepository.delete.mockResolvedValue(null);

        await expect(userService.deleteUser("johndoe"))
            .rejects.toEqual({ status: 404, message: "User tidak ditemukan" })
    })

})