import { Module } from '@nestjs/common';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';
import { HttpModule } from '@nestjs/axios';
import { EventsGateway } from 'src/events/events.gateway';

@Module({
  imports: [HttpModule],
  controllers: [CredentialController],
  providers: [CredentialService, EventsGateway],
})
export class CredentialModule {}
