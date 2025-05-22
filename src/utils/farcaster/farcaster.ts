import { signMsg, getSelectedAddress, getOptimismProvider } from '../wallet'
import { FARCASTER_PARTIAL_KEY_ABI } from '../abis'
import { ethers } from 'ethers'
import { getUrl, setCachedFcAuthToken, getCachedFcAuthToken } from '../platform'
import { generateApiToken} from './farcaster-auth'
import { getQRCode } from '../QR'
import { wait } from '../misc'
import { FARCASTER_BASE_URL } from './constants'
 
export interface TChannelTokenStatusResponse {
    state: string;
    nonce: string;
    signatureParams: {
        siweUri: string;
        domain: string;
        nonce: string;
        notBefore: string;
        expirationTime: string;
    }
    ;
    metadata: {
        userAgent: string;
        ip: string;
    };
}

const TOKEN_STATUS_ENDPOINT = 'https://relay.farcaster.xyz/v1/channel/status'
const EP_SIGNIN = `${FARCASTER_BASE_URL}sign-in-with-farcaster`
const FC_ID_REGISTRY_CONTRACT = '0x00000000fc6c5f01fc30151999387bb99a9f489b'

export const getLinkFromQR = async () => {
    const data = await chrome.tabs.captureVisibleTab()
    return await getQRCode(data)
}

const getChannelTokenStatus = async (channelToken: string) => {
    const response = await fetch(`${TOKEN_STATUS_ENDPOINT}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${channelToken}`
        },
    })
    return response.json() as Promise<TChannelTokenStatusResponse>
}

export const extractLinkData = (link: string) => {
    const url = new URL(link);
    const channelToken = url.searchParams.get('channelToken');
    const siweUri = url.searchParams.get('siweUri');
    const domain = url.searchParams.get('domain');
    const nonce = url.searchParams.get('nonce') || (Math.random() + 1).toString(36).substring(7);
    const notBefore = url.searchParams.get('notBefore') || undefined;
    const expirationTime = url.searchParams.get('expirationTime') || undefined;

    return {
        channelToken,
        nonce,
        siweUri,
        domain,
        notBefore,
        expirationTime,
    } as {
        channelToken: string,
        nonce: string,
        siweUri: string,
        domain: string,
        notBefore: string,
        expirationTime: string,
    }
}

export const extractResponseData = async (channelToken: string) => {
    try {
        const response = await getChannelTokenStatus(channelToken);
        let { siweUri, domain, nonce, notBefore, expirationTime } = response.signatureParams;
        nonce = nonce || (Math.random() + 1).toString(36).substring(7);
        return {
            siweUri,
            domain,
            nonce,
            notBefore,
            expirationTime
        }
    } catch (e) {
        return null;
    }
}

export const validateLinkData = (link: string) => {
    const { channelToken } = extractLinkData(link);
    if (!channelToken) {
        return false;
    }
    return true;
}


export const constructWarpcastSWIEMsg = ({
    siweUri,
    domain,
    nonce,
    notBefore,
    expirationTime,
    fid,
    custodyAddress
}: {
    siweUri: string,
    domain: string,
    nonce: string,
    notBefore?: string,
    expirationTime?: string,
    fid: number,
    custodyAddress: string
}) => {
    return `${domain} wants you to sign in with your Ethereum account:\n${custodyAddress}\n\nFarcaster Auth\n\nURI: ${siweUri}\nVersion: 1\nChain ID: 10\nNonce: ${nonce}${notBefore ? `\nIssued At: ${notBefore}` : `\nIssued At: ${new Date(Date.now() - 1000).toISOString()}`}${expirationTime ? `\nExpiration Time: ${expirationTime}` : ''}${notBefore ? `\nNot Before: ${notBefore}` : ''}\nResources:\n- farcaster://fid/${fid}`
}

// WC API has become slow authtoken is many times not considered valid until a few retries
// we use cached older token first
export const signInWithFarcaster = async ({
    channelToken,
    message,
    signature,
    authToken
}: {
    channelToken: string,
    message: string,
    signature: string,
    authToken: string
}) => {
    const maxRetries = 4
    let retries = 1
    let response: Response
    const newToken = authToken
    const cachedToken = await getCachedFcAuthToken()
    let token = cachedToken || newToken
    const isCachedToken = token === cachedToken
    do {
    await wait(200 * retries)
     response = await fetch(`${EP_SIGNIN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            channelToken,
            message,
            signature,
        })
    });
    if (response.ok) {
        setCachedFcAuthToken(token)
        return response.json();
    }
    if (isCachedToken) {
        token = newToken
    }
    retries++
    } while (retries < maxRetries)

    return response.json();
}

const noFidNotification = () => {
    const messageId = Math.floor(Math.random() * 1000000);

    chrome.notifications.create('no-fid', {
        type: 'basic',
        iconUrl: getUrl('assets/extension-icon/wallet_128.png'),
        title: 'Error',
        message: 'This addres does not own any FID please select custody address that owns your FID.\nMessage ID: ' + messageId
    });
}

export const getFidFromAddress = async (address: string): Promise<number | null> => {
    const provider = await getOptimismProvider();
    const contract = new ethers.Contract(FC_ID_REGISTRY_CONTRACT, FARCASTER_PARTIAL_KEY_ABI, provider);
    const FID = await contract.idOf(address);
    if (FID > 0) {
        return FID;
    }
    noFidNotification();
    return 0;
}

export const doSignInWithFarcasterQR = async () => {
    const custodyAddress = (await getSelectedAddress())?.[0] || '';
    const fid = custodyAddress && await getFidFromAddress(custodyAddress);
    if (!fid) {
        return -1;
    }

    const link = await getLinkFromQR();
    if (!link) {
        return -2;
    }

    const validateLinkDataResult = validateLinkData(link);
    if (!validateLinkDataResult) {
        return -3;
    }

    const { channelToken } = extractLinkData(link);

    const extractResult = await extractResponseData(channelToken);

    if (!extractResult) {
        return -4;
    }

    const { siweUri, domain, nonce, notBefore, expirationTime } = extractResult

    const message = constructWarpcastSWIEMsg({
        siweUri,
        domain,
        nonce,
        notBefore,
        expirationTime,
        fid,
        custodyAddress
    });

    const genToken = await generateApiToken();

    let authToken = '';
    if (genToken.success) {
        authToken = genToken.data;
    }

    if (!authToken) {
        return -5;
    }

    const signature = await signMsg(message);
    await signInWithFarcaster({
        channelToken,
        message,
        signature,
        authToken
    });

    return 1

}

export const doSignInWithFarcaster = async ({
    link
}: {
    link: string
}) => {
    const { channelToken } = extractLinkData(link);
    const custodyAddress = (await getSelectedAddress())?.[0] || '';
    const fid = custodyAddress && await getFidFromAddress(custodyAddress);
    if (!fid) {
        return -1;
    }

    const extractResult = await extractResponseData(channelToken);

    if (!extractResult) {
        return -3;
    }

    const { siweUri, domain, nonce, notBefore, expirationTime } = extractResult

    const message = constructWarpcastSWIEMsg({
        siweUri,
        domain,
        nonce,
        notBefore,
        expirationTime,
        fid,
        custodyAddress
    });

    const genToken = await generateApiToken();
    let authToken = '';
    if (genToken.success) {
        authToken = genToken.data;
    }

    if (!authToken) {
        return -2;
    }

    const signature = await signMsg(message);
    await signInWithFarcaster({
        channelToken,
        message,
        signature,
        authToken
    });

    return 1
}
