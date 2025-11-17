import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from '../schemas/cart.schema';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';

describe('CartService', () => {
  let service: CartService;
  let mockCartModel: any;
  let mockKafkaProducer: any;

  const mockUserId = 'user123';
  const mockProductId = 'product456';

  const mockCart = {
    _id: 'cart123',
    userId: mockUserId,
    items: [
      {
        productId: mockProductId,
        quantity: 2,
      },
    ],
    save: jest.fn(),
  };

  beforeEach(async () => {
    mockCartModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      exec: jest.fn(),
    };

    mockKafkaProducer = {
      publishInventoryReserve: jest.fn(),
      publishInventoryUpdateReservation: jest.fn(),
      publishOrderCreate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducer,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return existing cart', async () => {
      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCart),
      });

      const result = await service.getCart(mockUserId);

      expect(result).toEqual(mockCart);
      expect(mockCartModel.findOne).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should create new cart if not exists', async () => {
      const newCart = { ...mockCart, items: [] };
      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockCartModel.create.mockResolvedValue(newCart);

      const result = await service.getCart(mockUserId);

      expect(result).toEqual(newCart);
      expect(mockCartModel.create).toHaveBeenCalledWith({
        userId: mockUserId,
        items: [],
      });
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      const dto: AddToCartDto = {
        productId: 'newProduct',
        quantity: 3,
      };

      const emptyCart: any = {
        userId: mockUserId,
        items: [],
        save: jest.fn().mockResolvedValue({
          userId: mockUserId,
          items: [{ productId: 'newProduct', quantity: 3 }],
        }),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(emptyCart),
      });

      await service.addToCart(mockUserId, dto);

      expect(emptyCart.items).toHaveLength(1);
      expect(emptyCart.items[0].productId).toBe('newProduct');
      expect(emptyCart.items[0].quantity).toBe(3);
      expect(mockKafkaProducer.publishInventoryReserve).toHaveBeenCalledWith(
        mockUserId,
        'newProduct',
        3,
      );
    });

    it('should increase quantity if item already exists', async () => {
      const dto: AddToCartDto = {
        productId: mockProductId,
        quantity: 3,
      };

      const existingCart: any = {
        userId: mockUserId,
        items: [{ productId: mockProductId, quantity: 2 }],
        save: jest.fn().mockResolvedValue({
          userId: mockUserId,
          items: [{ productId: mockProductId, quantity: 5 }],
        }),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingCart),
      });

      await service.addToCart(mockUserId, dto);

      expect(existingCart.items[0].quantity).toBe(5);
      expect(mockKafkaProducer.publishInventoryReserve).toHaveBeenCalledWith(
        mockUserId,
        mockProductId,
        3,
      );
    });
  });

  describe('updateCart', () => {
    it('should update item quantity', async () => {
      const dto: UpdateCartDto = {
        productId: mockProductId,
        quantity: 5,
      };

      const cart = {
        userId: mockUserId,
        items: [{ productId: mockProductId, quantity: 2 }],
        save: jest.fn().mockResolvedValue({
          userId: mockUserId,
          items: [{ productId: mockProductId, quantity: 5 }],
        }),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await service.updateCart(mockUserId, dto);

      expect(cart.items[0].quantity).toBe(5);
      expect(mockKafkaProducer.publishInventoryUpdateReservation).toHaveBeenCalledWith(
        mockUserId,
        mockProductId,
        2,
        5,
      );
    });

    it('should remove item if quantity is 0', async () => {
      const dto: UpdateCartDto = {
        productId: mockProductId,
        quantity: 0,
      };

      const cart = {
        userId: mockUserId,
        items: [{ productId: mockProductId, quantity: 2 }],
        save: jest.fn().mockResolvedValue({
          userId: mockUserId,
          items: [],
        }),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await service.updateCart(mockUserId, dto);

      expect(cart.items).toHaveLength(0);
      expect(mockKafkaProducer.publishInventoryUpdateReservation).toHaveBeenCalledWith(
        mockUserId,
        mockProductId,
        2,
        0,
      );
    });

    it('should throw NotFoundException if product not in cart', async () => {
      const dto: UpdateCartDto = {
        productId: 'nonexistent',
        quantity: 5,
      };

      const cart = {
        userId: mockUserId,
        items: [{ productId: mockProductId, quantity: 2 }],
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(service.updateCart(mockUserId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const cart = {
        userId: mockUserId,
        items: [{ productId: mockProductId, quantity: 2 }],
        save: jest.fn().mockResolvedValue({
          userId: mockUserId,
          items: [],
        }),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await service.removeFromCart(mockUserId, mockProductId);

      expect(cart.items).toHaveLength(0);
      expect(mockKafkaProducer.publishInventoryUpdateReservation).toHaveBeenCalledWith(
        mockUserId,
        mockProductId,
        2,
        0,
      );
    });

    it('should throw NotFoundException if product not in cart', async () => {
      const cart = {
        userId: mockUserId,
        items: [{ productId: mockProductId, quantity: 2 }],
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(
        service.removeFromCart(mockUserId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkout', () => {
    it('should checkout successfully and clear cart', async () => {
      const cart = {
        userId: mockUserId,
        items: [
          { productId: 'prod1', quantity: 2 },
          { productId: 'prod2', quantity: 1 },
        ],
        save: jest.fn().mockResolvedValue({ userId: mockUserId, items: [] }),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      const result = await service.checkout(mockUserId);

      expect(result.success).toBe(true);
      expect(result.itemCount).toBe(2);
      expect(cart.items).toHaveLength(0);
      expect(mockKafkaProducer.publishOrderCreate).toHaveBeenCalledWith(
        mockUserId,
        [
          { productId: 'prod1', quantity: 2 },
          { productId: 'prod2', quantity: 1 },
        ],
      );
    });

    it('should throw BadRequestException if cart is empty', async () => {
      const cart = {
        userId: mockUserId,
        items: [],
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(service.checkout(mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
