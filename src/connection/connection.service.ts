import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ConnectionService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Send a welcome message to the given connection.
   * @param connectionData - Data for the active connection
   */
  async sendWelcomeMessage(connectionData: any): Promise<boolean> {
    const connectionId = connectionData.connection_id;
    const messageUrl = `${this.configService.get<string>('API_BASE_URL')}:8032/connections/${connectionId}/send-message`;

    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
        'X-API-KEY': this.configService.get<string>('API_KEY'),
      },
    };

    console.log('Sending welcome message to connection:', connectionId);
    console.log('Request URL:', messageUrl);
    console.log('Request Configuration:', requestConfig);

    const messageContent = {
      content: this.configService.get<string>('SCHOOL_WELCOME_MESSAGE'),
    };

    const response = await lastValueFrom(
      this.httpService
        .post(messageUrl, messageContent, requestConfig)
        .pipe(map((resp) => resp.data))
    );

    console.log('Response from the welcome message API:', response);
    return true;
  }
}
