const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const productRepository = {
    getAll: async () => {
        const products = await prisma.product.findMany();
        return products;
    },

    findByName: async (productName) => {
        return await prisma.product.findUnique({
            where: { product_name: productName }
        });
    },

    add: async (productData) => {
        return await prisma.product.create({
            data: productData
        });
    },

    update: async (productName, updatedData) => {
        return await prisma.product.update({
            where: { product_name: productName },
            data: updatedData
        });
    },

    delete: async (productName) => {
        return await prisma.product.delete({
            where: { product_name: productName }
        });
    },
};

module.exports = productRepository;
