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
import { CredentialService } from './credential.service';

@Controller()
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}
  @Post('/')
  async issue(@Body() data: any, @Res() response: Response): Promise<Response> {
    console.log('************* Credential controller ***************  /n');

    if (
      data.state == 'credential_acked' &&
      data.credential_definition_id ==
        'Cvb7Y2u8vhPNzf1RD3x8pU:3:CL:568185:studentid'
    ) {
      this.credentialService.newIssue(data);
    }
    return response.status(HttpStatus.OK).send('OK');
  }
}
