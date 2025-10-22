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

function writeDB(data) {
  fs.writeFileSync(DBpath, JSON.stringify(data, null, 2), "utf-8");
}

function ensureProductsArray(db) {
  if (!db.products) db.products = [];
}

const productRepository = {
  getAll: async () => {
    const db = readDB();
    ensureProductsArray(db);
    return db.products;
  },

  findByName: async (productName) => {
    const db = readDB();
    ensureProductsArray(db);
    return db.products.find(p => p.product_name === productName);
  },

  add: async (productData) => {
    const db = readDB();
    ensureProductsArray(db);
    
    const newProduct = {
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.products.push(newProduct);
    writeDB(db);
    return newProduct;
  },

  update: async (productName, updatedData) => {
    const db = readDB();
    ensureProductsArray(db);
    
    const productIndex = db.products.findIndex(p => p.product_name === productName);
    if (productIndex === -1) {
      return null;
    }
    
    db.products[productIndex] = {
      ...db.products[productIndex],
      ...updatedData,
      updated_at: new Date().toISOString()
    };
    
    writeDB(db);
    return db.products[productIndex];
  },

  delete: async (productName) => {
    const db = readDB();
    ensureProductsArray(db);
    
    const productIndex = db.products.findIndex(p => p.product_name === productName);
    if (productIndex === -1) {
      return null;
    }
    
    const deletedProduct = db.products.splice(productIndex, 1)[0];
    writeDB(db);
    return deletedProduct;
  }
};

module.exports = productRepository;
