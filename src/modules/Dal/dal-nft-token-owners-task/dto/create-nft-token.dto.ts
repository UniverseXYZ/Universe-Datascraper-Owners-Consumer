export interface CreateNFTTokenOwnersTaskDto {
  contractAddress: string;
  tokenId: string;
  priority: number;
  isProcessing: boolean;
}
