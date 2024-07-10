import { YupAPI } from 'yup-api-interact'
import { FCHubUtils } from 'farcaster-hub-utils'

const args = Bun.argv.slice(2);

const secrets = args[0] 
const event = args[1]
const action = args[2]

type TGithubEvent = {
    inputs: {
        version: string
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
    let GithubEvent: TGithubEvent = {} as TGithubEvent;
    const USER_FID = 709233;

    console.log('Anouncement enabled status: ', '[ ', ENABLED, ' ]');

    try {
        const parsedSecrets = JSON.parse(secrets);
        YUP_PK = parsedSecrets.YUP_PK;
        FC_SIGNER = parsedSecrets.FC_SIGNER;
        GithubEvent = JSON.parse(event);
    } catch (e) {
        console.error('Error parsing data', e)
    }

    const yupAPI = new YupAPI({ PK: YUP_PK});
    const fchubUtils = new FCHubUtils(FC_SIGNER, USER_FID);

    if(action === 'update') {
        const VERSION = GithubEvent.inputs.version;
        const message = `Github ClearWallet new version ${VERSION} has been released!\n
        ChromeStore: https://bit.ly/clw-evm \n
        Github: https://github.com/andrei0x309/clear-wallet
        `;

        if(ENABLED) {
            await yupAPI.sendPost({
                content: message,
                platforms: ['twitter', 'threads', 'bsky', 'lens']
            })
            await fchubUtils.createFarcasterPost({
                content: message,
            })
        } else {
            console.log('No action required')
        }

    } else if(action === 'push') {
         if(ENABLED && !GithubEvent.forced && GithubEvent?.head_commit?.message.includes('chore:')) {
            const commiter = GithubEvent?.head_commit?.author.username || GithubEvent?.head_commit?.committer?.username || ''
            const message = `Github ClearWallet new repo commit!\n
            ChromeStore: https://bit.ly/clw-evm \n
            Commit: ${GithubEvent.head_commit.url}
            ${ commiter ? `By: ${commiter}` : ''}
            `;
            
            await yupAPI.sendPost({
                content: message,
                platforms: ['twitter', 'threads', 'bsky', 'lens']
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
