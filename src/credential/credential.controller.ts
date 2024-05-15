import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
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
    console.log('************* Credential controller ***************');
    console.log(data);

    try {
      if (data.state === 'offer_sent') {
        console.log('Credential Offer sent...');

        // Emit event for offer_sent
        this.emitEvent(data);
      }

      if (data.state === 'credential_acked') {
        console.log('Credential Accepted ...');
      }

      if (
        data.state === 'offer_sent' &&
        (data.credential_definition_id === this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID') ||
          data.credential_definition_id === this.configService.get<string>('TRANSCRIPT_CREDENTIAL_DEFINITION_ID'))
      ) {
        await this.credentialService.newIssue(data);
      }

      return response.status(HttpStatus.OK).send('OK');
    } catch (error) {
      console.error("Error handling credential issuance:", error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to handle credential issuance');
    }
  }

  private emitEvent(data: any) {
    const eventDetails = {
      attributes: data.attributes || [],
      timestamp: new Date(),
      details: data,
    };

    this.eventsGateway.sendEventUpdate(eventDetails);
  }
}
