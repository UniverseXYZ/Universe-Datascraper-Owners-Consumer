import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NFTTransferHistory,
  NFTTransferHistoryDocument,
} from './schemas/nft-transfer-history.schema';

@Injectable()
export class DalNFTTransferHistoryService {
  private readonly logger = new Logger(DalNFTTransferHistoryService.name);
  constructor(
    @InjectModel(NFTTransferHistory.name)
    private readonly nftTransferHistoryModel: Model<NFTTransferHistoryDocument>,
  ) {}

  async getLatestTransferBy(
    contractAddress: string,
    tokenId: string,
  ): Promise<NFTTransferHistory> {
    const lastestBlock = await this.nftTransferHistoryModel
      .aggregate([
        {
          $match: {
            contractAddress,
            tokenId,
          },
        },
        {
          $group: {
            _id: {
              contractAddress: '$contractAddress',
              tokenId: '$tokenId',
            },
            blockNum: { $last: '$blockNum' },
            logIndex: { $last: '$logIndex' },
          },
        },
      ])
      .exec();

    if (lastestBlock.length === 0) {
      return null;
    }

    const blockNum = lastestBlock[0].blockNum;
    const logIndex = lastestBlock[0].logIndex;

    const latestTransfer = await this.nftTransferHistoryModel.findOne({
      contractAddress,
      tokenId,
      blockNum,
      logIndex,
    });

    return latestTransfer;
  }

  async getAllTransferHistories(
    contractAddress: string,
    tokenId: string,
  ): Promise<NFTTransferHistory[]> {
    return await this.nftTransferHistoryModel.find({
      contractAddress,
      tokenId,
    });
  }
}
