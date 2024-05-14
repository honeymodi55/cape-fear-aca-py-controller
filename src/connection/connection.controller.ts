import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ConnectionService } from './connection.service';
import { EventsGateway } from '../events/events.gateway';
import { ConfigService } from '@nestjs/config';
import { EllucianService } from '../ellucian/ellucian.service';

@Controller()
export class ConnectionController {
  constructor(
    private readonly connectionService: ConnectionService, 
    private readonly eventsGateway: EventsGateway,
    private readonly configService: ConfigService,
    private readonly ellucianService: EllucianService

   ) {}

  @Post('/')
  async handleConnection(
    @Body() connectionData: any,
    @Res() response: Response
  ): Promise<Response> {
    console.log('************* Connection controller ***************  /n');
    console.log('Handling connection request:', connectionData);

    if (connectionData.state === 'request') {
      console.log('Current status is request.');
      this.eventsGateway.sendEventUpdate({
        attributes: null, 
        timestamp: new Date(),
        details: connectionData,
        cred_def_id: null
      });
    }
    if (connectionData.state === 'active') {
      console.log('Connection is active.');



      try {

        const alias = connectionData.alias;
        const studentNumber = alias.split(' -studentID- ')[1]; 
        console.log('Extracted studentNumber:', studentNumber);
        const studentIdCred = await this.ellucianService.getStudentIdCred(studentNumber);
        console.log("studentIdCred at ConnectionController", studentIdCred);

        if (!studentIdCred) {
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Student ID credentials not found');
        }

        const attributes = [
          { name: "Last", value: studentIdCred.lastName },
          { name: "School", value: this.configService.get<string>('SCHOOL') },
          { name: "Expiration", value: '20250101' },
          { name: "First", value: studentIdCred.firstName },
          { name: "StudentID", value: studentIdCred.studentsId },
          { name: "Middle", value: studentIdCred.middleName }
        ];

        this.eventsGateway.sendEventUpdate({
          attributes: attributes,
          timestamp: new Date(),
          details: connectionData,
          cred_def_id: this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID')
        });

        await this.connectionService.sendWelcomeMessage(connectionData);
      } catch (error) {
        console.error("Error retrieving studentIdCred:", error);
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to retrieve student information');
      }
    }

    return response.status(HttpStatus.OK).send('Connection request handled successfully');
  }
}
