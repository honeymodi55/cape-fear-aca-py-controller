// src/events/events.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // Adjust this to more strict origins as per your security requirements
    // credentials: true, // Depending on whether you need to support credentials
    // methods: ['GET', 'POST'] // Specify allowed methods, if needed
  }
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Listen for 'requestData' events from clients
  @SubscribeMessage('requestData')
  handleRequestData(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log(`Data requested by ${client.id}:`, data);
    // Process the request and respond, for example:
    this.server.to(client.id).emit('responseData', { data: 'Here is your requested data' });
  }

  sendEventUpdate(data: any) {
    console.log('Sending event update:', data); // Ensure this logs when events are supposed to be sent
    this.server.emit('eventUpdate', data);
  }
}
