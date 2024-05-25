import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetadataService } from '../metadata/metadata.service';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, firstValueFrom, map } from 'rxjs';

@Injectable()
export class VerificationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly metadataService: MetadataService,
  ) {}

  async verify(connectionData: any): Promise<boolean> {
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

    let messageContent: string | undefined;
    try {
      const verificationRecord = await this.fetchVerificationRecord(
        connectionData.presentation_exchange_id,
      );

      const schemaName =
        verificationRecord?.presentation_request?.requested_attributes
          ?.studentInfo?.restrictions?.[0]?.schema_name;

      if (schemaName) {
        if (schemaName === this.configService.get<string>('ID_SCHEMA_NAME')) {
          messageContent = this.configService.get<string>(
            'REQUEST_STUDENT_ID_VERIFICATION_MESSAGE',
          );
        } else if (
          schemaName ===
          this.configService.get<string>('TRANSCRIPT_SCHEMA_NAME')
        ) {
          messageContent = this.configService.get<string>(
            'REQUEST_STUDENT_TRANSCRIPT_VERIFICATION_MESSAGE',
          );
        } else {
          console.log('Schema name does not match student ID or transcript.');
        }
      } else {
        console.error('Schema name is undefined or empty.');
      }
    } catch (error) {
      console.error('Error fetching verification record:', error.message);
    }

    if (messageContent) {
      const message = await lastValueFrom(
        this.httpService
          .post(send_message, { content: messageContent }, requestConfig)
          .pipe(map((resp) => resp.data)),
      );
      console.log('REST call returns ', message);
    }

    return true;
  }

  async handleVerifiedState(data: any): Promise<void> {
    console.log(
      'Fetching detailed record using presentation_exchange_id:',
      data.presentation_exchange_id,
    );

    // Fetch the full verification record from ACA-Py using presentation_exchange_id
    const verificationRecord = await this.fetchVerificationRecord(
      data.presentation_exchange_id,
    );

    const studentInfo =
      verificationRecord?.presentation?.requested_proof?.revealed_attr_groups
        ?.studentInfo?.values;

    if (studentInfo) {
      const First = studentInfo?.First?.raw;
      const Last = studentInfo?.Last?.raw;
      const StudentID = studentInfo?.StudentID?.raw;

      if (First && Last && StudentID) {
        // Update connection metadata when verification is acknowledged
        await this.metadataService.updateConnectionMetadata(
          data.connection_id,
          {
            student_id: StudentID,
            first_name: First,
            last_name: Last,
          },
        );
        console.log('Metadata updated successfully for verified state.');
      } else {
        console.error(
          'First, Last, or StudentID not found in verification attributes.',
        );
      }
    } else {
      console.error('Verification attributes are undefined.');
    }
  }

  private async fetchVerificationRecord(
    presentationExchangeId: string,
  ): Promise<any> {
    const apiUrl = `${this.configService.get<string>('SWAGGER_API_URL')}:8032/present-proof/records/${presentationExchangeId}`;

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
      console.error('Error fetching verification record:', error);
      throw new Error('Failed to fetch verification record');
    }
  }
}
