import QrScanner from 'qr-scanner';

function base64ImageToBlob(str: string) {
    const pos = str.indexOf(";base64,");
    const type = str.substring(5, pos);
    const b64 = str.substr(pos + 8);
    const imageContent = atob(b64);
    const buffer = new ArrayBuffer(imageContent.length);
    const view = new Uint8Array(buffer);
    for(var n = 0; n < imageContent.length; n++) {
      view[n] = imageContent.charCodeAt(n);
    }
    const blob = new Blob([buffer], { type: type });
    return blob;
  }
  
export async function getQRCode(imageBase64: string) { 
    try { 
    const imageBlob = base64ImageToBlob(imageBase64);
        
    return await QrScanner.scanImage(imageBlob)
    } catch (e) {
    console.error(e);
    return null;
    }
  }
