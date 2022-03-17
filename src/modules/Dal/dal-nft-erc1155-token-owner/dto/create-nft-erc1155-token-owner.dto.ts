export interface CreateNFTErc1155TokenOwnerDto {
  transactionHash: string;
  contractAddress: string;
  tokenId: string;
  tokenType: string;
  address: string;
  value: string;
  logIndex: number;
  blockNum: number;
}
