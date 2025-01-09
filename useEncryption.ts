import { useState } from 'react';
import { Encryption } from '../lib/encryption';

export function useEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const encryptData = async (data: string, password: string) => {
    setIsEncrypting(true);
    try {
      const encrypted = await Encryption.encrypt(data, password);
      return encrypted;
    } finally {
      setIsEncrypting(false);
    }
  };

  const decryptData = async (encryptedData: string, password: string) => {
    setIsDecrypting(true);
    try {
      const decrypted = await Encryption.decrypt(encryptedData, password);
      return decrypted;
    } finally {
      setIsDecrypting(false);
    }
  };

  return {
    encryptData,
    decryptData,
    isEncrypting,
    isDecrypting
  };
}