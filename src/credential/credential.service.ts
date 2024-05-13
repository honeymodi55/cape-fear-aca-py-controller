import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class CredentialService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  async newIssue(connectionData: any): Promise<boolean> {
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
    let message = ""
    if(connectionData.credential_definition_id ==
      this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID')) {

       message = await lastValueFrom(
        this.httpService
          .post(
            send_message,
            {
              content: this.configService.get<string>('ISSUE_STUDENT_ID_MESSAGE'),
            },
            requestConfig,
          )
          .pipe(map((resp) => resp.data)),
      );
    }
    if(connectionData.credential_definition_id ==
      this.configService.get<string>('TRANSCRIPT_CREDENTIAL_DEFINITION_ID')) {

       message = await lastValueFrom(
        this.httpService
          .post(
            send_message,
            {
              content: this.configService.get<string>('ISSUE_STUDENT_TRANSCRIPT_MESSAGE'),
            },
            requestConfig,
          )
          .pipe(map((resp) => resp.data)),
      );
    }
    console.log('REST call returns ', message);
    return true;
  }
}
