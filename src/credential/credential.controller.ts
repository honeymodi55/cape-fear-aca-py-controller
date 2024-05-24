import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CredentialService } from './credential.service';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from '../events/events.gateway';
import { MetadataService } from '../metadata/metadata.service';
import { ConnectionService } from '../connection/connection.service';

@Controller()
export class CredentialController {
  constructor(
    private readonly credentialService: CredentialService,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
    private readonly metadataService: MetadataService,
    private readonly connectionService: ConnectionService,
  ) {}

  @Post('/')
  async issue(@Body() data: any, @Res() response: Response): Promise<Response> {
    console.log('************* Credential controller ***************');
    console.log(data);

    const credentialExchangeId = data.credential_exchange_id;
    const connectionId = data.connection_id;

    if (!credentialExchangeId || !connectionId) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message:
          'Missing credential_exchange_id or connection_id in the request data',
      });
    }

    try {
      if (data.state === 'offer_sent') {
        console.log('Credential Offer sent...');
        this.emitEvent(data);
      }

      if (data.state === 'credential_acked') {
        console.log('Credential Accepted ...');
        console.log(
          'Fetching detailed record using credential_exchange_id:',
          data.credential_exchange_id,
        );

        // Fetch the full credential record from ACA-Py using credential_exchange_id
        const credentialRecord =
          await this.credentialService.fetchCredentialRecord(
            data.credential_exchange_id,
          );

        const attributes =
          credentialRecord?.credential_proposal_dict?.credential_proposal
            ?.attributes;

        if (attributes) {
          const firstAttr = attributes.find(
            (attr: { name: string }) => attr.name === 'First',
          );
          const lastAttr = attributes.find(
            (attr: { name: string }) => attr.name === 'Last',
          );
          const idAttr = attributes.find(
            (attr: { name: string }) => attr.name === 'StudentID',
          );

          const First = firstAttr?.value;
          const Last = lastAttr?.value;
          const StudentID = idAttr?.value;

          if (First && Last && StudentID) {
            // Update connection metadata when credential is acknowledged
            await this.metadataService.updateConnectionMetadata(
              data.connection_id,
              {
                first_name: First,
                last_name: Last,
                student_id: StudentID,
              },
            );
          } else {
            console.error(
              'Name, Last or ID not found in credential attributes.',
            );
          }
        } else {
          console.error('Credential attributes are undefined.');
        }
      }

      return response.status(HttpStatus.OK).send('OK');
    } catch (error) {
      console.error('Error handling credential issuance:', error.message);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Failed to handle credential issuance');
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
