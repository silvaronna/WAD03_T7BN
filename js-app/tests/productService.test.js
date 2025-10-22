const productService = require("../services/productService");
const productRepository = require("../repositories/productRepository");

// Mock productRepository
jest.mock("../repositories/productRepository");

// Mock fs operations
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock readDB to return sample data
    require("fs").readFileSync.mockReturnValue(JSON.stringify({
      users: [
        { username: "seller1", role: "seller" },
        { username: "seller2", role: "seller" },
        { username: "buyer1", role: "buyer" }
      ],
      products: [],
      carts: []
    }));
  });

  describe("createProduct", () => {
    it("should create product successfully for seller", async () => {
      const mockProduct = {
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000,
        owner: "seller1"
      };

      productRepository.findByName.mockResolvedValue(null);
      productRepository.add.mockResolvedValue(mockProduct);

      const result = await productService.createProduct({
        username: "seller1",
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000
      });

      expect(result).toEqual(mockProduct);
      expect(productRepository.add).toHaveBeenCalledWith({
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000,
        owner: "seller1"
      });
    });

    it("should throw error when username is missing", async () => {
      await expect(productService.createProduct({
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000
      })).rejects.toEqual({
        status: 400,
        message: "Username wajib diisi"
      });
    });

    it("should throw error when user is not a seller", async () => {
      await expect(productService.createProduct({
        username: "buyer1",
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000
      })).rejects.toEqual({
        status: 403,
        message: "Akses ditolak! Hanya seller yang dapat mengelola produk"
      });
    });

    it("should throw error when product name already exists", async () => {
      productRepository.findByName.mockResolvedValue({
        product_name: "Test Product",
        owner: "seller1"
      });

      await expect(productService.createProduct({
        username: "seller1",
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000
      })).rejects.toEqual({
        status: 400,
        message: "Nama produk sudah ada"
      });
    });
  });

  describe("getAllProducts", () => {
    it("should get all products for valid user", async () => {
      const mockProducts = [
        { product_name: "Product 1", price: 100000 },
        { product_name: "Product 2", price: 200000 }
      ];

      productRepository.getAll.mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts("seller1");

      expect(result).toEqual(mockProducts);
      expect(productRepository.getAll).toHaveBeenCalled();
    });

    it("should throw error when username is missing", async () => {
      await expect(productService.getAllProducts()).rejects.toEqual({
        status: 400,
        message: "Username wajib diisi"
      });
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully for owner", async () => {
      const existingProduct = {
        product_name: "Old Product",
        product_category: "Electronics",
        price: 100000,
        owner: "seller1"
      };

      const updatedProduct = {
        product_name: "New Product",
        product_category: "Electronics",
        price: 150000,
        owner: "seller1"
      };

      productRepository.findByName
        .mockResolvedValueOnce(existingProduct)
        .mockResolvedValueOnce(null); // For checking new name doesn't exist
      productRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct("Old Product", {
        username: "seller1",
        product_name: "New Product",
        product_category: "Electronics",
        price: 150000
      });

      expect(result).toEqual(updatedProduct);
      expect(productRepository.update).toHaveBeenCalledWith("Old Product", {
        product_name: "New Product",
        product_category: "Electronics",
        price: 150000
      });
    });

    it("should throw error when user is not the owner", async () => {
      productRepository.findByName.mockResolvedValue({
        product_name: "Test Product",
        owner: "seller1"
      });

      await expect(productService.updateProduct("Test Product", {
        username: "seller2",
        product_name: "Updated Product",
        product_category: "Electronics",
        price: 150000
      })).rejects.toEqual({
        status: 403,
        message: "Anda hanya dapat mengupdate produk milik sendiri"
      });
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully for owner", async () => {
      const mockProduct = {
        product_name: "Test Product",
        owner: "seller1"
      };

      productRepository.findByName.mockResolvedValue(mockProduct);
      productRepository.delete.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct("Test Product", "seller1");

      expect(result).toEqual(mockProduct);
      expect(productRepository.delete).toHaveBeenCalledWith("Test Product");
    });

    it("should throw error when product not found", async () => {
      productRepository.findByName.mockResolvedValue(null);

      await expect(productService.deleteProduct("Nonexistent Product", "seller1"))
        .rejects.toEqual({
          status: 404,
          message: "Produk tidak ditemukan"
        });
    });
  });
});
