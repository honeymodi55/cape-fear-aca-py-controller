import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { parse } from '@nas-veridid/workflow-parser';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';




@Injectable()
export class BasicMessagesService {
 
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async isValidJsonFormat(content: string): Promise<boolean> {
    try {
      const parsedContent = JSON.parse(content);
  
      if (typeof parsedContent.workflowID === 'string' &&
          typeof parsedContent.actionID === 'string' &&
          typeof parsedContent.data === 'object') {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async processMessage(messageData: any): Promise<void> {


    if (await this.isValidJsonFormat(messageData.content)){
      let response: any;
      const connectionId: string = messageData.connection_id;
      const workflowID = JSON.parse(messageData.content).workflowID;
      const actionID = JSON.parse(messageData.content).actionID
      const data = JSON.parse(messageData.content).data
      const action = {
        workflowID: `${workflowID}`,
        actionID: `${actionID}`,
        data,
      };
      try {
        response = await parse(connectionId, action);
      } catch (error) {
        console.error('Error parsing workflow:', error.message);
      }
      if (response.displayData) {
        const messageDisplayed = JSON.stringify(response);
        const messageUrl = `${this.configService.get<string>('API_BASE_URL')}:8032/connections/${connectionId}/send-message`;
        const requestConfig: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
            'X-API-KEY': this.configService.get<string>('API_KEY'),
          },
        };
        const messageContent = {
          content: `${messageDisplayed}`,
        };
        try {
          await lastValueFrom(
            this.httpService
              .post(messageUrl, messageContent, requestConfig)
              .pipe(map((resp) => resp.data)),
          );
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      } else {
        const messageDisplayed = "Action Menu Feature Not Available For this Connection!";
        const messageUrl = `${this.configService.get<string>('API_BASE_URL')}:8032/connections/${connectionId}/send-message`;
        const requestConfig: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
            'X-API-KEY': this.configService.get<string>('API_KEY'),
          },
        };
        const messageContent = {
          content: `${messageDisplayed}`,
        };
        try {
          await lastValueFrom(
            this.httpService
              .post(messageUrl, messageContent, requestConfig)
              .pipe(map((resp) => resp.data)),
          );
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      }
    }


    if (messageData.content === ':menu') {
      const connectionId: string = messageData.connection_id;
      let response: any;
      const action = {
        workflowID: 'root-menu',
        actionID: '',
        data: {},
      };
    
      try {
        response = await parse(connectionId, action);
      } catch (error) {
        console.error('Error parsing workflow:', error.message);
      }
      console.log("response", response);
    
      if (response.displayData) {
        const messageDisplayed = JSON.stringify(response);
        const messageUrl = `${this.configService.get<string>('API_BASE_URL')}:8032/connections/${connectionId}/send-message`;
        const requestConfig: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
            'X-API-KEY': this.configService.get<string>('API_KEY'),
          },
        };
        const messageContent = {
          content: `${messageDisplayed}`,
        };
        try {
          await lastValueFrom(
            this.httpService
              .post(messageUrl, messageContent, requestConfig)
              .pipe(map((resp) => resp.data)),
          );
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      } else {
        const messageDisplayed = "Action Menu Feature Not Available For this Connection!";
        const messageUrl = `${this.configService.get<string>('API_BASE_URL')}:8032/connections/${connectionId}/send-message`;
        const requestConfig: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
            'X-API-KEY': this.configService.get<string>('API_KEY'),
          },
        };
        const messageContent = {
          content: `${messageDisplayed}`,
        };
        try {
          await lastValueFrom(
            this.httpService
              .post(messageUrl, messageContent, requestConfig)
              .pipe(map((resp) => resp.data)),
          );
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      }
    }


    
  }


 
}
