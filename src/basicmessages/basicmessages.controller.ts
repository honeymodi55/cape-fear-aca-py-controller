import { Controller, Post, Body, Res, HttpStatus, Get } from '@nestjs/common';
import { Response } from 'express';
import { BasicMessagesService } from './basicmessages.service';

@Controller('')
export class BasicMessagesController {
  constructor(private readonly basicMessagesService: BasicMessagesService) {}

  @Post('/')
  async handleBasicMessage(@Body() messageData: any, @Res() response: Response): Promise<Response> {
    console.log('Handling basic message request:', messageData);

    try {
      await this.basicMessagesService.processMessage(messageData);
      return response.status(HttpStatus.OK).send('Basic message handled successfully');
    } catch (error) {
      console.error('Error handling basic message request:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to handle basic message request');
    }
  }

  @Get('/')
  async getBasicMessages(@Res() response: Response): Promise<Response> {
    try {
      const messages = await this.basicMessagesService.getMessages();
      console.log ("messages from getBasicMassages", messages)
      return response.status(HttpStatus.OK).json(messages);
    } catch (error) {
      console.error('Error retrieving basic messages:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to retrieve basic messages');
    }
  }
}
