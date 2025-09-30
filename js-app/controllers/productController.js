const fs = require("fs")
const path = require("path")

const DBpath = path.join(__dirname, "../db.json")

function readDB() {
  try {
    const data = fs.readFileSync(DBpath, "utf-8")
    return JSON.parse(data)
  } catch (e) {
    return { users: [], carts: [], products: [] }
  }
}

function writeDB(data) {
  fs.writeFileSync(DBpath, JSON.stringify(data, null, 2), "utf-8")
}

function ensureProductsArray(db) {
  if (!db.products) db.products = []
}

function findUser(db, username) {
  return db.users?.find((u) => u.username === username)
}

function assertSeller(user) {
  if (!user) return { ok: false, code: 404, msg: "User tidak ditemukan" }
  if (user.role !== "seller") return { ok: false, code: 403, msg: "Akses ditolak! Hanya seller yang dapat mengelola produk" }
  return { ok: true }
}

function assertValidUser(user) {
  if (!user) return { ok: false, code: 404, msg: "User tidak ditemukan" }
  if (user.role !== "buyer" && user.role !== "seller") return { ok: false, code: 403, msg: "Role tidak valid" }
  return { ok: true }
}

function validateProductPayload(body) {
  const { product_name, product_category, price } = body

  if (!product_name || typeof product_name !== "string" || product_name.trim() === "") {
    return { ok: false, msg: "product_name wajib diisi dan berupa string" }
  }

  if (!product_category || typeof product_category !== "string" || product_category.trim() === "") {
    return { ok: false, msg: "product_category wajib diisi dan berupa string" }
  }

  const priceNum = Number(price)
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    return { ok: false, msg: "price harus berupa angka positif" }
  }

  return { 
    ok: true, 
    product_name: product_name.trim(),
    product_category: product_category.trim(),
    price: priceNum
  }
}

const productController = {
  // POST /products/ - Create new product (Seller only)
  createProduct: (req, res) => {
    try {
      const { username } = req.body
      
      if (!username) {
        return res.status(400).json({ success: false, error: "Username wajib diisi" })
      }

      const validation = validateProductPayload(req.body)
      if (!validation.ok) {
        return res.status(400).json({ success: false, error: validation.msg })
      }

      const { product_name, product_category, price } = validation

      const db = readDB()

      const user = findUser(db, username)
      const check = assertSeller(user)
      if (!check.ok) {
        return res.status(check.code).json({ success: false, error: check.msg })
      }

      ensureProductsArray(db)

      // Check if product name already exists
      const existingProduct = db.products.find(p => p.product_name === product_name)
      if (existingProduct) {
        return res.status(400).json({ success: false, error: "Nama produk sudah ada" })
      }

      const newProduct = {
        product_name,
        product_category,
        price,
        owner: username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      db.products.push(newProduct)
      writeDB(db)

      return res.status(201).json({
        success: true,
        message: "Produk berhasil dibuat",
        data: newProduct
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat membuat produk" })
    }
  },

  // GET /products/ - Get all products (Buyer and Seller)
  getAllProducts: (req, res) => {
    try {
      const { username } = req.query

      if (!username) {
        return res.status(400).json({ success: false, error: "Username wajib diisi sebagai query parameter" })
      }

      const db = readDB()

      const user = findUser(db, username)
      const check = assertValidUser(user)
      if (!check.ok) {
        return res.status(check.code).json({ success: false, error: check.msg })
      }

      ensureProductsArray(db)

      return res.status(200).json({
        success: true,
        message: "Daftar produk berhasil diambil",
        data: db.products,
        total: db.products.length
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat mengambil daftar produk" })
    }
  },

  // GET /products/:product_name - Get product by name (Buyer and Seller)
  getProductByName: (req, res) => {
    try {
      const { product_name } = req.params
      const { username } = req.query

      if (!username) {
        return res.status(400).json({ success: false, error: "Username wajib diisi sebagai query parameter" })
      }

      const db = readDB()

      const user = findUser(db, username)
      const check = assertValidUser(user)
      if (!check.ok) {
        return res.status(check.code).json({ success: false, error: check.msg })
      }

      ensureProductsArray(db)

      const product = db.products.find(p => p.product_name === product_name)
      if (!product) {
        return res.status(404).json({ success: false, error: "Produk tidak ditemukan" })
      }

      return res.status(200).json({
        success: true,
        message: "Produk berhasil ditemukan",
        data: product
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat mengambil produk" })
    }
  },

  // PUT /products/:product_name - Update product (Seller only - owner)
  updateProduct: (req, res) => {
    try {
      const { product_name } = req.params
      const { username } = req.body

      if (!username) {
        return res.status(400).json({ success: false, error: "Username wajib diisi" })
      }

      const validation = validateProductPayload(req.body)
      if (!validation.ok) {
        return res.status(400).json({ success: false, error: validation.msg })
      }

      const { product_category, price } = validation
      const new_product_name = validation.product_name

      const db = readDB()

      const user = findUser(db, username)
      const check = assertSeller(user)
      if (!check.ok) {
        return res.status(check.code).json({ success: false, error: check.msg })
      }

      ensureProductsArray(db)

      const productIndex = db.products.findIndex(p => p.product_name === product_name)
      if (productIndex === -1) {
        return res.status(404).json({ success: false, error: "Produk tidak ditemukan" })
      }

      const product = db.products[productIndex]

      // Check if user is the owner
      if (product.owner !== username) {
        return res.status(403).json({ success: false, error: "Anda hanya dapat mengupdate produk milik sendiri" })
      }

      // Check if new product name already exists (if changed)
      if (new_product_name !== product_name) {
        const existingProduct = db.products.find(p => p.product_name === new_product_name)
        if (existingProduct) {
          return res.status(400).json({ success: false, error: "Nama produk baru sudah ada" })
        }
      }

      // Update product
      db.products[productIndex] = {
        ...product,
        product_name: new_product_name,
        product_category,
        price,
        updated_at: new Date().toISOString()
      }

      writeDB(db)

      return res.status(200).json({
        success: true,
        message: "Produk berhasil diupdate",
        data: db.products[productIndex]
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat mengupdate produk" })
    }
  },

  // DELETE /products/:product_name - Delete product (Seller only - owner)
  deleteProduct: (req, res) => {
    try {
      const { product_name } = req.params
      const { username } = req.body

      if (!username) {
        return res.status(400).json({ success: false, error: "Username wajib diisi" })
      }

      const db = readDB()

      const user = findUser(db, username)
      const check = assertSeller(user)
      if (!check.ok) {
        return res.status(check.code).json({ success: false, error: check.msg })
      }

      ensureProductsArray(db)

      const productIndex = db.products.findIndex(p => p.product_name === product_name)
      if (productIndex === -1) {
        return res.status(404).json({ success: false, error: "Produk tidak ditemukan" })
      }

      const product = db.products[productIndex]

      // Check if user is the owner
      if (product.owner !== username) {
        return res.status(403).json({ success: false, error: "Anda hanya dapat menghapus produk milik sendiri" })
      }

      // Remove product
      const deletedProduct = db.products.splice(productIndex, 1)[0]
      writeDB(db)

      return res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus",
        data: deletedProduct
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: "Terjadi kesalahan saat menghapus produk" })
    }
  }
}

module.exports = productController