const express = require("express")
const router = express.Router()
const cartController = require("../controllers/cartController")

const { getCart, addToCart, removeFromCart } = cartController || {}
if (typeof getCart !== "function" || typeof addToCart !== "function" || typeof removeFromCart !== "function") {
  throw new Error("[cartRoutes] Controller functions are not properly exported")
}

// Define specific routes first (add/remove), then general get
router.post("/:username/add", addToCart)
router.post("/:username/remove", removeFromCart)
router.get("/:username", getCart)

module.exports = router
