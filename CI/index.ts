import { YupAPI } from 'yup-api-interact'
import { FCHubUtils } from 'farcaster-hub-utils'

const args = Bun.argv.slice(2);

const secrets = args[0]
const event = args[1]
const action = args[2]

type TGithubEvent = {
    inputs: {
        version: string
        fconly: boolean
    },
    forced: boolean,
    repository: {
        name: string,
        full_name: string,
        html_url: string,
        description: string
    },
    head_commit: {
        id: string,
        message: string,
        timestamp: string,
        url: string,
        author: {
            name: string,
            email: string,
            username: string
        },
        committer: {
            name: string,
            email: string,
            username: string
        }
    }
}

const main = async () => {
    const ENABLED = true;
    let YUP_PK = '';
    let FC_SIGNER = ''
    let HUB_URL = ''
    let HUB_USER = ''
    let HUB_PASS = ''
    let GithubEvent: TGithubEvent = {} as TGithubEvent;
    const USER_FID = 709233;

    console.log('Anouncement enabled status: ', '[ ', ENABLED, ' ]');

    try {
        const parsedSecrets = JSON.parse(secrets);
        YUP_PK = parsedSecrets.YUP_PK;
        FC_SIGNER = parsedSecrets.FC_SIGNER;
        HUB_URL = parsedSecrets.HUB_URL;
        HUB_USER = parsedSecrets.HUB_USER;
        HUB_PASS = parsedSecrets.HUB_PASS;
        GithubEvent = JSON.parse(event);
    } catch (e) {
        console.error('Error parsing data', e)
    }

    const yupAPI = new YupAPI({ PK: YUP_PK });
    const fchubUtils = new FCHubUtils(FC_SIGNER, USER_FID, HUB_URL, HUB_USER, HUB_PASS);

    if (action === 'update') {
        const VERSION = GithubEvent.inputs.version;
        const FCONLY = GithubEvent.inputs.fconly;
        const message = `Clear Wallet - New version ${VERSION} released! \n
- ChromeStore: https://bit.ly/clw-evm \n
- ChangeLog: https://bit.ly/clw-cl \n
- Submited by @andrei0x309 \n`
        if (ENABLED) {
            if (!FCONLY) {
                await yupAPI.sendPost({
                    content: message,
                    platforms: ['twitter', 'threads', 'bsky', 'lens']
                })
            }
            const fcPost = await fchubUtils.createFarcasterPost({
                content: message,
            })
            const fcPostHash = Buffer.from(fcPost).toString('hex');
            if (fcPostHash) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                const launchCasterMessage = `@launch`

                await fchubUtils.createFarcasterPost({
                    content: launchCasterMessage, replyTo: {
                        hash: fcPostHash,
                        fid: String(USER_FID)
                    }
                })

            }

        } else {
            console.log('No action required')
        }

    } else if (action === 'push') {
        if (ENABLED && !GithubEvent.forced && GithubEvent?.head_commit?.message.includes('chore:') && !GithubEvent?.head_commit?.message.includes('!')) {
            const commiter = GithubEvent?.head_commit?.author.username || GithubEvent?.head_commit?.committer?.username || ''
            const message = `Github ClearWallet new repo commit!\n
- ChromeStore: https://bit.ly/clw-evm \n
- Docs: https://clear-wallet.flashsoft.eu \n
- Commit: ${GithubEvent.head_commit.url} \n
${commiter ? `- Commiter: @${commiter}` : ''}
            `;

            await yupAPI.sendPost({
                content: message,
                platforms: ['twitter', 'threads', 'bsky', 'lens', 'mastodon']
            })

            await fchubUtils.createFarcasterPost({
                content: message,
            })
        } else {
            console.log('No action required')
        }
    }

    console.log('Workflow executed successfully');

}

main().catch(console.error);
