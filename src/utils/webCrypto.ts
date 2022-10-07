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

export const encrypt = async (password: string, data:string) => {
    const enc = new TextEncoder()
    const encData = enc.encode(data)
    console.log(encData)
    const encKey = enc.encode(password)
    console.log(encKey)
    const key = await getKey(encKey)
    console.log(key)
    const iv = await getIv()
    console.log(iv)
    console.log({
      name: "AES-GCM",
      iv,
    },
    key,
    encData)
    const encResult = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encData,
    )
    console.log(JSON.stringify(new Uint8Array(encResult)))
    return JSON.stringify(new Uint8Array(encResult))
}

export const decrypt = async (encryptedData: string, password: string) => {
    const enc = new TextEncoder()
    const encKey = enc.encode(password)
    const key = await getKey(encKey)
    const iv = await getIv()
    const encryptedUint= new Uint8Array(Object.values(JSON.parse(encryptedData)));
    console.log(encryptedUint)
    const contentBytes = new Uint8Array(
      await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedUint)
    );
    return new TextDecoder().decode(contentBytes)
  }