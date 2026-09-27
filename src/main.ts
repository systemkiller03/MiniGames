import{ createApp } from'./app';
import{ createRouter } from'./app/router';
import'./styles/main.scss';

const main = createApp();
createRouter(main);
