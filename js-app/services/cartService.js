// js-app/services/cartService.js
const CartRepository = require("../repositories/cartRepository");

function assertBuyer(user) {
  if (!user) throw { code: 404, message: "User tidak ditemukan" };
  if (user.role !== "buyer") throw { code: 403, message: "Role tidak valid, hanya buyer yang memiliki cart" };
}

function validatePayload(body) {
  const productId = body?.productId;
  const qn = Number(body?.quantity);
  const quantity = Number.isFinite(qn) ? Math.trunc(qn) : 1;

  if (!productId || typeof productId !== "string" || productId.trim() === "")
    throw { code: 400, message: "Field 'productId' wajib diisi dan berupa string" };

  if (quantity <= 0)
    throw { code: 400, message: "Field 'quantity' harus lebih dari 0" };

  return { productId, quantity };
}

const CartService = {
  async getCart(username) {
    const user = await CartRepository.getUser(username);
    assertBuyer(user);

    const cart = await CartRepository.getCart(username);
    // Normalisasi bentuk supaya mirip db.json strukture lama
    return {
      username,
      items: cart.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
    };
  },

  async addToCart(username, body) {
    const { productId, quantity } = validatePayload(body);
    const user = await CartRepository.getUser(username);
    assertBuyer(user);

    const cart = await CartRepository.getCart(username);
    const items = cart.items.slice(); // shallow copy

    const existing = items.find((i) => i.productId === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }

    const updatedCart = await CartRepository.updateCart(username, { username, items });
    return {
      username,
      items: updatedCart.items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
    };
  },

  async removeFromCart(username, body) {
    const { productId, quantity } = validatePayload(body);
    const user = await CartRepository.getUser(username);
    assertBuyer(user);

    const cart = await CartRepository.getCart(username);
    const items = cart.items.slice();
    const idx = items.findIndex((i) => i.productId === productId);
    if (idx === -1) throw { code: 404, message: "Produk tidak ditemukan di cart" };

    items[idx].quantity -= quantity;
    if (items[idx].quantity <= 0) items.splice(idx, 1);

    const updatedCart = await CartRepository.updateCart(username, { username, items });
    return {
      username,
      items: updatedCart.items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
    };
  },
};

module.exports = CartService;
