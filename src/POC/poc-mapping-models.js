const tier_variations = [
    {
        name: "Color",
        options: ["white", "blue", "yellow", "khaki", "sock"],
    },
    {
        name: "Size",
        options: ["M", "L", "XL", "XXL", "3XL"],
    },
];

const models = [
    {
        itemid: 18320662179,
        "normal_stock":486,
        "price": 2450000,
        "price_before_discount": 3127000,
        extinfo: {
            tier_index: [2, 1],
        },
    },
    {
        itemid: 18320662179,
        "normal_stock": 477,
        "price": 2450000,
        "price_before_discount": 3127000,
        extinfo: {
            tier_index: [0, 4],
        },
    },
];

const mapVariations = (variationIndex, tierIndex) => {
    const variation = tier_variations[variationIndex];
    const option = variation.options[tierIndex];
    return { name: variation.name, option };
};

const mapModelToVariations = (model) => {
    const { extinfo } = model;
    const variations = extinfo.tier_index.map((tierIndex, index) => {
        return mapVariations(index, tierIndex);
    });
    return variations;
};

const mappedModels = models.map((model) => {
    return {
        itemid: model.itemid,
        normal_stock: model.normal_stock,
        price: model.price,
        price_before_discount: model.price_before_discount,
        variations: mapModelToVariations(model),
    };
});

console.dir(mappedModels, { depth: null });
