import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    const userId = req.user.userId;
    return this.cartService.getUserCart(userId);
  }

  @Post('items')
  addItem(@Req() req, @Body() dto: AddToCartDto) {
    const userId = req.user.userId;
    return this.cartService.addToCart(userId, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @Req() req,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userId = req.user.userId;
    return this.cartService.updateQuantity(userId, { ...dto, productId });
  }

  @Delete('items/:productId')
  removeItem(@Req() req, @Param('productId') productId: string) {
    const userId = req.user.userId;
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  clearCart(@Req() req) {
    const userId = req.user.userId;
    return this.cartService.clearCart(userId);
  }
}
