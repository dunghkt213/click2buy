import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';

describe('CartController', () => {
  let controller: CartController;
  let mockCartService: any;

  const mockUserId = 'user123';
  const mockCart = {
    _id: 'cart123',
    userId: mockUserId,
    items: [
      {
        productId: 'product456',
        quantity: 2,
      },
    ],
  };

  beforeEach(async () => {
    mockCartService = {
      getCart: jest.fn(),
      addToCart: jest.fn(),
      updateCart: jest.fn(),
      removeFromCart: jest.fn(),
      checkout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CartController>(CartController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      mockCartService.getCart.mockResolvedValue(mockCart);

      const result = await controller.getCart(mockUserId);

      expect(result).toEqual(mockCart);
      expect(mockCartService.getCart).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const dto: AddToCartDto = {
        productId: 'product456',
        quantity: 2,
      };

      mockCartService.addToCart.mockResolvedValue(mockCart);

      const result = await controller.addToCart(mockUserId, dto);

      expect(result).toEqual(mockCart);
      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockUserId, dto);
    });
  });

  describe('updateCart', () => {
    it('should update cart item', async () => {
      const dto: UpdateCartDto = {
        productId: 'product456',
        quantity: 5,
      };

      const updatedCart = {
        ...mockCart,
        items: [{ productId: 'product456', quantity: 5 }],
      };

      mockCartService.updateCart.mockResolvedValue(updatedCart);

      const result = await controller.updateCart(mockUserId, dto);

      expect(result).toEqual(updatedCart);
      expect(mockCartService.updateCart).toHaveBeenCalledWith(mockUserId, dto);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const emptyCart = {
        ...mockCart,
        items: [],
      };

      mockCartService.removeFromCart.mockResolvedValue(emptyCart);

      const result = await controller.removeFromCart(mockUserId, 'product456');

      expect(result).toEqual(emptyCart);
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
        mockUserId,
        'product456',
      );
    });
  });

  describe('checkout', () => {
    it('should checkout successfully', async () => {
      const checkoutResponse = {
        success: true,
        message: 'Checkout successful. Order is being processed.',
        itemCount: 1,
      };

      mockCartService.checkout.mockResolvedValue(checkoutResponse);

      const result = await controller.checkout(mockUserId);

      expect(result).toEqual(checkoutResponse);
      expect(mockCartService.checkout).toHaveBeenCalledWith(mockUserId);
    });
  });
});
