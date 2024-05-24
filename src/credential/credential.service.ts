import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CredentialService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async newIssue(connectionData: any): Promise<boolean> {
    console.log('newIssue method called with data:', connectionData);

    const connection = connectionData.connection_id;
    const send_message =
      `${this.configService.get<string>('API_BASE_URL')}:8032/connections/` +
      connection +
      '/send-message';
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
        'X-API-KEY': this.configService.get<string>('API_KEY'),
      },
    };
    console.log('Call REST ', send_message, ' Options ', requestConfig);

    console.log(
      'Student ID Credential Definition ID:',
      this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID'),
    );
    console.log(
      'Connection Data Credential Definition ID:',
      connectionData.credential_definition_id,
    );

    let message = '';
    if (
      connectionData.credential_definition_id ===
      this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID')
    ) {
      console.log('Sending student ID message...');
      try {
        message = await lastValueFrom(
          this.httpService
            .post(
              send_message,
              {
                content: this.configService.get<string>(
                  'ISSUE_STUDENT_ID_MESSAGE',
                ),
              },
              requestConfig,
            )
            .pipe(map((resp) => resp.data)),
        );
        console.log('Student ID message sent successfully:', message);
      } catch (error) {
        console.error('Error sending student ID message:', error);
      }
    } else {
      console.log('Credential definition ID does not match student ID.');
    }

    if (
      connectionData.credential_definition_id ===
      this.configService.get<string>('TRANSCRIPT_CREDENTIAL_DEFINITION_ID')
    ) {
      console.log('Sending transcript message...');
      try {
        message = await lastValueFrom(
          this.httpService
            .post(
              send_message,
              {
                content: this.configService.get<string>(
                  'ISSUE_STUDENT_TRANSCRIPT_MESSAGE',
                ),
              },
              requestConfig,
            )
            .pipe(map((resp) => resp.data)),
        );
        console.log('Transcript message sent successfully:', message);
      } catch (error) {
        console.error('Error sending transcript message:', error);
      }
    } else {
      console.log('Credential definition ID does not match transcript ID.');
    }

    console.log('REST call returns ', message);
    return true;
  }

  async fetchCredentialRecord(credentialExchangeId: string): Promise<any> {
    const apiUrl = `${this.configService.get<string>('SWAGGER_API_URL')}:8032/issue-credential/records/${credentialExchangeId}`;

    const headers = {
      accept: 'application/json',
      'X-API-KEY': this.configService.get<string>('API_KEY'),
      Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
    };

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(apiUrl, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching credential record:', error);
      throw new Error('Failed to fetch credential record');
    }
  }
}
