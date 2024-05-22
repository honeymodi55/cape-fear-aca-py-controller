import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MetadataService {
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('SWAGGER_API_URL');
  }

  async updateConnectionMetadata(connId: string, metadata: any): Promise<void> {
    const url = `${this.apiUrl}:8032/connections/${connId}/metadata`;
    console.log(`Updating metadata at URL: ${url} with data:`, metadata);

    try {
      const response = await axios.post(
        url,
        { metadata },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-API-KEY': this.configService.get<string>('API_KEY'),
            Authorization: `Bearer ${this.configService.get<string>('BEARER_TOKEN')}`,
          },
        },
      );
      if (response.status === 200) {
        console.log('Metadata updated successfully.');
      } else {
        console.error(
          `Failed to update metadata: ${response.status} - ${response.statusText}`,
        );
        throw new Error(
          `Failed to update metadata: ${response.status} - ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(
        'Error updating metadata:',
        error.response ? error.response.data : error.message,
      );
      throw new Error('Failed to update metadata');
    }
  }
}
