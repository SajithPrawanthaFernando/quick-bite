import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { UseGuards } from '@nestjs/common';
import { OrderStatus } from '@app/common/enums/order-status.enum';
@WebSocketGateway({ namespace: 'restaurant-dashboard' })
export class RestaurantDashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private restaurantConnections: Map<string, string[]> = new Map();

  async handleConnection(client: Socket) {
    try {
      // Handle authentication & get restaurantId from client token
      const restaurantId = client.handshake.query.restaurantId as string;

      if (!restaurantId) {
        client.disconnect();
        return;
      }

      // Store connection by restaurant
      if (!this.restaurantConnections.has(restaurantId)) {
        this.restaurantConnections.set(restaurantId, []);
      }

      const connections = this.restaurantConnections.get(restaurantId);
      if (connections) {
        connections.push(client.id);
      }
      client.join(`restaurant-${restaurantId}`);

      console.log(`Restaurant ${restaurantId} connected: ${client.id}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up connections when client disconnects
    for (const [
      restaurantId,
      connections,
    ] of this.restaurantConnections.entries()) {
      const index = connections.indexOf(client.id);
      if (index !== -1) {
        connections.splice(index, 1);
        console.log(`Restaurant ${restaurantId} disconnected: ${client.id}`);
        if (connections.length === 0) {
          this.restaurantConnections.delete(restaurantId);
        }
        break;
      }
    }
  }

  @OnEvent('order.created')
  handleOrderCreated(order: any) {
    this.server.to(`restaurant-${order.restaurantId}`).emit('newOrder', {
      orderId: order._id,
      items: order.items,
      status: order.status,
      createdAt: order.createdAt,
    });
  }

  @OnEvent('order.status.updated')
  handleOrderStatusUpdated(order: any) {
    this.server
      .to(`restaurant-${order.restaurantId}`)
      .emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
        estimatedPreparationTime: order.estimatedPreparationTime,
        rejectionReason: order.rejectionReason,
      });
  }

  @SubscribeMessage('acceptOrder')
  handleAcceptOrder(
    client: Socket,
    payload: { orderId: string; estimatedPreparationTime: string },
  ) {
    // Implement order acceptance logic
    console.log('Order accepted:', payload);
    // You would typically call the OrderService.updateStatus here
    return { success: true };
  }

  @SubscribeMessage('rejectOrder')
  handleRejectOrder(
    client: Socket,
    payload: { orderId: string; reason: string },
  ) {
    // Implement order rejection logic
    console.log('Order rejected:', payload);
    // You would typically call the OrderService.updateStatus here
    return { success: true };
  }

  @SubscribeMessage('updateOrderStatus')
  handleUpdateOrderStatus(
    client: Socket,
    payload: { orderId: string; status: OrderStatus },
  ) {
    // Implement order status update logic
    console.log('Order status updated:', payload);
    // You would typically call the OrderService.updateStatus here
    return { success: true };
  }
}
