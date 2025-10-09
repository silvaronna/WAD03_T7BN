const fs = require("fs")
const path = require("path")

const DBpath = path.join(__dirname, "../db.json")

const readDB = () => {
  try {
    const data = fs.readFileSync(DBpath, "utf-8")
    return JSON.parse(data)
  } catch {
    return { users: [], carts: [] }
  }
}

const writeDB = (data) => {
  fs.writeFileSync(DBpath, JSON.stringify(data, null, 2), "utf-8")
}

const CartRepository = {
  getUser(username) {
    const db = readDB()
    return db.users.find((u) => u.username === username)
  },

  getCart(username) {
    const db = readDB()
    if (!db.carts) db.carts = []
    let cart = db.carts.find((c) => c.username === username)
    if (!cart) {
      cart = { username, items: [] }
      db.carts.push(cart)
      writeDB(db)
    }
    return cart
  },

  updateCart(username, updatedCart) {
    const db = readDB()
    const idx = db.carts.findIndex((c) => c.username === username)
    if (idx === -1) db.carts.push(updatedCart)
    else db.carts[idx] = updatedCart
    writeDB(db)
    return updatedCart
  },
}

module.exports = CartRepository
