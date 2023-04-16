import puppeteer from "puppeteer";
import { generateVariations, mapModelToVariations, centsToMYR, applyModelToVariations, formatModel } from './utils';
import { ENABLE_ROTATE_PROXY, PROXY_USERNAME, PRODUCT_PAGE, PROXY_PASSWORD, PUPPETEER_ARGUMENTS } from './constants';


(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    ignoreHTTPSErrors: true,
    args : PUPPETEER_ARGUMENTS,
  });

  const page = await browser.newPage();

  if (ENABLE_ROTATE_PROXY) {
    await page.authenticate({
      username: PROXY_USERNAME,
      password: PROXY_PASSWORD
    })
  }

  await page.goto(
      PRODUCT_PAGE,
    { waitUntil: 'domcontentloaded' }
  );

  // if the request url is like "https://shopee.com.my/api/v4/item/get?" console.log the response
    page.on('response', response => {
      // check if request url have "api/v4/item/get?" in it with regex
        if (response.url().match(/api\/(.*)\/item\/get\?/)) {
          // log response after converting it to json using async await
            (async () => {
              const responseJson = await response.json();
              // if data exist in responseJson then log it
              if (responseJson.data) {
                const { name, price, price_min, price_max, sold, models, tier_variations } = responseJson.data;

                // the price, price_min and price_max is in cents, so we need to divide it by 100000 to get the price in RM
                const priceInRM = centsToMYR(price);
                const priceMinInRM = centsToMYR(price_min);
                const priceMaxInRM = centsToMYR(price_max);

                // Call the generateVariations function with the variations data
                // the generateVariations function will return an array of all possible variations
                // example: [{ size: 'M', color: 'red' }, { size: 'M', color: 'blue' }, { size: 'L', color: 'red' }, { size: 'L', color: 'blue' }]
                const allVariations = generateVariations(tier_variations);

                // this is mapping the model to be included in variations. only models have stock, price and price_before_discount
                const mappedModels = models.map((model) => formatModel(model, tier_variations));

                // loop through allVariations and find the model that match the current variation
                // if { size: 'M', color: 'blue' } === { size: 'M', color: 'blue' } then add stock, price and price_before_discount to the variation from models
                const variationsWithModelDetails = allVariations.reduce((variations, currentVariation) => {
                  // this is searching for the model that match the current variation
                  const matchedModel = mappedModels.find((model) => {
                    return JSON.stringify(model.variations) === JSON.stringify(currentVariation);
                  });

                  // this adds stock, price and price_before_discount to the variation
                  if (matchedModel) return applyModelToVariations(variations, currentVariation, matchedModel)
                  return variations;
                }, []);

                console.log(variationsWithModelDetails);
              }

              // if error exist in responseJson then log it
              if (responseJson.error) {
                console.log(responseJson.error);
              }

              await browser.close();

            })();
        }
    });
})();
