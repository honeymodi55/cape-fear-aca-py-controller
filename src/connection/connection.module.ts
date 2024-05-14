import { Module } from '@nestjs/common';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { HttpModule } from '@nestjs/axios';
import { EventsGateway } from 'src/events/events.gateway';
import { RedisService } from '../services/redis.service';
import { EllucianService } from 'src/ellucian/ellucian.service';


@Module({
  imports: [HttpModule],
  controllers: [ConnectionController],
  providers: [ConnectionService, RedisService,EventsGateway, EllucianService]
})
export class ConnectionModule {}
