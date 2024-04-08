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
import { ConfigService } from '@nestjs/config';

@Controller()
export class CredentialController {
  constructor(
    private readonly credentialService: CredentialService,
    private readonly configService: ConfigService,
  ) {}
  @Post('/')
  async issue(@Body() data: any, @Res() response: Response): Promise<Response> {
    console.log('************* Credential controller ***************  /n');

    if (
      data.state == 'credential_acked' &&
      data.credential_definition_id ==
        this.configService.get<string>('CREDENTIAL_DEFINITION_ID')
    ) {
      this.credentialService.newIssue(data);
    }
    return response.status(HttpStatus.OK).send('OK');
  }
}
