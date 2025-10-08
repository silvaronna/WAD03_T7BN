const fs = require("fs")
const path = require("path")

const DBpath = path.join(__dirname, "../db.json")

function readDB() {
  try {
    const data = fs.readFileSync(DBpath, "utf-8")
    return JSON.parse(data)
  } catch (e) {
    return { users: [], carts: [] }
  }
}

function writeDB(data) {
  fs.writeFileSync(DBpath, JSON.stringify(data, null, 2), "utf-8")
}

function ensureCartsArray(db) {
  if (!db.carts) db.carts = []
}

function findUser(db, username) {
  return db.users?.find((u) => u.username === username)
}

function assertBuyer(user) {
  if (!user) throw { code: 404, message: "User tidak ditemukan" }
  if (user.role !== "buyer") throw { code: 403, message: "Role tidak valid, hanya buyer yang memiliki cart" }
}

function findOrCreateCart(db, username) {
  ensureCartsArray(db)
  let cart = db.carts.find((c) => c.username === username)
  if (!cart) {
    cart = { username, items: [] }
    db.carts.push(cart)
  }
  return cart
}

function validatePayload(body) {
  const productId = body?.productId
  const qtyRaw = body?.quantity
  const qn = Number(qtyRaw)
  const quantity = Number.isFinite(qn) ? Math.trunc(qn) : 1

  if (!productId || typeof productId !== "string" || productId.trim() === "") {
    throw { code: 400, message: "Field 'productId' wajib diisi dan berupa string" }
  }
  if (quantity <= 0) {
    throw { code: 400, message: "Field 'quantity' harus lebih dari 0" }
  }

  return { productId, quantity }
}

const cartService = {
  getCart(username) {
    const db = readDB()
    const user = findUser(db, username)
    assertBuyer(user)

    const cart = findOrCreateCart(db, username)
    // simpan bila baru dibuat
    writeDB(db)

    return cart
  },

  addToCart(username, body) {
    const { productId, quantity } = validatePayload(body)
    const db = readDB()
    const user = findUser(db, username)
    assertBuyer(user)

    const cart = findOrCreateCart(db, username)

    const existing = cart.items.find((i) => i.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.items.push({ productId, quantity })
    }

    writeDB(db)
    return cart
  },

  removeFromCart(username, body) {
    const { productId, quantity } = validatePayload(body)
    const db = readDB()
    const user = findUser(db, username)
    assertBuyer(user)

    const cart = findOrCreateCart(db, username)

    const idx = cart.items.findIndex((i) => i.productId === productId)
    if (idx === -1) throw { code: 404, message: "Produk tidak ditemukan di cart" }

    cart.items[idx].quantity -= quantity
    if (cart.items[idx].quantity <= 0) {
      cart.items.splice(idx, 1)
    }

    writeDB(db)
    return cart
  },
}

module.exports = cartService
