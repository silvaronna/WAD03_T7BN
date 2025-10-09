const CartService = require("../services/cartService")

const CartController = {
  getCart(req, res) {
    const { username } = req.params
    try {
      const cart = CartService.getCart(username)
      res.status(200).json({
        success: true,
        message: "Cart berhasil diambil",
        data: cart,
      })
    } catch (err) {
      res.status(err.code || 500).json({
        success: false,
        error: err.message || "Terjadi kesalahan saat mengambil cart",
      })
    }
  },

  addToCart(req, res) {
    const { username } = req.params
    try {
      const cart = CartService.addToCart(username, req.body)
      res.status(200).json({
        success: true,
        message: "Produk berhasil ditambahkan ke cart",
        data: cart,
      })
    } catch (err) {
      res.status(err.code || 500).json({
        success: false,
        error: err.message || "Terjadi kesalahan saat menambahkan ke cart",
      })
    }
  },

  removeFromCart(req, res) {
    const { username } = req.params
    try {
      const cart = CartService.removeFromCart(username, req.body)
      res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus/dikurangi dari cart",
        data: cart,
      })
    } catch (err) {
      res.status(err.code || 500).json({
        success: false,
        error: err.message || "Terjadi kesalahan saat menghapus dari cart",
      })
    }
  },
}

module.exports = CartController
