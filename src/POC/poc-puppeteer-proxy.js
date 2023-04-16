const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: [
      `--proxy-server=${process.env.PROXY_URL}`,
    ],
  });
  const page = await browser.newPage();

  await page.authenticate({
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  })

  await page.goto('https://ipv4.webshare.io/');
  const html = await page.content();
  console.log(html);

  // Close the browser
  await browser.close();
})();
