import { YupAPI } from 'yup-api-interact'


const args = Bun.argv.slice(3);

const secrets = JSON.parse(args[0]);
const githubEvvent = JSON.parse(args[1]);
const action = args[2]


const main = async () => {
    const YUP_PK = secrets.YUP_PK;

    const api = new YupAPI({ PK: YUP_PK, token: '' });

    if(action === 'commit') {
        console.log('Announcing commit')
        console.log(secrets, githubEvvent)
    }

}

main().catch(console.error);
