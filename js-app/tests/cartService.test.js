const cartService = require('../services/cartService');
const cartRepository = require('../repositories/cartRepository');

// Mock repository biar gak konek ke database asli
jest.mock('../repositories/cartRepository');

describe('Cart Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===============================
  // GET CART
  // ===============================
  test('getCart: berhasil ambil cart user buyer', async () => {
    const mockUser = { username: 'silvaronna', role: 'buyer' };
    const mockCart = { username: 'silvaronna', items: [] };

    cartRepository.getUser.mockResolvedValue(mockUser);
    cartRepository.getCart.mockResolvedValue(mockCart);

    const result = await cartService.getCart('silvaronna');

    expect(result).toEqual(mockCart);
    expect(cartRepository.getUser).toHaveBeenCalledWith('silvaronna');
    expect(cartRepository.getCart).toHaveBeenCalledWith('silvaronna');
  });

  test('getCart: gagal karena user tidak ditemukan', async () => {
    cartRepository.getUser.mockResolvedValue(null);

    await expect(cartService.getCart('unknownUser'))
      .rejects.toEqual({ code: 404, message: 'User tidak ditemukan' });
  });

  test('getCart: gagal karena role bukan buyer', async () => {
    const mockUser = { username: 'sellerOne', role: 'seller' };
    cartRepository.getUser.mockResolvedValue(mockUser);

    await expect(cartService.getCart('sellerOne'))
      .rejects.toEqual({ code: 403, message: 'Role tidak valid, hanya buyer yang memiliki cart' });
  });

  // ===============================
  // ADD TO CART
  // ===============================
  test('addToCart: berhasil menambah produk baru ke cart', async () => {
    const mockUser = { username: 'silvaronna', role: 'buyer' };
    const mockCart = { username: 'silvaronna', items: [] };
    const updatedCart = { username: 'silvaronna', items: [{ productId: 'sku123', quantity: 5 }] };

    cartRepository.getUser.mockResolvedValue(mockUser);
    cartRepository.getCart.mockResolvedValue(mockCart);
    cartRepository.updateCart.mockResolvedValue(updatedCart);

    const body = { productId: 'sku123', quantity: 5 };
    const result = await cartService.addToCart('silvaronna', body);

    expect(result).toEqual(updatedCart);
    expect(cartRepository.updateCart).toHaveBeenCalledWith('silvaronna', updatedCart);
  });

  test('addToCart: menambah quantity jika produk sudah ada', async () => {
    const mockUser = { username: 'silvaronna', role: 'buyer' };
    const mockCart = { username: 'silvaronna', items: [{ productId: 'sku123', quantity: 2 }] };
    const updatedCart = { username: 'silvaronna', items: [{ productId: 'sku123', quantity: 7 }] };

    cartRepository.getUser.mockResolvedValue(mockUser);
    cartRepository.getCart.mockResolvedValue(mockCart);
    cartRepository.updateCart.mockResolvedValue(updatedCart);

    const body = { productId: 'sku123', quantity: 5 };
    const result = await cartService.addToCart('silvaronna', body);

    expect(result.items[0].quantity).toBe(7);
    expect(cartRepository.updateCart).toHaveBeenCalledTimes(1);
  });

  test('addToCart: gagal karena quantity <= 0', async () => {
    const body = { productId: 'sku123', quantity: 0 };
    await expect(cartService.addToCart('silvaronna', body))
      .rejects.toEqual({ code: 400, message: "Field 'quantity' harus lebih dari 0" });
  });

  test('addToCart: gagal karena productId kosong', async () => {
    const body = { productId: '', quantity: 2 };
    await expect(cartService.addToCart('silvaronna', body))
      .rejects.toEqual({ code: 400, message: "Field 'productId' wajib diisi dan berupa string" });
  });

  // ===============================
  // REMOVE FROM CART
  // ===============================
  test('removeFromCart: berhasil mengurangi quantity produk', async () => {
    const mockUser = { username: 'silvaronna', role: 'buyer' };
    const mockCart = { username: 'silvaronna', items: [{ productId: 'sku123', quantity: 5 }] };
    const updatedCart = { username: 'silvaronna', items: [{ productId: 'sku123', quantity: 3 }] };

    cartRepository.getUser.mockResolvedValue(mockUser);
    cartRepository.getCart.mockResolvedValue(mockCart);
    cartRepository.updateCart.mockResolvedValue(updatedCart);

    const body = { productId: 'sku123', quantity: 2 };
    const result = await cartService.removeFromCart('silvaronna', body);

    expect(result.items[0].quantity).toBe(3);
    expect(cartRepository.updateCart).toHaveBeenCalledWith('silvaronna', updatedCart);
  });

  test('removeFromCart: menghapus produk ketika quantity jadi 0', async () => {
    const mockUser = { username: 'silvaronna', role: 'buyer' };
    const mockCart = { username: 'silvaronna', items: [{ productId: 'sku123', quantity: 2 }] };
    const updatedCart = { username: 'silvaronna', items: [] };

    cartRepository.getUser.mockResolvedValue(mockUser);
    cartRepository.getCart.mockResolvedValue(mockCart);
    cartRepository.updateCart.mockResolvedValue(updatedCart);

    const body = { productId: 'sku123', quantity: 2 };
    const result = await cartService.removeFromCart('silvaronna', body);

    expect(result.items.length).toBe(0);
  });

  test('removeFromCart: gagal karena produk tidak ditemukan', async () => {
    const mockUser = { username: 'silvaronna', role: 'buyer' };
    const mockCart = { username: 'silvaronna', items: [] };

    cartRepository.getUser.mockResolvedValue(mockUser);
    cartRepository.getCart.mockResolvedValue(mockCart);

    const body = { productId: 'sku999', quantity: 1 };

    await expect(cartService.removeFromCart('silvaronna', body))
      .rejects.toEqual({ code: 404, message: 'Produk tidak ditemukan di cart' });
  });
});
