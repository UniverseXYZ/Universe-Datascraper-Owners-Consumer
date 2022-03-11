import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NFTTokenOwnersTask,
  NFTTokenOwnersTaskDocument,
} from './schemas/nft-token-owners-task.schema';

@Injectable()
export class DalNFTTokenOwnersTaskService {
  private readonly logger = new Logger(DalNFTTokenOwnersTaskService.name);
  constructor(
    @InjectModel(NFTTokenOwnersTask.name)
    private readonly nfttokenOwnerTaskModel: Model<NFTTokenOwnersTaskDocument>,
  ) {}

  async getOwnersTasksIds(
    contractAddress: string,
    tokenId: string,
  ): Promise<string[]> {
    this.logger.log(
      `Get owners tasks contract: ${contractAddress} - tokenId: ${tokenId}`,
    );
    const tasks = await this.nfttokenOwnerTaskModel.find({
      contractAddress,
      tokenId,
    });

    return tasks.map((x) => x.taskId);
  }

  async removeOwnersTasks(taskIds: string[]) {
    this.logger.log(`Remove owners  ${taskIds?.length} tasks`);
    await this.nfttokenOwnerTaskModel.deleteMany({ taskId: { $in: taskIds } });
  }

  async setErrorMessage(
    contractAddress: string,
    tokenId: string,
    taskId: string,
    errorMessage: string,
  ) {
    this.logger.log(
      `Set error message contract: ${contractAddress} - tokenId: ${tokenId}`,
    );
    await this.nfttokenOwnerTaskModel.updateOne(
      { contractAddress, tokenId, taskId },
      { errorMessage },
    );
  }

  async removeTask(contractAddress: string, tokenId: string, taskId: string) {
    this.logger.log(
      `Remove task contract: ${contractAddress} - tokenId: ${tokenId}`,
    );
    await this.nfttokenOwnerTaskModel.deleteOne({
      contractAddress,
      tokenId,
      taskId,
    });
  }
}
