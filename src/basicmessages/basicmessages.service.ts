import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicMessagesService {
  private messages = [];

  async processMessage(messageData: any): Promise<void> {
    // Process the message data (e.g., save to database, trigger events, etc.)
    this.messages.push(messageData);
  }

  async getMessages(): Promise<any[]> {
    // Retrieve messages (e.g., from database)
    return this.messages;
  }
}
