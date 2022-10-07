import { setPrices } from '@/utils/platform'
import { mainNets } from '@/utils/networks'
const coinGekoApiEndpoint = 'https://api.coingecko.com/api/v3/'

export const updatePrices = async() : Promise<void> => {
    const priceIds = Object.values(mainNets).map(n => n.priceId).join(',')
    const req = await fetch(`${coinGekoApiEndpoint}/simple/price?ids=${priceIds}&vs_currencies=usd`)
    if (req.ok) {
        await setPrices(await req.json())
    }
}
