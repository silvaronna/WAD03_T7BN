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
  if (!user) return { ok: false, code: 404, msg: "User tidak ditemukan" }
  if (user.role !== "buyer") return { ok: false, code: 400, msg: "role tidak valid! hanya buyer yang memiliki cart" }
  return { ok: true }
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
    return { ok: false, msg: "productId wajib diisi dan berupa string" }
  }
  if (quantity <= 0) {
    return { ok: false, msg: "quantity harus lebih dari 0" }
  }
  return { ok: true, productId, quantity }
}

const cartController = {
  getCart: (req, res) => {
    try {
      const { username } = req.params
      const db = readDB()

      const user = findUser(db, username)
      const check = assertBuyer(user)
      if (!check.ok) return res.status(check.code).json({ success: false, error: check.msg })

      const cart = findOrCreateCart(db, username)
      // simpan bila baru dibuat
      writeDB(db)

      return res.status(200).json({
        success: true,
        message: "Cart berhasil diambil",
        data: cart,
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat mengambil cart" })
    }
  },

  addToCart: (req, res) => {
    try {
      const { username } = req.params
      const validation = validatePayload(req.body)
      if (!validation.ok) return res.status(400).json({ success: false, error: validation.msg })

      const { productId, quantity } = validation

      const db = readDB()

      const user = findUser(db, username)
      const check = assertBuyer(user)
      if (!check.ok) return res.status(check.code).json({ success: false, error: check.msg })

      const cart = findOrCreateCart(db, username)

      const existing = cart.items.find((i) => i.productId === productId)
      if (existing) {
        existing.quantity += quantity
      } else {
        cart.items.push({ productId, quantity })
      }

      writeDB(db)

      return res.status(200).json({
        success: true,
        message: "Produk berhasil ditambahkan ke cart",
        data: cart,
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat menambahkan ke cart" })
    }
  },

  removeFromCart: (req, res) => {
    try {
      const { username } = req.params
      const validation = validatePayload(req.body)
      if (!validation.ok) return res.status(400).json({ success: false, error: validation.msg })

      const { productId, quantity } = validation

      const db = readDB()

      const user = findUser(db, username)
      const check = assertBuyer(user)
      if (!check.ok) return res.status(check.code).json({ success: false, error: check.msg })

      const cart = findOrCreateCart(db, username)

      const idx = cart.items.findIndex((i) => i.productId === productId)
      if (idx === -1) {
        return res.status(404).json({ success: false, error: "Produk tidak ditemukan di cart" })
      }

      cart.items[idx].quantity -= quantity
      if (cart.items[idx].quantity <= 0) {
        cart.items.splice(idx, 1)
      }

      writeDB(db)

      return res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus/dikurangi dari cart",
        data: cart,
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat menghapus dari cart" })
    }
  },
}

module.exports = cartController
