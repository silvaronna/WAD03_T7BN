const productService = require("../services/productService");
const productRepository = require("../repositories/productRepository");
const userRepository = require("../repositories/userRepository");

// Mock repositories
jest.mock("../repositories/productRepository");
jest.mock("../repositories/userRepository");

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create product successfully for seller", async () => {
      const mockUser = {
        username: "seller1",
        role: "seller"
      };

      const mockProduct = {
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000,
        owner: "seller1"
      };

      userRepository.findByUsername.mockResolvedValue(mockUser);
      productRepository.findByName.mockResolvedValue(null);
      productRepository.add.mockResolvedValue(mockProduct);

      const result = await productService.createProduct({
        username: "seller1",
        product_name: "Test Product",
        product_category: "Electronics",
        price: 100000
      });

      expect(result).toEqual(mockProduct);
      expect(userRepository.findByUsername).toHaveBeenCalledWith("seller1");
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
      const mockBuyer = {
        username: "buyer1",
        role: "buyer"
      };

      userRepository.findByUsername.mockResolvedValue(mockBuyer);

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
      const mockSeller = {
        username: "seller1",
        role: "seller"
      };

      userRepository.findByUsername.mockResolvedValue(mockSeller);
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
      const mockUser = {
        username: "seller1",
        role: "seller"
      };

      const mockProducts = [
        { product_name: "Product 1", price: 100000 },
        { product_name: "Product 2", price: 200000 }
      ];

      userRepository.findByUsername.mockResolvedValue(mockUser);
      productRepository.getAll.mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts("seller1");

      expect(result).toEqual(mockProducts);
      expect(userRepository.findByUsername).toHaveBeenCalledWith("seller1");
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
      const mockUser = {
        username: "seller1",
        role: "seller"
      };

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

      userRepository.findByUsername.mockResolvedValue(mockUser);
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
      expect(userRepository.findByUsername).toHaveBeenCalledWith("seller1");
      expect(productRepository.update).toHaveBeenCalledWith("Old Product", {
        product_name: "New Product",
        product_category: "Electronics",
        price: 150000
      });
    });

    it("should throw error when user is not the owner", async () => {
      const mockUser = {
        username: "seller2",
        role: "seller"
      };

      userRepository.findByUsername.mockResolvedValue(mockUser);
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
      const mockUser = {
        username: "seller1",
        role: "seller"
      };

      const mockProduct = {
        product_name: "Test Product",
        owner: "seller1"
      };

      userRepository.findByUsername.mockResolvedValue(mockUser);
      productRepository.findByName.mockResolvedValue(mockProduct);
      productRepository.delete.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct("Test Product", "seller1");

      expect(result).toEqual(mockProduct);
      expect(userRepository.findByUsername).toHaveBeenCalledWith("seller1");
      expect(productRepository.delete).toHaveBeenCalledWith("Test Product");
    });

    it("should throw error when product not found", async () => {
      const mockUser = {
        username: "seller1",
        role: "seller"
      };

      userRepository.findByUsername.mockResolvedValue(mockUser);
      productRepository.findByName.mockResolvedValue(null);

      await expect(productService.deleteProduct("Nonexistent Product", "seller1"))
        .rejects.toEqual({
          status: 404,
          message: "Produk tidak ditemukan"
        });
    });
  });
});
