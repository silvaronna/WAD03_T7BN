const productRepository = require("../repositories/productRepository");
const fs = require("fs");
const path = require("path");

const DBpath = path.join(__dirname, "../db.json");

function readDB() {
  try {
    const data = fs.readFileSync(DBpath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { users: [], carts: [], products: [] };
  }
}

function findUser(db, username) {
  return db.users?.find((u) => u.username === username);
}

function validateProductPayload({ product_name, product_category, price }) {
  if (!product_name || typeof product_name !== "string" || product_name.trim() === "") {
    throw { status: 400, message: "product_name wajib diisi dan berupa string" };
  }

  if (!product_category || typeof product_category !== "string" || product_category.trim() === "") {
    throw { status: 400, message: "product_category wajib diisi dan berupa string" };
  }

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    throw { status: 400, message: "price harus berupa angka positif" };
  }

  return {
    product_name: product_name.trim(),
    product_category: product_category.trim(),
    price: priceNum
  };
}

function assertValidUser(user) {
  if (!user) {
    throw { status: 404, message: "User tidak ditemukan" };
  }
  if (user.role !== "buyer" && user.role !== "seller") {
    throw { status: 403, message: "Role tidak valid" };
  }
}

function assertSeller(user) {
  if (!user) {
    throw { status: 404, message: "User tidak ditemukan" };
  }
  if (user.role !== "seller") {
    throw { status: 403, message: "Akses ditolak! Hanya seller yang dapat mengelola produk" };
  }
}

const productService = {
  getAllProducts: async (username) => {
    if (!username) {
      throw { status: 400, message: "Username wajib diisi" };
    }

    const db = readDB();
    const user = findUser(db, username);
    assertValidUser(user);

    return await productRepository.getAll();
  },

  getProductByName: async (productName, username) => {
    if (!username) {
      throw { status: 400, message: "Username wajib diisi" };
    }

    const db = readDB();
    const user = findUser(db, username);
    assertValidUser(user);

    const product = await productRepository.findByName(productName);
    if (!product) {
      throw { status: 404, message: "Produk tidak ditemukan" };
    }

    return product;
  },

  createProduct: async ({ username, product_name, product_category, price }) => {
    if (!username) {
      throw { status: 400, message: "Username wajib diisi" };
    }

    const validatedData = validateProductPayload({ product_name, product_category, price });

    const db = readDB();
    const user = findUser(db, username);
    assertSeller(user);

    // Check if product name already exists
    const existingProduct = await productRepository.findByName(validatedData.product_name);
    if (existingProduct) {
      throw { status: 400, message: "Nama produk sudah ada" };
    }

    const newProduct = {
      ...validatedData,
      owner: username
    };

    return await productRepository.add(newProduct);
  },

  updateProduct: async (productName, { username, product_name, product_category, price }) => {
    if (!username) {
      throw { status: 400, message: "Username wajib diisi" };
    }

    const validatedData = validateProductPayload({ product_name, product_category, price });

    const db = readDB();
    const user = findUser(db, username);
    assertSeller(user);

    const product = await productRepository.findByName(productName);
    if (!product) {
      throw { status: 404, message: "Produk tidak ditemukan" };
    }

    // Check if user is the owner
    if (product.owner !== username) {
      throw { status: 403, message: "Anda hanya dapat mengupdate produk milik sendiri" };
    }

    // Check if new product name already exists (if changed)
    if (validatedData.product_name !== productName) {
      const existingProduct = await productRepository.findByName(validatedData.product_name);
      if (existingProduct) {
        throw { status: 400, message: "Nama produk baru sudah ada" };
      }
    }

    return await productRepository.update(productName, validatedData);
  },

  deleteProduct: async (productName, username) => {
    if (!username) {
      throw { status: 400, message: "Username wajib diisi" };
    }

    const db = readDB();
    const user = findUser(db, username);
    assertSeller(user);

    const product = await productRepository.findByName(productName);
    if (!product) {
      throw { status: 404, message: "Produk tidak ditemukan" };
    }

    // Check if user is the owner
    if (product.owner !== username) {
      throw { status: 403, message: "Anda hanya dapat menghapus produk milik sendiri" };
    }

    return await productRepository.delete(productName);
  }
};

module.exports = productService;
