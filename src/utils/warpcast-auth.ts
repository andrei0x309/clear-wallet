import { signMsg } from './wallet'
import { getBytes } from 'ethers';
import bufferLib from 'buffer';

const EIP_191_PREFIX = "eip191:";
const WARPCAST_API = 'https://client.warpcast.com/v2'

const NO_WALLET = 'NO_WALLET'
const SIG_DENIED = 'SIG_DENIED'
const NO_AUTH_TOKEN = 'NO_AUTH_TOKEN'
const AUTH_SUCCESS = 'AUTH_SUCCESS'

type T_RESULT_GEN_AUTH_TOKEN = {
    success: boolean;
    data: typeof SIG_DENIED  | typeof NO_AUTH_TOKEN | typeof AUTH_SUCCESS | typeof NO_WALLET  | string;
}

type T_IDDB_VALUE = {
    secret: string;
    expiresAt: number;
}

function serialize (object: any) {
    if (typeof object === 'number' && isNaN(object)) {
      throw new Error('NaN is not allowed');
    }
  
    if (typeof object === 'number' && !isFinite(object)) {
      throw new Error('Infinity is not allowed');
    }
  
    if (object === null || typeof object !== 'object') {
      return JSON.stringify(object);
    }
  
    if (object.toJSON instanceof Function) {
      return serialize(object.toJSON());
    }
  
    if (Array.isArray(object)) {
      const values: any = object.reduce((t, cv, ci) => {
        const comma = ci === 0 ? '' : ',';
        const value = cv === undefined || typeof cv === 'symbol' ? null : cv;
        return `${t}${comma}${serialize(value)}`;
      }, '');
      return `[${values}]`;
    }
  
    const values: any = Object.keys(object).sort().reduce((t, cv) => {
      if (object[cv] === undefined ||
          typeof object[cv] === 'symbol') {
        return t;
      }
      const comma = t.length === 0 ? '' : ',';
      return `${t}${comma}${serialize(cv)}:${serialize(object[cv])}`;
    }, '');
    return `{${values}}`;
  };

function createWarpMessage (data: any) {
    return { message: serialize(data) }
}


export const generateApiToken = async (): Promise<T_RESULT_GEN_AUTH_TOKEN> => {
    try {
 
        const timestamp = Date.now();
        const payload = {
            method: "generateToken",
            params: {
                timestamp,
                expiresAt: 1777046287381
            },
        };
        const msgToSign = createWarpMessage(payload);


        const sig = await signMsg(msgToSign.message);

        const Buffer = bufferLib.Buffer;

        const sigBase64 = Buffer.from(getBytes(sig)).toString('base64');
        const cusAuth = EIP_191_PREFIX + sigBase64

        const req = await fetch(`${WARPCAST_API}/auth`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cusAuth}`,
            },
            body: JSON.stringify(payload),
        });


        if (req.ok) {
            const data = await req.json();
            const token = data?.result?.token?.secret;
            if (token) {
                return { success: true, data: token }
            }
            return { success: false, data: NO_AUTH_TOKEN }
        }
        return { success: false, data: NO_AUTH_TOKEN }
    } catch (error) {
        console.error('Failed to generate api token', error)
        return { success: false, data: NO_AUTH_TOKEN}
    }
}

export const addWarpAuthToken = async (value: T_IDDB_VALUE):  Promise<unknown> => {
    const dbName = 'localforage'
    const storeName = 'keyvaluepairs'
    const key = 'auth-token'
    const version = 2
    let resolve = (a = false) => {}
    const result = new Promise((res) => {
        resolve = res
    })

    try {
      const dbRequest = indexedDB.open(dbName, version);
  
      dbRequest.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore(storeName);
      };
  
      dbRequest.onsuccess = (event: any) => {
  
      const db = dbRequest.result
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
  
      const request = store.put(value, key);

      request.onsuccess = (event: any) => {
        console.log("Successfully added data:", event.target.result);
        window?.location?.reload()
        resolve?.()
        }

        request.onerror = (event: any) => {
        console.error("Error adding data:", event.target.error);
        resolve?.()
        }

      };
  
      dbRequest.onerror = (event: any) => {
        console.error("Error adding data:", event.target.error);
        resolve?.()
      };
  
     
    } catch (error) {
      console.error("Error accessing IndexedDB:", error);
      resolve?.()
    }
    return result
  }