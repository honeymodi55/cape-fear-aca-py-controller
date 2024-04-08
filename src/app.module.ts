import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionModule } from './connection/connection.module';
import { CredentialModule } from './credential/credential.module';
import { VerificationModule } from './verification/verification.module';
import { PingModule } from './ping/ping.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ConnectionModule, 
    CredentialModule, 
    VerificationModule, 
    PingModule,
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
            path: 'issue_credential',
            module: CredentialModule,
          },
          {
            path: 'present_proof',
            module: VerificationModule,
          },
        ],
      }
    ])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
