const CartRepository = require("../repositories/cartRepository")

function assertBuyer(user) {
  if (!user) throw { code: 404, message: "User tidak ditemukan" }
  if (user.role !== "buyer") throw { code: 403, message: "Role tidak valid, hanya buyer yang memiliki cart" }
}

function validatePayload(body) {
  const productId = body?.productId
  const qn = Number(body?.quantity)
  const quantity = Number.isFinite(qn) ? Math.trunc(qn) : 1

  if (!productId || typeof productId !== "string" || productId.trim() === "")
    throw { code: 400, message: "Field 'productId' wajib diisi dan berupa string" }

  if (quantity <= 0)
    throw { code: 400, message: "Field 'quantity' harus lebih dari 0" }

  return { productId, quantity }
}

const CartService = {
  getCart(username) {
    const user = CartRepository.getUser(username)
    assertBuyer(user)
    return CartRepository.getCart(username)
  },

  addToCart(username, body) {
    const { productId, quantity } = validatePayload(body)
    const user = CartRepository.getUser(username)
    assertBuyer(user)

    const cart = CartRepository.getCart(username)
    const existing = cart.items.find((i) => i.productId === productId)

    if (existing) existing.quantity += quantity
    else cart.items.push({ productId, quantity })

    return CartRepository.updateCart(username, cart)
  },

  removeFromCart(username, body) {
    const { productId, quantity } = validatePayload(body)
    const user = CartRepository.getUser(username)
    assertBuyer(user)

    const cart = CartRepository.getCart(username)
    const idx = cart.items.findIndex((i) => i.productId === productId)
    if (idx === -1) throw { code: 404, message: "Produk tidak ditemukan di cart" }

    cart.items[idx].quantity -= quantity
    if (cart.items[idx].quantity <= 0) cart.items.splice(idx, 1)

    return CartRepository.updateCart(username, cart)
  },
}

module.exports = CartService
