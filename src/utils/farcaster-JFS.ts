
import { getFidFromAddress } from './farcaster'
import { getSelectedAddress, signMsg } from './wallet'
import bufferLib from 'buffer';
import { base64ToBase64Url } from './misc';

const Buffer = bufferLib.Buffer;

export const validateCreateJFS = async (json: string) => {
    try {
        const parsedData = JSON.parse(json);
        if (typeof parsedData !== 'object' || parsedData === null) {
            return { error: 'Invalid JSON format', fid: '' };
        }
    } catch (error) {
        return { error: 'Invalid JSON format', fid: '' };
    }

    const custodyAddress = (await getSelectedAddress())?.[0] || '';

    let fid: null | number | string = await getFidFromAddress(custodyAddress);
    if (!fid) {
        return { error: 'This address does not own any FID, please select custody address that owns your FID.', fid: '' };
    }
    return { fid: fid.toString(), custodyAddress };
}

export const createJFS = async (json: string, fid: string, custodyAddress: string) => {
    const header = {
        fid: Number(fid),
        type: 'custody',
        key: custodyAddress
    };

    const parsedData = JSON.parse(json);
    const serializedJson = JSON.stringify(parsedData)

    const encodedHeader = base64ToBase64Url(Buffer.from(JSON.stringify(header), 'utf-8').toString('base64'));

    const encodedPayload = base64ToBase64Url(Buffer.from(serializedJson, 'utf-8').toString('base64'));

    const signature = await signMsg(`${encodedHeader}.${encodedPayload}`);

    const encodedSignature = base64ToBase64Url(Buffer.from(signature, 'utf-8').toString('base64'));

    const compactJfs = `${encodedHeader}.${encodedPayload}.${encodedSignature}`

    const jsonJfs = {
        header: encodedHeader,
        payload: encodedPayload,
        signature: encodedSignature
    }

    return { compactJfs, jsonJfs } ;

}

 