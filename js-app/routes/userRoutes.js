const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")

// Routing
router.get("/", userController.getAllUsers)
router.post("/", userController.addUser);
router.patch("/:username", userController.updateUser);
router.delete("/:username", userController.deleteUser);

module.exports = router;