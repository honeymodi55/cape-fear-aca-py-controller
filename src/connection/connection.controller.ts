import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConnectionService } from './connection.service';

@Controller()
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('/')
  async getHello(
    @Body() data: any,
    @Res() response: Response,
  ): Promise<Response> {
    console.log('************* Connection controller ***************  /n');
    console.log(data);
    if (data.state == 'active') {
      this.connectionService.welcome(data);
    }
    return response.status(HttpStatus.OK).send('OK');
  }
}
