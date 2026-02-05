import apiGetTwCityData from '@api/routes/address/taiwan/getcitylist';

const twAddressFormMixin = {
    computed: {
        isTwSuburbSelectReadOnly() {
            return !this.cityData;
        }
    },
    methods: {
        async getTwSelectOptionData(searchTerm) {
            if(process.env.NODE_ENV !== 'development') {
                // Method located in address-form.js
                return this.getProdSelectOptionData(searchTerm);
            } else {
                // Development with Mirage mock data
                const response = await apiGetTwCityData.get();
                if(response.success) return response.data;
            }
        },
        handleTwCitySelectChange(event) {
            if(this.settingInitialData) return;
            this.suburbData = null;
            this.postalCodeData = null;
            if(event.value === this.cityPlaceholder) this.cityData = null;
            else {
                this.cityData = event.value;
                this.setTwSuburbData(event.value);
            }
        },
        handleTwSuburbSelectChange(event) {
            if(this.settingInitialData) return;
            if(event.value === this.suburbPlaceholder) {
                this.suburbData = null;
                this.postalCodeData = null;
            } else {
                this.suburbData = event.value;
                this.setTwPostalCode();
            }
        },
        async setTwCityData() {
            const data = await this.getTwSelectOptionData('City');
            if(data && data.length > 0) {
                this.regions = data;
                const rawCityData = data.map(region => region.cityName).sort();
                const cityData = [...new Set(rawCityData)];
                cityData.unshift(this.cityPlaceholder);
                this.city = cityData;
            }
        },
        setTwInitialSelectPlaceholders() {
            this.city = [this.cityPlaceholder];
            this.suburb = [this.suburbPlaceholder];
        },
        async setTwPrefilledData() {
            const prefillVals = this.localization?.Data?.PrefilledFormValues || {};

            this.nameData = prefillVals.NameValue;
            this.address_1Data = prefillVals.Address_1Value;
            this.address_2Data = prefillVals.Address_2Value;
            this.phoneNumberData = prefillVals.PhoneNumberValue;
            this.deliveryInstructionsData = prefillVals.DeliveryInstructionsValue;
            this.defaultShip = prefillVals.IsDefault;
            this.provinceData = prefillVals.ProvinceValue;

            await this.setTwAreaRelatedData(prefillVals);
        },
        async setTwAreaRelatedData(prefillVals) {
            if(prefillVals.CityValue && prefillVals.SuburbValue && prefillVals.PostalCodeValue) {
                this.cityData = prefillVals.CityValue;
                await this.setTwSuburbData(prefillVals.CityValue);
                this.suburbData = prefillVals.SuburbValue;
                this.postalCodeData = prefillVals.PostalCodeValue;
            }
        },
        async setTwAreaRelatedDataForCheckoutPage() {
            // 1. set prefilledFormValuesTW
            const prefilledFormValuesTW = {
                CityValue: this.cityData,
                SuburbValue: this.suburbData,
                PostalCodeValue: this.postalCodeData
            };

            // 2. reset `this.cityData` and `this.suburbData`
            // first, should reset `this.cityData` and `this.suburbData` to make sure
            // `this.cityData` and `this.suburbData` will update value after execute method `this.setTwCityData` and `this.setTwSuburbData`
            this.cityData = '';
            this.suburbData = '';

            // 3. set city list region list, then set city value and region value
            await this.setTwInitialSelectPlaceholders();
            await this.setTwCityData();
            this.setTwAreaRelatedData(prefilledFormValuesTW);
        },
        setTwPostalCode() {
            if(this.regions && this.regions.length > 0) {
                const region = this.regions
                    .filter(region => region.cityName === this.cityData)
                    .filter(region => region.suburbName === this.suburbData);
                this.postalCodeData = region[0].postalCode;
            }
        },
        async setTwSuburbData(city) {
            if(this.regions && this.regions.length > 0) {
                const suburbData = this.regions
                    .filter(region => region.cityName === city)
                    .map(suburb => suburb.suburbName)
                    .sort();
                suburbData.unshift(this.suburbPlaceholder);
                this.suburb = suburbData;
            }
        }
    }
};

export default twAddressFormMixin;
