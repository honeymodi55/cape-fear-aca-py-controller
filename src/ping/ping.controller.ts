import { Controller, Get, Res, Body, HttpStatus, Post } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class PingController {
  @Post('/')
  ping(@Body() data: any, @Res() response: Response): Response {
    console.log('Ping controller', data);
    return response.status(HttpStatus.OK).send('OK');
  }
}
