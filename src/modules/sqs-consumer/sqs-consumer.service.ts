import {
  Logger,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Consumer } from 'sqs-consumer';
import AWS from 'aws-sdk';
import {
  ERROR_EVENT_NAME,
  PROCESSING_ERROR_EVENT_NAME,
  ReceivedMessage,
  TIMEOUT_EVENT_NAME,
  MESSAGE_PROCESSED_EVENT_NAME,
} from './sqs-consumer.types';
import { ConfigService } from '@nestjs/config';
import https from 'https';
import { DalNFTTokenOwnersTaskService } from '../Dal/dal-nft-token-owners-task/dal-nft-token-owners-task.service';
import OwnersHandler from '../OwnersHandler/ownersHandler.service';

@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumerService.name);
  public sqsConsumer: Consumer;
  public queue: AWS.SQS;
  private currentTasksIds: string[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly nftTokenOwnersTaskService: DalNFTTokenOwnersTaskService,
    private ownersHandler: OwnersHandler,
  ) {
    const region = this.configService.get('aws.region') || 'eu-west-1';
    const accessKeyId = this.configService.get('aws.accessKeyId') || '';
    const secretAccessKey = this.configService.get('aws.secretAccessKey') || '';

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Initialize AWS queue failed, please check required variables',
      );
    }

    AWS.config.update({
      region,
      accessKeyId,
      secretAccessKey,
    });
  }

  public onModuleInit() {
    this.logger.log('onModuleInit');
    this.queue = new AWS.SQS({
      httpOptions: {
        agent: new https.Agent({
          keepAlive: true,
        }),
      },
    });
    this.sqsConsumer = Consumer.create({
      queueUrl: this.configService.get('aws.queueUrl'),
      sqs: this.queue,
      handleMessage: this.handleMessage.bind(this),
    });

    this.logger.log('Register events');
    //listen to events
    this.sqsConsumer.addListener(ERROR_EVENT_NAME, this.onError.bind(this));
    this.sqsConsumer.addListener(
      PROCESSING_ERROR_EVENT_NAME,
      this.onProcessingError.bind(this),
    );
    this.sqsConsumer.addListener(
      TIMEOUT_EVENT_NAME,
      this.onTimeoutError.bind(this),
    );
    this.sqsConsumer.addListener(
      MESSAGE_PROCESSED_EVENT_NAME,
      this.onMessageProcessed.bind(this),
    );

    this.logger.log('Consumer starts');
    this.sqsConsumer.start();
  }

  public onModuleDestroy() {
    this.logger.log('Consumer stops');
    this.sqsConsumer.stop();
  }

  async handleMessage(message: AWS.SQS.Message) {
    this.logger.log(`Consumer handle message id:(${message.MessageId})`);
    const receivedMessage = JSON.parse(message.Body) as ReceivedMessage;

    const nftTokenOwnersTask = {
      messageId: message.MessageId,
      contractAddress: receivedMessage.contractAddress,
      tokenId: receivedMessage.tokenId,
      taskId: receivedMessage.taskId,
    };

    this.currentTasksIds =
      await this.nftTokenOwnersTaskService.getOwnersTasksIds(
        receivedMessage.contractAddress,
        receivedMessage.tokenId,
      );

    this.logger.log(
      `Start processing owners for owners task contract (${nftTokenOwnersTask.contractAddress}) - tokenId: ${nftTokenOwnersTask.tokenId} in processing`,
    );

    const { contractAddress, tokenId, tokenType } = receivedMessage;

    await this.ownersHandler.start(contractAddress, tokenId, tokenType);
  }

  async onError(error: Error, message: AWS.SQS.Message) {
    this.logger.log(`SQS error ${error.message}`);
    await this.handleError(error, message, 'SQS');
  }

  async onProcessingError(error: Error, message: AWS.SQS.Message) {
    this.logger.log(`Processing error ${error.message}`);
    await this.handleError(error, message, 'Processing');
  }

  async onTimeoutError(error: Error, message: AWS.SQS.Message) {
    this.logger.log(`Timeout error ${error.message}`);
    await this.handleError(error, message, 'Timeout');
  }

  async onMessageProcessed(message: AWS.SQS.Message) {
    const receivedMessage = JSON.parse(message.Body) as ReceivedMessage;
    await this.nftTokenOwnersTaskService.removeTask(
      receivedMessage.contractAddress,
      receivedMessage.tokenId,
      receivedMessage.taskId,
    );

    await this.nftTokenOwnersTaskService.removeOwnersTasks(
      this.currentTasksIds,
    );

    this.logger.log(`Messages ${message?.MessageId} have been processed `);
  }

  private async handleError(
    error: Error,
    message: AWS.SQS.Message,
    type: string,
  ) {
    console.log(error);
    const receivedMessage = JSON.parse(message.Body) as ReceivedMessage;

    const errorMessage =
      `Error type: [${type}] - ${error.stack || error.message}` ||
      `Error type: [${type}] - ${JSON.stringify(error)}`;

    await this.nftTokenOwnersTaskService.setErrorMessage(
      receivedMessage.contractAddress,
      receivedMessage.tokenId,
      receivedMessage.taskId,
      errorMessage,
    );

    await this.deleteMessage(message);
  }

  private async deleteMessage(message: AWS.SQS.Message) {
    const deleteParams = {
      QueueUrl: this.configService.get('aws.queueUrl'),
      ReceiptHandle: message.ReceiptHandle,
    };

    try {
      await this.queue.deleteMessage(deleteParams).promise();
    } catch (err) {
      console.log(err);
      this.logger.log(`Deleting Message(${message?.MessageId}) ERROR`);
    }
  }
}
