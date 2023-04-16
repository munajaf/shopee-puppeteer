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

export const centsToMYR = (cents) => {
    return cents / 100000;
}

// Create a recursive function to generate all possible variations
export const generateVariations = (variationList, currentIndex = 0, currentVariation = {}, variationsArray = []) => {
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

export const applyModelToVariations = (variations, currentVariation, matchedModel) => {
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

export const formatModel = (model, tier_variations) => {
    return {
        itemid: model.itemid,
        normal_stock: model.normal_stock,
        price: centsToMYR(model.price),
        price_before_discount: centsToMYR(model.price_before_discount),
        variations: mapModelToVariations(model, tier_variations),
    };
}