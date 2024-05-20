// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionModule } from './connection/connection.module';
import { CredentialModule } from './credential/credential.module';
import { VerificationModule } from './verification/verification.module';
import { PingModule } from './ping/ping.module';
import { EllucianModule } from './ellucian/ellucian.module';
import { OutOfBandModule } from './out_of_band/out_of_band.module'; 
import { EventsGateway } from './events/events.gateway';
import { BasicMessagesModule } from './basicmessages/basicmessages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ConnectionModule,
    OutOfBandModule,
    CredentialModule,
    VerificationModule,
    PingModule,
    EllucianModule,
    BasicMessagesModule, 
    RouterModule.register([
      {
        path: 'topic',
        module: AppModule,
        children: [
          {
            path: 'ping',
            module: PingModule,
          },
          {
            path: 'connections',
            module: ConnectionModule,
          },
          {
            path: 'out_of_band',
            module: OutOfBandModule,
          },
          {
            path: 'issue_credential',
            module: CredentialModule,
          },
          {
            path: 'present_proof',
            module: VerificationModule,
          }, 
          {
            path: 'basicmessages',
            module: BasicMessagesModule,
          },
        ],
      },
      {
        path: 'sis',
        module: EllucianModule,
        children: [
          {
            path: '',
            module: EllucianModule,
          },
        ],
      },
    ]),
  ],
  providers: [AppService, EventsGateway],
  controllers: [AppController],
})
export class AppModule {}
