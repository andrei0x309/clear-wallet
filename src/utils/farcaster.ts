import { signMsg, getSelectedAddress, getOptimismProvider } from './wallet'
import { FARCASTER_PARTIAL_KEY_ABI } from './abis'
import { ethers } from 'ethers'
import { getUrl } from './platform'
import { generateApiToken } from './warpcast-auth'

const WARPCAST_BASE = 'https://client.warpcast.com/v2/'
const EP_SIGNIN = `${WARPCAST_BASE}sign-in-with-farcaster`
const FC_ID_REGISTRY_CONTRACT = '0x00000000fc6c5f01fc30151999387bb99a9f489b'

export const extractLinkData = (link: string) => {
    const url = new URL(link);
    const channelToken = url.searchParams.get('channelToken');
    const nonce = url.searchParams.get('nonce');
    const siweUri = url.searchParams.get('siweUri');
    const domain = url.searchParams.get('domain');
    const notBefore = url.searchParams.get('notBefore');
    const expirationTime = url.searchParams.get('expirationTime');

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

export const validateLinkData = (link: string) => {
    const { channelToken, nonce, siweUri, domain, notBefore, expirationTime } = extractLinkData(link);
    if (!channelToken || !nonce || !siweUri || !domain || !notBefore || !expirationTime) {
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
    notBefore: string,
    expirationTime: string,
    fid: number,
    custodyAddress: string
}) => {
    return `${domain} wants you to sign in with your Ethereum account:\n${custodyAddress}\n\nFarcaster Auth\n\nURI: ${siweUri}\nVersion: 1\nChain ID: 10\nNonce: ${nonce}\nIssued At: ${notBefore}\nExpiration Time: ${expirationTime}\nNot Before: ${notBefore}\nResources:\n- farcaster://fid/${fid}`
}
 

export const signInWithFarcaster = async ({
    channelToken,
    message,
    signature,
    authToken
} : {
    channelToken: string,
    message: string,
    signature: string,
    authToken: string
}) => {
    const response = await fetch(`${EP_SIGNIN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  `Bearer ${authToken}`
        },
        body: JSON.stringify({
            channelToken,
            message,
            signature,
        })
    });

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

export const getFidFromAddress = async (address: string) : Promise<number | null> => {
    const provider = await getOptimismProvider();
    const contract =  new ethers.Contract(FC_ID_REGISTRY_CONTRACT, FARCASTER_PARTIAL_KEY_ABI, provider);
    const FID = await contract.idOf(address);
    if (FID > 0) {
        return FID;
    }
    noFidNotification();
    return 0;
}

export const doSignInWithFarcaster = async ({
    link
}: {
    link: string
}) => {
    const { channelToken, nonce, siweUri, domain, notBefore, expirationTime } = extractLinkData(link);
    const custodyAddress = (await getSelectedAddress())?.[0] || '';
    const fid =  custodyAddress && await getFidFromAddress(custodyAddress);
    if (!fid) {
        return -1;
    }
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
    if(genToken.success) {
        authToken = genToken.data;
    }

    console.log('authToken', authToken);

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

