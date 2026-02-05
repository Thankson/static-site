import apiGetHkAddressData from '@api/routes/address/searchaddressselections';

const HONGKONG_POSTAL_CODE = '852';
const MACAU_POSTAL_CODE = '853';

const hkAddressFormMixin = {
    computed: {
        isHkAreaSelectReadOnly() {
            return !this.cityData;
        },
        isHkSuburbSelectReadOnly() {
            return !this.cityData || !this.areaData;
        },
        isHkSuburbSelectRequired() {
            return this.postalCodeData === HONGKONG_POSTAL_CODE;
        }
    },
    methods: {
        async getHkSelectOptionData() {
            const response = await apiGetHkAddressData.get();
            if(response.success && response.data?.Success) return response.data?.Data?.AddressList;
        },
        handleHkAreaSelectChange(event) {
            if(this.settingInitialData) return;
            this.suburbData = null;
            if(event.value === this.areaPlaceholder) this.areaData = null;
            else {
                this.areaData = event.value;
                this.setHkSuburbData(event.value);
            }
        },
        handleHkCitySelectChange(event) {
            if(this.settingInitialData) return;
            this.areaData = null;
            this.suburbData = null;
            if(event.value === this.cityPlaceholder) this.cityData = null;
            else {
                this.cityData = event.value;
                this.setHkPostalCodeData(event.value);
                this.setHkAreaData(event.value);
            }
        },
        handleHkSuburbSelectChange(event) {
            if(this.settingInitialData) return;
            if(event.value === this.suburbPlaceholder) this.suburbData = null;
            else this.suburbData = event.value;
        },
        async setHkAreaData(state) {
            if(this.regions && this.regions.length > 0) {
                const rawAreaData = this.regions
                    .filter(region => region.StateName === state)
                    .map(region => region.CityName)
                    .sort();
                const areaData = [...new Set(rawAreaData)];
                areaData.unshift(this.areaPlaceholder);
                this.area = areaData;
            }
        },
        setHkInitialSelectPlaceholders() {
            this.city = [this.cityPlaceholder];
            this.area = [this.areaPlaceholder];
            this.suburb = [this.suburbPlaceholder];
        },
        async setHkCityData() {
            const data = await this.getHkSelectOptionData();

            if(data && data.length > 0) {
                this.regions = data;
                const rawStateName = data.map(region => region.StateName).sort();
                const cityData = [...new Set(rawStateName)];
                cityData.unshift(this.cityPlaceholder);
                this.city = cityData;
            }
        },
        setHkPostalCodeData(city) {
            if(this.regions && this.regions.length > 0) {
                const region = this.regions.filter(region => region.StateName === city);
                this.postalCodeData = region[0].PostalCode;
            }
        },
        async setHkPrefilledData() {
            const prefillVals = this.localization?.Data?.PrefilledFormValues || {};

            this.nameData = prefillVals.NameValue;
            this.address_1Data = prefillVals.Address_1Value;
            this.address_2Data = prefillVals.Address_2Value;
            this.phoneNumberData = prefillVals.PhoneNumberValue;
            this.deliveryInstructionsData = prefillVals.DeliveryInstructionsValue;
            this.defaultShip = prefillVals.IsDefault;

            if(
                prefillVals.PostalCodeValue === HONGKONG_POSTAL_CODE &&
                prefillVals.CityValue &&
                prefillVals.SuburbValue
            ) {
                this.postalCodeData = prefillVals.PostalCodeValue;
                this.cityData = prefillVals.StateValue;
                await this.setHkAreaData(prefillVals.StateValue);
                this.areaData = prefillVals.CityValue;
                await this.setHkSuburbData(prefillVals.CityValue);
                this.suburbData = prefillVals.SuburbValue;
            } else if(
                prefillVals.PostalCodeValue === MACAU_POSTAL_CODE &&
                prefillVals.CityValue
            ) {
                this.postalCodeData = prefillVals.PostalCodeValue;
                this.cityData = prefillVals.StateValue;
                await this.setHkAreaData(prefillVals.StateValue);
                this.areaData = prefillVals.CityValue;
            }
        },
        async setHkSuburbData(area) {
            if(this.regions && this.regions.length > 0) {
                const rawSuburbDataObject = this.regions
                    .filter(
                        region =>
                            region.StateName === this.cityData &&
                            region.CityName === area
                    ).sort((a, b) => a.SuburbName.localeCompare(b.SuburbName));
                const rawSuburbData = rawSuburbDataObject.map(suburb => suburb.SuburbName);
                const suburbData = [...new Set(rawSuburbData)];
                suburbData.unshift(this.suburbPlaceholder);
                this.suburb = suburbData;
                this.suburbDisables = [
                    false,
                    ...rawSuburbDataObject.map((suburb) => suburb.DeliveryNotAvailable && !this.isBusiness)
                ];
            }
        }
    }
};

export default hkAddressFormMixin;
