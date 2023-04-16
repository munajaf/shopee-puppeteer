require('dotenv').config();
const request = require('request');
// using webshare.io proxy
const proxyUrl = process.env.FULL_PROXY;


request.get('https://ipv4.webshare.io/', {
  proxy: proxyUrl,
}, (error, response, body) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`IP address: ${body}`);
  }
});