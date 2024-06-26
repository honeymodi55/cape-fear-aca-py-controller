import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { parse, getWorkflowInstance, updateWorkflowInstanceByID } from '@nas-veridid/workflow-parser';

@Injectable()
export class CredentialService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Helper method to send a message
  private async sendMessage(connectionId: string, messageDisplayed: string): Promise<void> {
    const messageUrl = `${this.configService.get<string>('API_BASE_URL')}:8032/connections/${connectionId}/send-message`;
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
        'X-API-KEY': this.configService.get<string>('API_KEY'),
      },
    };
    const messageContent = { content: messageDisplayed };

    try {
      await lastValueFrom(
        this.httpService.post(messageUrl, messageContent, requestConfig).pipe(map((resp) => resp.data))
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

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

    let message = '';
    if (
      connectionData.credential_definition_id ==
      this.configService.get<string>('STUDENTID_CREDENTIAL_DEFINITION_ID')
    ) {
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

  async handleStateOfferSent (credentialData: any): Promise<any> {
    const WORKFLOW_ID = 'NewStudentOrientation'
    const connectionId = credentialData?.connection_id;
    const threadId = credentialData?.thread_id;
    const response = await getWorkflowInstance(`${connectionId}`, `${WORKFLOW_ID}`)
    console.log("response", response);
    const instanceID = response?.instanceID;
    const instance = {
      instanceID: `${instanceID}`,
      workflowID: `${WORKFLOW_ID}`,
      connectionID: `${connectionId}`,
      currentState: `${response.currentState}`,
      stateData: { "threadId": `${threadId}` }
    }
    await updateWorkflowInstanceByID(`${instanceID}`, instance)
    return true;
  }

  async handleStateCredAck (credentialData: any): Promise<any> {
     
    let resultOfParse: any;
    const WORKFLOWID = 'NewStudentOrientation';
    const ACTIONID_ISSUED = 'accepted';
    const connectionId = credentialData?.connection_id;
    const threadId = credentialData?.thread_id;

    const response = await getWorkflowInstance(`${connectionId}`, `${WORKFLOWID}`)
    console.log("response", response);

    if (response && response.stateData?.threadId === `${threadId}`) {
      const action = {
        workflowID: `${WORKFLOWID}`,
        actionID: `${ACTIONID_ISSUED}`,
        data: {},
      };
      try {
        resultOfParse = await parse(connectionId, action);
      } catch (error) {
        console.error('Error parsing workflow:', error.message);
      }
        // Send workflow response message as it is
        await this.sendMessage(connectionId, JSON.stringify(resultOfParse));
    }
  }
}
