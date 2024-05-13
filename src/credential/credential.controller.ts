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
import { EventsGateway } from '../events/events.gateway';

@Controller()
export class CredentialController {
  constructor(
    private readonly credentialService: CredentialService,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway 
  ) {}
  @Post('/')
  async issue(@Body() data: any, @Res() response: Response): Promise<Response> {
    console.log('************* Credential controller ***************  /n');
    console.log(data);
    if (
      data.state == 'credential_acked'
    ){
      console.log('Student Recieved the Student ID ...v');
      this.eventsGateway.sendEventUpdate({
        message: 'New event data', 
        timestamp: new Date(),
        details: data 
      });
    }
    if (
      data.state == 'offer_sent' &&
      (data.credential_definition_id ==
        this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID')
      || data.credential_definition_id ==
        this.configService.get<string>('TRANSCRIPT_CREDENTIAL_DEFINITION_ID'))
    ) {
      this.credentialService.newIssue(data);
    }
    return response.status(HttpStatus.OK).send('OK');
  }
}
