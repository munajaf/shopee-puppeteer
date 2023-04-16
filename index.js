require('dotenv').config();
const puppeteer = require('puppeteer');

// since the env i gave is a string, we need to convert it to boolean by comparing it to 'true'
const ENABLE_ROTATE_PROXY = process.env.ENABLE_ROTATE_PROXY === 'true'
const PRODUCT_PAGE = process.env.PRODUCT_PAGE;

const convertCentsToRM = (cents) => {
  return cents / 100000;
}

// Create a recursive function to generate all possible variations
const generateVariations = (variationList, currentIndex = 0, currentVariation = {}, variationsArray = []) => {
  const currentVariations = variationList[currentIndex];
  const { name, options } = currentVariations;

  for (let i = 0; i < options.length; i++) {
    const variation = { ...currentVariation };
    variation[name] = options[i];

    if (currentIndex === variationList.length - 1) {
      variationsArray.push(variation);
    } else {
      generateVariations(variationList, currentIndex + 1, variation, variationsArray);
    }
  }

  return variationsArray;
}


const mapVariations = (tier_variations, variationIndex, tierIndex) => {
  const variation = tier_variations[variationIndex];
  const option = variation.options[tierIndex];
  return { name: variation.name, option };
};

const mapModelToVariations = (model, tier_variations) => {
  const { extinfo } = model;
  const variations = extinfo.tier_index.map((tierIndex, index) => {
    // example of what mapVariations(index, tierIndex) will return:
    // { name: 'Color', option: 'white' }
    return mapVariations(tier_variations, index, tierIndex);
  });


  return variations.reduce((result, variation) => {
    result[variation.name] = variation.option;
    return result;
  }, {});
};



(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    ignoreHTTPSErrors: true,
    args : [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
      ENABLE_ROTATE_PROXY ? `--proxy-server=${process.env.PROXY_URL}` : "",
    ],
  });

  const page = await browser.newPage();

  if (ENABLE_ROTATE_PROXY) {
    await page.authenticate({
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD
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
                const priceInRM = convertCentsToRM(price);
                const priceMinInRM = convertCentsToRM(price_min);
                const priceMaxInRM = convertCentsToRM(price_max);

                // Call the generateVariations function with the variations data
                // the generateVariations function will return an array of all possible variations
                // example: [{ size: 'M', color: 'red' }, { size: 'M', color: 'blue' }, { size: 'L', color: 'red' }, { size: 'L', color: 'blue' }]
                const allVariations = generateVariations(tier_variations);

                const mappedModels = models.map((model) => {
                  return {
                    itemid: model.itemid,
                    normal_stock: model.normal_stock,
                    price: convertCentsToRM(model.price),
                    price_before_discount: convertCentsToRM(model.price_before_discount),
                    variations: mapModelToVariations(model, tier_variations),
                  };
                });

                const variationsWithModelDetails = allVariations.reduce((variations, currentVariation) => {
                  const matchedModel = mappedModels.find((model) => {
                    return JSON.stringify(model.variations) === JSON.stringify(currentVariation);
                  });

                  if (matchedModel) {
                    return [
                      ...variations,
                      {
                        ...currentVariation,
                        stock: matchedModel.normal_stock,
                        price: matchedModel.price,
                        price_before_discount: matchedModel.price_before_discount,
                      }
                    ];
                  }
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
