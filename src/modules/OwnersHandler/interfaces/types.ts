import { SupportedTokenTypes } from 'datascraper-schema';

export interface TransferOwner {
  contractAddress: string;
  tokenId: string;
  address: string;
  value: string;
  blockNum: number;
  transactionHash: string;
  tokenType: SupportedTokenTypes;
}
