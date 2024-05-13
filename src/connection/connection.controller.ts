import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ConnectionService } from './connection.service';
import { EventsGateway } from '../events/events.gateway';

@Controller()
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService, private readonly eventsGateway: EventsGateway ) {}

  @Post('/')
  async handleConnection(
    @Body() connectionData: any,
    @Res() response: Response
  ): Promise<Response> {
    console.log('************* Connection controller ***************  /n');
    console.log('Handling connection request:', connectionData);

    if (connectionData.state === 'active') {
      console.log('Connection is active.');
      this.eventsGateway.sendEventUpdate({
        message: 'New event data', 
        timestamp: new Date(),
        details: connectionData 
      });

      await this.connectionService.sendWelcomeMessage(connectionData);
    }

    return response.status(HttpStatus.OK).send('Connection request handled successfully');
  }
}
