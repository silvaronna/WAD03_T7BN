const productService = require("../services/productService");

const productController = {
  // POST /products/ - Create new product (Seller only)
  createProduct: async (req, res) => {
    try {
      const newProduct = await productService.createProduct(req.body);
      
      res.status(201).json({
        success: true,
        message: "Produk berhasil dibuat",
        data: newProduct
      });
    } catch (err) {
      res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || "Terjadi kesalahan saat membuat produk" 
      });
    }
  },

  // GET /products/ - Get all products or products by username (Buyer and Seller)
  getAllProducts: async (req, res) => {
    try {
      const { username } = req.query;
      let products;
      let message;
      
      if (username) {
        products = await productService.getProductByUsername(username);
        message = "Daftar produk milik " + username + " berhasil diambil";
      } else {
        products = await productService.getAllProducts();
        message = "Daftar produk berhasil diambil";
      }
      
      res.status(200).json({
        success: true,
        message: message,
        data: products,
        total: products.length
      });
    } catch (err) {
      res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || "Terjadi kesalahan saat mengambil daftar produk" 
      });
    }
  },

  // GET /products/:product_name - Get product by name (Buyer and Seller)
  getProductByName: async (req, res) => {
    try {
      const { product_name } = req.params;
      const { username } = req.query;
      
      const product = await productService.getProductByName(product_name, username);
      
      res.status(200).json({
        success: true,
        message: "Produk berhasil ditemukan",
        data: product
      });
    } catch (err) {
      res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || "Terjadi kesalahan saat mengambil produk" 
      });
    }
  },

  // PUT /products/:product_name - Update product (Seller only - owner)
  updateProduct: async (req, res) => {
    try {
      const { product_name } = req.params;
      const updatedProduct = await productService.updateProduct(product_name, req.body);
      
      res.status(200).json({
        success: true,
        message: "Produk berhasil diupdate",
        data: updatedProduct
      });
    } catch (err) {
      res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || "Terjadi kesalahan saat mengupdate produk" 
      });
    }
  },

  // DELETE /products/:product_name - Delete product (Seller only - owner)
  deleteProduct: async (req, res) => {
    try {
      const { product_name } = req.params;
      const { username } = req.body;
      
      const deletedProduct = await productService.deleteProduct(product_name, username);
      
      res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus",
        data: deletedProduct
      });
    } catch (err) {
      res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || "Terjadi kesalahan saat menghapus produk" 
      });
    }
  }
};

module.exports = productController