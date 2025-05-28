let IS_PROD = true;

const server = IS_PROD ?
    'https://video-meet-7x65.onrender.com':
    'http://localhost:6001' ;


export default server;