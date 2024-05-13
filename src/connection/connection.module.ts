import { Module } from '@nestjs/common';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { HttpModule } from '@nestjs/axios';
import { EventsGateway } from 'src/events/events.gateway';

@Module({
  imports: [HttpModule],
  controllers: [ConnectionController],
  providers: [ConnectionService, EventsGateway]
})
export class ConnectionModule {}
