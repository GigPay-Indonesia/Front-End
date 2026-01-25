export const onchainApiKey = import.meta.env.VITE_ONCHAINKIT_API_KEY as
  | string
  | undefined;

export const hasOnchainKit =
  typeof onchainApiKey === 'string' && onchainApiKey.trim().length > 0;
