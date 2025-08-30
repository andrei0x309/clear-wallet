import jsQR from 'jsqr';

async function base64ImageToCanvas(imageBase64: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            } else {
                reject('Canvas context not available.');
            }
        };
        img.onerror = () => {
            reject('Image load error.');
        };
        img.src = imageBase64;
    });
}

export async function getQRCode(imageBase64: string): Promise<string | null> {
    try {
        const canvas = await base64ImageToCanvas(imageBase64);

        const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);

        const data = new Uint8ClampedArray((imageData?.data ?? []) as ImageDataArray);

        const code = jsQR(data, imageData?.width ?? 0, imageData?.height ?? 0);
        return code?.data || null;
    } catch (error) {
        console.error('Error decoding QR code:', error);
        return null;
    }
}