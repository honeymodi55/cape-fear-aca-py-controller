import { Module } from '@nestjs/common';
import { BasicMessagesController } from './basicmessages.controller';
import { BasicMessagesService } from './basicmessages.service';

@Module({
  controllers: [BasicMessagesController],
  providers: [BasicMessagesService],
})
export class BasicMessagesModule {}
