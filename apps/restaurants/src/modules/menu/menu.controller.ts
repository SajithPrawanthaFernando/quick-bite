// src/modules/menu/menu.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all menu items for a restaurant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all menu items' })
  async getMenuItems(
    @Param('restaurantId') restaurantId: string,
    @Query('category') category?: string,
  ) {
    return this.menuService.getMenuItems(restaurantId, category ?? undefined);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all menu items' })
  async getAllMenuItems(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('restaurantId') restaurantId: string,
    @Query('category') category?: string,
  ) {
    if (!restaurantId) {
      throw new UnauthorizedException('Restaurant ID is required');
    }
    return this.menuService.getMenuItems(restaurantId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return menu item details',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found',
  })
  async getMenuItemById(@Param('id') id: string) {
    return this.menuService.getMenuItemById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Menu item created successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to add menu to this restaurant',
  })
  async createMenuItem(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @Request() req,
  ) {
    return this.menuService.createMenuItem(createMenuItemDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Menu item updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this menu item',
  })
  async updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @Request() req,
  ) {
    return this.menuService.updateMenuItem(id, updateMenuItemDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Menu item deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to delete this menu item',
  })
  async deleteMenuItem(@Param('id') id: string, @Request() req) {
    return this.menuService.deleteMenuItem(id, req.user.id);
  }

  @Put(':id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle menu item availability' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Menu item availability updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this menu item',
  })
  async toggleAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
    @Request() req,
  ) {
    return this.menuService.toggleAvailability(id, isAvailable, req.user.id);
  }
}
