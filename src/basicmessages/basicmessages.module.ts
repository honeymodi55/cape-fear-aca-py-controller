import { Module } from '@nestjs/common';
import { BasicMessagesController } from './basicmessages.controller';
import { BasicMessagesService } from './basicmessages.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [WorkflowModule, ConfigModule, HttpModule],
  controllers: [BasicMessagesController],
  providers: [
    BasicMessagesService
  ],
})
export class BasicMessagesModule {}
