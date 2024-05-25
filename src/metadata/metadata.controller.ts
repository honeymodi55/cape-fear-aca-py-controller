import { Controller, Put, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { Response } from 'express';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Put(':connId')
  async updateMetadata(
    @Param('connId') connId: string,
    @Body() metadata: any,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      await this.metadataService.updateConnectionMetadata(connId, metadata);
      return response
        .status(HttpStatus.OK)
        .send('Metadata updated successfully');
    } catch (error) {
      console.error('Error updating metadata:', error.message);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Failed to update metadata');
    }
  }
}
