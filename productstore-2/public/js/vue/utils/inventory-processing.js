export default {
    // Return an array with skus that should be sent to Inventory API
    // Used on: Category Listing, Extra Saving and Search
    getAllSku: (data) => {
        let skus = [];

        // Get SKUS from: Data.Sku, Data.Products[key].Sku, Data.Products[key].FeatureSkus[key].AvailableSelections[key].Sku
        data.forEach((item) => {
            const obj = item.InnerData?.Data || {};

            // Data.Sku
            if(obj.Sku && obj.IsInventoryControlled) {
                skus.push(obj.Sku);
            }

            // If there is Products array
            if(obj.Products && Array.isArray(obj.Products)) {
                obj.Products.forEach((prod) => {
                    // Data.Products[key].Sku
                    if(prod.Sku && prod.IsInventoryControlled) {
                        skus.push(prod.Sku);
                    }

                    // If there is FeatureSkus array
                    if(prod.FeatureSkus && Array.isArray(prod.FeatureSkus)) {
                        prod.FeatureSkus.forEach((feature) => {
                            if(feature.AvailableSelections && Array.isArray(feature.AvailableSelections)) {
                                feature.AvailableSelections.forEach(selection => {
                                    // Data.Products[key].FeatureSkus[key].AvailableSelections[key].Sku
                                    if(selection.Sku && selection.IsInventoryControlled) {
                                        skus.push(selection.Sku);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        return skus;
    },

    // Return an array with all products and their possible Inventory API fields (isInventoryControlled, quantityAvailable, sku)
    // Used on: Category Listing, Extra Saving and Search
    processAllSku: (data, soldOutSkus) => {
        return data.map(card => {
            const obj = card.InnerData?.Data || {};
            let soldOutData = null;

            // Data.Sku
            if(obj.Sku) {
                // Check if Data.Sku is returned by Inventory API
                soldOutData = soldOutSkus.find(inventoryProduct => inventoryProduct.sku === obj.Sku);

                // If Data.Sku is found
                if(soldOutData) {
                    // Merge product object with Inventory API fields (isInventoryControlled, quantityAvailable, sku)
                    card = Object.assign(card, soldOutData);
                }
            }

            // If there is Products array
            if(obj.Products && Array.isArray(obj.Products)) {
                obj.Products.forEach((prod) => {
                    // Data.Products[key].Sku
                    if(prod.Sku) {
                        // Check if Data.Sku is returned by Inventory API
                        soldOutData = soldOutSkus.find(inventoryProduct => inventoryProduct.sku === prod.Sku);

                        // If Data.Products[key].Sku is found
                        if(soldOutData) {
                            // Merge product object with Inventory API fields (isInventoryControlled, quantityAvailable)
                            prod = Object.assign(prod, soldOutData);
                        }
                    }

                    // If there is FeatureSkus array
                    if(prod.FeatureSkus && Array.isArray(prod.FeatureSkus)) {
                        prod.FeatureSkus.forEach((feature) => {
                            if(feature.AvailableSelections && Array.isArray(feature.AvailableSelections)) {
                                feature.AvailableSelections.forEach(selection => {
                                    // Data.Products[key].FeatureSkus[key].AvailableSelections[key].Sku
                                    if(selection.Sku) {
                                        // Check if Data.Sku is returned by Inventory API
                                        soldOutData = soldOutSkus.find(inventoryProduct => inventoryProduct.sku === selection.Sku);

                                        // If Data.Products[key].Sku is found
                                        if(soldOutData) {
                                            // Merge product object with Inventory API fields (isInventoryControlled, quantityAvailable)
                                            selection = Object.assign(selection, soldOutData);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }

            return card;
        });
    }
};
