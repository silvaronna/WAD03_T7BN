const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')

// POST /products/ - Create new product (Seller only)
router.post('/', productController.createProduct)

// GET /products/ - Get all products or products by username (Buyer and Seller)
router.get('/', productController.getAllProducts)

// GET /products/:product_name - Get product by name (Buyer and Seller)
router.get('/:product_name', productController.getProductByName)

// PUT /products/:product_name - Update product (Seller only - owner)
router.put('/:product_name', productController.updateProduct)

// DELETE /products/:product_name - Delete product (Seller only - owner)
router.delete('/:product_name', productController.deleteProduct)

module.exports = router