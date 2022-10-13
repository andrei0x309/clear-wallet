import { storageGet, storageSave } from '@/utils/platform' 

const getIv = async() => {
    let iv = (await storageGet('iv'))?.iv
    if(!iv){
        iv = crypto.getRandomValues(new Uint8Array(16));
        const jsonIv = JSON.stringify(iv)
        await storageSave('iv', jsonIv)
        return iv
    }else {
      iv = new Uint8Array(Object.values(JSON.parse(iv)));
    }
    return iv
}

const getSalt = async() => {
    let salt = (await storageGet('salt'))?.salt
    
    if(!salt){
        salt = crypto.getRandomValues(new Uint8Array(16));
        const jsonSalt = JSON.stringify(salt)
        await storageSave('salt', jsonSalt)
        return salt
    }else {
      salt = new Uint8Array(Object.values(JSON.parse(salt)));
    }
    return salt
}

async function getKey(passwordBytes: Uint8Array) {
    
    const salt = await getSalt()

    const initialKey = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
  
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 50000, hash: "SHA-256" },
      initialKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

export const getCryptoParams = async(password: string): Promise<{ key: CryptoKey, iv: any }> => {
  const enc = new TextEncoder()
  const encKey = enc.encode(password)
  return { key: await getKey(encKey), iv:await getIv() }
}

export const encrypt = async (data: string, cryptoParams: { key: CryptoKey, iv: any }) => {
    const enc = new TextEncoder()
    const encData = enc.encode(data)
    const encResult = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: cryptoParams.iv,
      },
      cryptoParams.key,
      encData,
    )
    return JSON.stringify(new Uint8Array(encResult))
}

export const decrypt = async (encryptedData: string, cryptoParams: { key: CryptoKey, iv: any }) => {
    const encryptedUint = new Uint8Array(Object.values(JSON.parse(encryptedData)));
    const contentBytes = new Uint8Array(
      await crypto.subtle.decrypt({ name: "AES-GCM", iv:cryptoParams.iv }, cryptoParams.key, encryptedUint)
    );
    return new TextDecoder().decode(contentBytes)
  }