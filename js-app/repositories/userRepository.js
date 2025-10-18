const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const userRepository = {
    getAll: async () => {
        const users = await prisma.user.findMany();
        return users;
    },

    findByUsername: async (username) => {
        return await prisma.user.findUnique({
            where: { username }
        });
    },

    add: async (userData) => {
        return await prisma.user.create({
            data: userData
        });
    },

    update: async (username, updatedData) => {
        return await prisma.user.update({
            where: { username },
            data: updatedData
        });
    },

    delete: async (username) => {
        return await prisma.user.delete({
            where: { username }
        });
    },
};

module.exports = userRepository;


