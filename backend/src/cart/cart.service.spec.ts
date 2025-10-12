import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from './schema/cart.schema';
import { Model } from 'mongoose';

describe('CartService', () => {
  let service: CartService;
  let cartModel: jest.Mocked<Model<Cart>>;

  const mockCartModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartModel = module.get(getModelToken(Cart.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // ✅ 1. getUserCart()
  it('should return user cart', async () => {
    const mockCart = { userId: 'u1', items: [] };
    mockCartModel.findOne.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(mockCart),
    });

    const result = await service.getUserCart('u1');
    expect(result).toEqual(mockCart);
    expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId: 'u1' });
  });

  it('should return null if no cart found', async () => {
    mockCartModel.findOne.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(null),
    });
    const result = await service.getUserCart('u1');
    expect(result).toBeNull();
  });

  // ──────────────────────────────────────────────
  // ✅ 2. addToCart()
  it('should create new cart if not exists', async () => {
    const userId = 'u1';
    const dto = { productId: 'p1', quantity: 2 };
    mockCartModel.findOne.mockResolvedValueOnce(null);
    mockCartModel.create.mockResolvedValueOnce({
      userId,
      items: [dto],
    });

    const result = await service.addToCart(userId, dto);

    expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId });
    expect(mockCartModel.create).toHaveBeenCalledWith({
      userId,
      items: [dto],
    });
    expect(result.items[0]).toEqual(dto);
  });

  it('should add new product to existing cart', async () => {
    const userId = 'u1';
    const dto = { productId: 'p2', quantity: 1 };
    const mockCart: any = {
      userId,
      items: [{ productId: 'p1', quantity: 2 }],
      save: jest.fn(),
    };
    mockCartModel.findOne.mockResolvedValueOnce(mockCart);

    await service.addToCart(userId, dto);

    expect(mockCart.items.length).toBe(2);
    expect(mockCart.items[1]).toEqual(dto);
    expect(mockCart.save).toHaveBeenCalled();
  });

  it('should increase quantity if product already in cart', async () => {
    const userId = 'u1';
    const dto = { productId: 'p1', quantity: 3 };
    const mockCart: any = {
      userId,
      items: [{ productId: 'p1', quantity: 1 }],
      save: jest.fn(),
    };
    mockCartModel.findOne.mockResolvedValueOnce(mockCart);

    await service.addToCart(userId, dto);

    expect(mockCart.items[0].quantity).toBe(4);
    expect(mockCart.save).toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────
  // ✅ 3. updateQuantity()
  it('should update quantity of existing product', async () => {
    const userId = 'u1';
    const dto = { productId: 'p1', quantity: 5 };
    const mockCart: any = {
      userId,
      items: [{ productId: 'p1', quantity: 2 }],
      save: jest.fn(),
    };
    mockCartModel.findOne.mockResolvedValueOnce(mockCart);

    const result = await service.updateQuantity(userId, dto);

    expect(mockCart.items[0].quantity).toBe(5);
    expect(mockCart.save).toHaveBeenCalled();
    expect(result).toBe(mockCart);
  });

  it('should return null if cart not found when updating quantity', async () => {
    mockCartModel.findOne.mockResolvedValueOnce(null);
    const result = await service.updateQuantity('u1', {
      productId: 'p1',
      quantity: 2,
    });
    expect(result).toBeNull();
  });

  it('should do nothing if product not found when updating quantity', async () => {
    const userId = 'u1';
    const mockCart: any = {
      userId,
      items: [{ productId: 'p2', quantity: 1 }],
      save: jest.fn(),
    };
    mockCartModel.findOne.mockResolvedValueOnce(mockCart);

    await service.updateQuantity(userId, { productId: 'p1', quantity: 5 });

    expect(mockCart.items[0].quantity).toBe(1); // unchanged
    expect(mockCart.save).toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────
  // ✅ 4. removeItem()
  it('should remove item from cart', async () => {
    const userId = 'u1';
    const mockCart: any = {
      userId,
      items: [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 },
      ],
      save: jest.fn(),
    };
    mockCartModel.findOne.mockResolvedValueOnce(mockCart);

    const result = await service.removeItem(userId, 'p1');

    expect(mockCart.items.length).toBe(1);
    expect(mockCart.items[0].productId).toBe('p2');
    expect(mockCart.save).toHaveBeenCalled();
    expect(result).toBe(mockCart);
  });

  it('should return null if cart not found when removing item', async () => {
    mockCartModel.findOne.mockResolvedValueOnce(null);
    const result = await service.removeItem('u1', 'p1');
    expect(result).toBeNull();
  });

  // ──────────────────────────────────────────────
  // ✅ 5. clearCart()
  it('should clear all items from cart', async () => {
    const userId = 'u1';
    const mockCart: any = {
      userId,
      items: [{ productId: 'p1', quantity: 1 }],
    };
    const updatedCart = { userId, items: [] };
    mockCartModel.findOneAndUpdate.mockResolvedValueOnce(updatedCart);

    const result = await service.clearCart(userId);

    expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId },
      { items: [] },
      { new: true },
    );
    expect(result).toEqual(updatedCart);
  });
});
