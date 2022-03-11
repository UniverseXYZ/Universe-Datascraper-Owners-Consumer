import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNFTTokenOwnerDto } from './dto/create-nft-token-owner.dto';
import {
  NFTTokenOwner,
  NFTTokenOwnerDocument,
} from './schemas/nft-token-owner.schema';

@Injectable()
export class DalNFTTokenOwnerService {
  private readonly logger = new Logger(DalNFTTokenOwnerService.name);
  constructor(
    @InjectModel(NFTTokenOwner.name)
    private readonly nftTokenOwnerModel: Model<NFTTokenOwnerDocument>,
  ) {}

  async upsertNFTTokenOwners(tokens: CreateNFTTokenOwnerDto[]): Promise<void> {
    this.logger.log(`Bulk write ${tokens.length} token owners`);
    await this.nftTokenOwnerModel.bulkWrite(
      tokens.map((x) => ({
        updateOne: {
          filter: {
            contractAddress: x.contractAddress,
            tokenId: x.tokenId,
            address: x.address,
          },
          update: {
            ...x,
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  async removeAllNFTTokenOwners(
    contractAddress: string,
    tokenId: string,
  ): Promise<void> {
    this.logger.log(
      `Remove all token owners for contract: ${contractAddress} - tokenId: ${tokenId}`,
    );
    await this.nftTokenOwnerModel.deleteMany({ contractAddress, tokenId });
  }
}
