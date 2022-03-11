import { SQS } from 'aws-sdk';
import { SupportedTokenTypes } from 'datascraper-schema';

export interface SqsConsumerHandler {
  handleMessage(message: SQS.Message): Promise<void>;
  onError(error: Error, message: SQS.Message): Promise<void>;
  onProcessingError(error: Error, message: SQS.Message): Promise<void>;
  onTimeoutError(error: Error, message: SQS.Message): Promise<void>;
}

export interface ReceivedMessage {
  contractAddress: string;
  tokenType: SupportedTokenTypes;
  tokenId: string;
  taskId: string;
}

export const ERROR_EVENT_NAME = 'error';
export const PROCESSING_ERROR_EVENT_NAME = 'processing_error';
export const TIMEOUT_EVENT_NAME = 'timeout_error';
export const MESSAGE_PROCESSED_EVENT_NAME = 'message_processed';
