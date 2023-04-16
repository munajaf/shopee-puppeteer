


const allVariations = tier_variations.reduce((acc, curr) => {
    const { name, options } = curr;
    const newOptions = options.map((option) => ({ [name]: option }));
    return [...acc, ...newOptions];
}, []);

const mappedModels = models.map((model) => {
    const variations = model.extinfo.tier_index.map((optionIndex, index) => ({
        name: tier_variations[index].name,
        option: tier_variations[index].options[optionIndex],
    }));
    return {
        itemid: model.itemid,
        normal_stock: model.normal_stock,
        price: model.price,
        price_before_discount: model.price_before_discount,
        variations,
    };
});

const variationsWithStockAndPrice = allVariations.map((variation) => {
    const matchingModel = mappedModels.find((model) =>
        model.variations.every(
            (modelVariation) =>
                modelVariation[Object.keys(modelVariation)[0]] === variation[Object.keys(variation)[0]]
        )
    );
    return {
        ...variation,
        normal_stock: matchingModel.normal_stock,
        price: matchingModel.price,
    };
});

console.log(variationsWithStockAndPrice);
