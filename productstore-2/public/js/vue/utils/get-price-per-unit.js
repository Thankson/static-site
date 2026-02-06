//  Returns price-per-unit value for Preferred or Regular customer
// Price types can be Concentrated, Diluted, Original
// Specific to Europe markets for now.

export function getPricePerUnit(priceRange, pricingType, viewMemberPrice) {
    if(!priceRange) {
        return '';
    }
    const preferredPriceKey = `${pricingType}PreferredPricePerUnit`;
    const regularPriceKey = `${pricingType}RegularPricePerUnit`;

    const price = viewMemberPrice
        ? priceRange?.[preferredPriceKey]
        : priceRange?.[regularPriceKey];
    return price ?? '';
}
