import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ConnectionService } from './connection.service';
import { EventsGateway } from '../events/events.gateway';
import { ConfigService } from '@nestjs/config';
import { EllucianService } from '../ellucian/ellucian.service';
import { MetadataService } from '../metadata/metadata.service';

@Controller()
export class ConnectionController {
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly eventsGateway: EventsGateway,
    private readonly configService: ConfigService,
    private readonly ellucianService: EllucianService,
    private readonly metadataService: MetadataService,
  ) {}

  @Post('/')
  async handleConnection(
    @Body() connectionData: any,
    @Res() response: Response,
  ): Promise<Response> {
    console.log('************* Connection controller ***************');
    console.log('Handling connection request:', connectionData);

    try {
      if (connectionData.state === 'request') {
        console.log('Current status is request.');
        this.emitEvent(connectionData, null, null);
      } else if (connectionData.state === 'active') {
        console.log('Connection is active.');
        await this.handleActiveState(connectionData);
      }

      return response
        .status(HttpStatus.OK)
        .send('Connection request handled successfully');
    } catch (error) {
      console.error('Error handling connection request:', error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Failed to handle connection request');
    }
  }

  private async handleActiveState(connectionData: any) {
    const alias = connectionData.alias;
    const studentNumber = this.extractStudentNumber(alias);
    console.log('Extracted studentNumber:', studentNumber);

    let attributes: any;

    try {
      const studentIdCred =
        await this.ellucianService.getStudentIdCred(studentNumber);
      console.log('studentIdCred at ConnectionController', studentIdCred);

      if (studentIdCred) {
        attributes = this.createAttributes(studentIdCred);
        // Update connection metadata
        await this.metadataService.updateConnectionMetadata(
          connectionData.connection_id,
          {
            name: `${studentIdCred.firstName} ${studentIdCred.lastName}`,
            student_number: studentIdCred.studentsId,
          },
        );
      } else {
        console.error(
          'Unable to obtain Student info from Student Information System',
        );
        attributes = this.createFallbackAttributes(alias);
      }
    } catch (error) {
      console.error('Error retrieving studentIdCred:', error);
      attributes = this.createFallbackAttributes(alias);
    }

    this.emitEvent(
      connectionData,
      attributes,
      this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID'),
    );
    await this.connectionService.sendWelcomeMessage(connectionData);
  }

  private extractStudentNumber(alias: string): string {
    return alias.split(' -studentID- ')[1];
  }

  private createAttributes(studentIdCred: any): any[] {
    return [
      { name: 'Last', value: studentIdCred.lastName ?? '' },
      { name: 'School', value: this.configService.get<string>('SCHOOL') ?? '' },
      {
        name: 'Expiration',
        value: this.configService.get<string>('STUDENTID_EXPIRATION') ?? '',
      },
      { name: 'First', value: studentIdCred.firstName ?? '' },
      { name: 'StudentID', value: studentIdCred.studentsId ?? '' },
      { name: 'Middle', value: studentIdCred.middleName ?? '' },
    ];
  }

  private createFallbackAttributes(alias: string): any[] {
    return [
      { name: 'Last', value: alias ?? '' },
      { name: 'School', value: this.configService.get<string>('SCHOOL') ?? '' },
      {
        name: 'Expiration',
        value: this.configService.get<string>('STUDENTID_EXPIRATION') ?? '',
      },
      { name: 'First', value: alias ?? '' },
      { name: 'StudentID', value: alias ?? '' },
      { name: 'Middle', value: alias ?? '' },
    ];
  }

  private emitEvent(connectionData: any, attributes: any, credDefId: string) {
    this.eventsGateway.sendEventUpdate({
      attributes: attributes,
      timestamp: new Date(),
      details: connectionData,
      cred_def_id: credDefId,
    });
  }
}
