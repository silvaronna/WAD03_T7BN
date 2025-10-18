// js-app/repositories/cartRepository.js
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const CartRepository = {
  async getUser(username) {
    return await prisma.user.findUnique({
      where: { username },
    });
  },

  /**
   * getCart: returns cart with items for a given username.
   * If user has no cart, create empty cart.
   */
  async getCart(username) {
    const user = await this.getUser(username);
    if (!user) return null;

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user: { connect: { id: user.id } },
        },
        include: { items: true },
      });
    }

    return cart;
  },

  /**
   * updateCart: replace items of cart with given items array.
   * updatedCart should be { username, items: [{ productId, quantity }, ...] }
   */
  async updateCart(username, updatedCart) {
    const user = await this.getUser(username);
    if (!user) throw { code: 404, message: "User tidak ditemukan" };

    // ensure cart exists
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user: { connect: { id: user.id } } },
      });
    }

    // Use transaction: delete old items, create new items
    const tx = await prisma.$transaction(async (prismaTx) => {
      await prismaTx.cartItem.deleteMany({ where: { cartId: cart.id } });

      const createManyData = (updatedCart.items || []).map((it) => ({
        cartId: cart.id,
        productId: it.productId,
        quantity: it.quantity,
      }));

      if (createManyData.length > 0) {
        await prismaTx.cartItem.createMany({ data: createManyData });
      }

      return await prismaTx.cart.findUnique({
        where: { id: cart.id },
        include: { items: true },
      });
    });

    return tx;
  },
};

module.exports = CartRepository;
