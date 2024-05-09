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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ConnectionModule,
    CredentialModule,
    VerificationModule,
    PingModule,
    EllucianModule,
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
          {
            path: 'ellucian',
            module: EllucianModule,
          },
        ],
      },
    ]),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}








// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { RouterModule } from '@nestjs/core';
// import { HttpModule } from '@nestjs/axios'; 

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { ConnectionModule } from './connection/connection.module';
// import { CredentialModule } from './credential/credential.module';
// import { VerificationModule } from './verification/verification.module';
// import { PingModule } from './ping/ping.module';
// import { RedisService } from './services/redis.service';
// import { EllucianService } from './ellucian/ellucian.service';
// import { EllucianController } from './ellucian/ellucian.controller';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     HttpModule, 
//     ConnectionModule,
//     CredentialModule,
//     VerificationModule,
//     PingModule,
//     RouterModule.register([ 
//       {
//         path: 'topic',
//         module: AppModule,
//         children: [
//           {
//             path: 'ping',
//             module: PingModule,
//           },
//           {
//             path: 'connections',
//             module: ConnectionModule,
//           },
//           {
//             path: 'issue_credential',
//             module: CredentialModule,
//           },
//           {
//             path: 'present_proof',
//             module: VerificationModule,
//           },
//         ],
//       },
//     ]),
//   ],
//   providers: [
//     AppService,
//     RedisService,
//     EllucianService,
//   ],
//   controllers: [
//     AppController,
//     EllucianController,
//   ],
// })
// export class AppModule {}
