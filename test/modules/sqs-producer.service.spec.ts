import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import configuration from '../../src/modules/configuration';
import { SqsProducerService } from '../../src/modules/sqs-producer/sqs-producer.service';
import { Message } from '../../src/modules/sqs-producer/sqs-producer.types';

describe('SQS Producer Service', () => {
  let service: SqsProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: false,
          ignoreEnvVars: false,
          isGlobal: true,
          load: [configuration],
        }),
      ],
      providers: [SqsProducerService],
    }).compile();

    service = module.get<SqsProducerService>(SqsProducerService);
    service.onModuleInit();
  });

  interface MyMessage {
    name: string;
    message: string;
  }

  it('should be successful when sending valid mutiple message', async () => {
    const id = String(Math.floor(Math.random() * 1000000));
    const messages = 
      {
        contractAddress: '0xccc441ac31f02cd96c153db6fd5fe0a2f4e6a68d',
        startBlock: 12981367,
        endBlock: 12982370,
        // startBlock: 12981364,
        // endBlock: 14991368,
        tokenType: 'ERC721'
      };
    console.log(id);
    const message: Message<typeof messages> = {
      id,
      body: messages,
      groupId: `group${id}`,
      deduplicationId: id,
    };

    await service.sendMessage(message);
  });

  // it('should be successful when sending valid mutiple message', async () => {
  //   const id = String(Math.floor(Math.random() * 1000000));
  //   const messages = 
  //     {
  //       contractAddress: '0xccc441ac31f02cd96c153db6fd5fe0a2f4e6a68d',
  //       startBlock: 12981367,
  //       endBlock: 12981370,
  //       // startBlock: 12981364,
  //       // endBlock: 14991368,
  //       tokenType: 'ERC721'
  //     };
  //   const message: Message<typeof messages> = {
  //     id,
  //     body: messages,
  //     groupId: `group${id}`,
  //     deduplicationId: id,
  //   };

  //   // await service.sendMessage(message);
  // });

  // it('should be successful when sending a single valid message', async () => {
  //   const id = String(Math.floor(Math.random() * 1000000));
  //   const message: Message<MyMessage> = {
  //     id,
  //     body: { name: '2', message: 'new message!' },
  //     groupId: 'g3',
  //     deduplicationId: id,
  //   };

  //   await service.sendMessage(message);
  // });
});
