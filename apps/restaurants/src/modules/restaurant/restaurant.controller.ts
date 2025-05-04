import { 
    Controller, Get, Post, Put, Delete, Param, Body, 
    UseGuards, Request, HttpStatus, Query, Patch, UnauthorizedException 
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { RestaurantService } from './restaurant.service';
  import { CreateRestaurantDto } from './dto/create-restaurant.dto';
  import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
  import { JwtAuthGuard } from '@app/common';
  @ApiTags('restaurants')
  @Controller('restaurants')
  export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) {}
  
    @Post()

    @ApiOperation({ summary: 'Create a new restaurant' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Restaurant created successfully' })
    async createRestaurant(
      @Body() createRestaurantDto: CreateRestaurantDto,
      @Request() req,
      
    ) {
     
      return this.restaurantService.createRestaurant(createRestaurantDto, req.userId);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all restaurants' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return all restaurants' })
    async getAllRestaurants(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('search') search?: string,
      @Query('cuisine') cuisine?: string,
      @Query('rating') rating?: number
    ) {
      return this.restaurantService.getAllRestaurants(page, limit, search, cuisine, rating);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get restaurant by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return restaurant details' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Restaurant not found' })
    async getRestaurantById(@Param('id') id: string) {
      return this.restaurantService.getRestaurantById(id);
    }
    @Get('owner/:id')
    @ApiOperation({ summary: 'Get restaurant by owner ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return restaurant details' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Restaurant not found' })
    async getRestaurantByOwnerId(@Param('id') id: string) {
      return this.restaurantService.getRestaurantByOwnerId(id);
    }
  
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update restaurant details' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Restaurant updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Restaurant not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to update this restaurant' })
    async updateRestaurant(
      @Param('id') id: string,
      @Body() updateRestaurantDto: UpdateRestaurantDto,
      @Request() req,
    ) {
      return this.restaurantService.updateRestaurant(id, updateRestaurantDto, req.user.id);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete restaurant' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Restaurant deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Restaurant not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to delete this restaurant' })
    async deleteRestaurant(@Param('id') id: string, @Request() req) {
      return this.restaurantService.deleteRestaurant(id, req.user);
    }
  /*
    @Get('/pending')
    @ApiOperation({ summary: 'Get pending restaurant approvals' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns pending restaurants' })
    async getPendingRestaurants(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ) {
      return this.restaurantService.getPendingRestaurants(page, limit);
    }
  
    @Patch(':id/temporary-closure')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set temporary closure status' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Status updated successfully' })
    async setTemporaryClosure(
      @Param('id') id: string,
      @Body('isClosed') isClosed: boolean,
      @Request() req,
    ) {
      return this.restaurantService.setTemporaryClosure(id, isClosed, req.user.id);
    }
  
    @Get(':id/approve')
    @ApiOperation({ summary: 'Approve restaurant' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Restaurant approved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Restaurant not found' })
    async approveRestaurant(@Param('id') id: string) {
      return this.restaurantService.approveRestaurant(id);
    }
  
    @Get(':id/reject')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reject restaurant' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Restaurant rejected successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Restaurant not found' })
    async rejectRestaurant(
      @Param('id') id: string,
      @Query('reason') reason: string,
    ) {
      return this.restaurantService.rejectRestaurant(id, reason);
    }
  */
    @Get('owner/:restaurantId/dashboard')
    @ApiOperation({ summary: 'Get restaurant owner dashboard data' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns dashboard data' })
    async getOwnerDashboard(@Param('restaurantId') restaurantId: string) {
      return this.restaurantService.getOwnerDashboard(restaurantId);
    }
  
   
  
    @Get('owner/:restaurantId/menu')
    @ApiOperation({ summary: 'Get restaurant menu' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns restaurant menu' })
    async getRestaurantMenu(@Param('restaurantId') restaurantId: string) {
      return this.restaurantService.getRestaurantMenu(restaurantId);
    }
  }