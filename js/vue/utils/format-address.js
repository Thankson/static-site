export function compareAddress(address1, address2, country) {
    if(address1 === null || address2 === null) return false;

    const formattedAddress1 = formatAddressesForComparison(address1, country);
    const formattedAddress2 = formatAddressesForComparison(address2, country);

    return formattedAddress1.every((addressValue, index) => addressValue === formattedAddress2[index]);
}

export function formatAddressesForComparison (address, country) {
    let postalCode = country === 'UnitedStates' ? address.PostalCode?.split('-')[0] : address.PostalCode;
    let addressLine2 = address?.AddressLine2 || '';
    const data = [
        address.AddressLine1,
        addressLine2,
        address.City,
        address.ProvinceShortName || address.Province,
        address.Country,
        postalCode
    ];
    const transformData = data.map(data => data?.toLowerCase()?.trim()?.replace(/\s{2,}/g, ' '));
    return transformData;
}

export function createFormattedAddress(obj, country) {
    let street;
    if(obj.address_1Data) {
        street = obj.address_1Data;
    }
    if(obj.address_2Data) {
        street += '<br>' + obj.address_2Data;
    }
    if(obj.address_3Data) {
        street += '<br>' + obj.address_3Data;
    }
    let stateProvince = getProvinceState(country);
    let zipPostal = getZipPostalCode(country);
    return `<p><strong>${obj.nameData}</strong></p><p>${street}</p><p>${obj.cityData}, ${obj[stateProvince]} ${obj[zipPostal]}</p>`;
}

export function createObjectForStoringSavedAddressInMemoryThatMatchesFetched(address, addressId) {
    return {
        AddressId: addressId,
        AddressLine1: address.AddressLine1,
        AddressLine2: address.AddressLine2,
        AddressLine3: address.AddressLine3,
        AddressType: address.AddressType,
        City: address.City,
        Country: address.Country,
        DeliveryInstructions: address.DeliveryInstructions,
        IsDefault: address.IsDefault,
        NameOnAddress: address.NameOnAddress,
        PostalCode: address.PostalCode,
        Province: address.Province,
        ProvinceShortName: address.Province
    };
}

export function formatCountryName(country) {
    return country.replaceAll(' ', '').toLowerCase();
}

export function getProvinceState(country) {
    switch (country) {
        case 'United States':
            return 'stateData';
        case 'Canada':
            return 'provinceData';
        default:
            return 'stateData';
    }
}

export function getZipPostalCode(country) {
    switch (country) {
        case 'United States':
            return 'zipCodeData';
        case 'Canada':
            return 'postalCodeData';
        default:
            return 'zipCodeData';
    }
}
