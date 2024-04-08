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
import { VerificationService } from './verification.service';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('/')
  async getHello(
    @Body() data: any,
    @Res() response: Response,
  ): Promise<Response> {
    console.log('************* Verification controller ***************  /n');
    console.log(data);
    if (data?.state == 'request_sent') {
      this.verificationService.verify(data);
    }
    return response.status(HttpStatus.OK).send('OK');
  }
}
