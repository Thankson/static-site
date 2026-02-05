import apiGetPhProvinceData from '@api/routes/address/philippines/getprovincedata';

const phAddressFormMixin = {
    computed: {
        isPhCitySelectReadOnly() {
            return !this.provinceData;
        },
        isPhSuburbSelectReadOnly() {
            return !this.cityData || !this.provinceData;
        }
    },
    methods: {
        async getPhSelectOptionData(searchTerm) {
            if(process.env.NODE_ENV !== 'development') {
                // Method located in address-form.js
                return this.getProdSelectOptionData(searchTerm);
            } else {
                // Development with Mirage mock data
                const response = await apiGetPhProvinceData.get(`?searchTerm=${searchTerm}`);
                if(response.success) return response.data;
            }
        },
        handlePhProvinceSelectChange(event) {
            if(this.settingInitialData) return;
            this.cityData = null;
            this.suburbData = null;
            if(event.value === this.provincePlaceholder) this.provinceData = null;
            else {
                this.provinceData = event.value;
                this.setPhCityData(event.value);
            }
        },
        handlePhCitySelectChange(event) {
            if(this.settingInitialData) return;
            this.suburbData = null;
            if(event.value === this.cityPlaceholder) this.cityData = null;
            else {
                this.cityData = event.value;
                this.setPhSuburbDataAndPostalCode(event.value);
            }
        },
        handlePhSuburbSelectChange(event) {
            if(this.settingInitialData) return;
            if(event.value === this.suburbPlaceholder) this.suburbData = null;
            else this.suburbData = event.value;
        },
        async setPhCityData(province) {
            const data = await this.getPhSelectOptionData(province);
            if(data && data.length > 0) {
                this.regions = data;
                const rawCityData = data.map(region => region.cityName).sort();
                const cityData = [...new Set(rawCityData)];
                cityData.unshift(this.cityPlaceholder);
                this.city = cityData;
            }
        },
        setPhInitialSelectPlaceholders() {
            this.city = [this.cityPlaceholder];
            this.suburb = [this.suburbPlaceholder];
        },
        async setPhPrefilledData() {
            const prefillVals = this.localization?.Data?.PrefilledFormValues || {};

            this.nameData = prefillVals.NameValue;
            this.address_1Data = prefillVals.Address_1Value;
            this.address_2Data = prefillVals.Address_2Value;
            this.phoneNumberData = prefillVals.PhoneNumberValue;
            this.deliveryInstructionsData = prefillVals.DeliveryInstructionsValue;
            this.postalCodeData = prefillVals.PostalCodeValue;
            this.defaultShip = prefillVals.IsDefault;

            if(prefillVals.ProvinceValue && prefillVals.CityValue && prefillVals.SuburbValue) {
                this.provinceData = prefillVals.ProvinceValue;
                await this.setPhCityData(prefillVals.ProvinceValue);
                this.cityData = prefillVals.CityValue;
                await this.setPhSuburbDataAndPostalCode(prefillVals.CityValue);
                this.suburbData = prefillVals.SuburbValue;
            }
        },
        async setPhSuburbDataAndPostalCode(city) {
            if(this.regions && this.regions.length > 0) {
                const cities = this.regions.filter(region => region.cityName === city);
                if(cities && cities.length > 0) {
                    this.postalCodeData = cities[0].postalCode;
                    const suburbData = cities.map(city => city.suburbName).sort();
                    suburbData.unshift(this.suburbPlaceholder);
                    this.suburb = suburbData;
                }
            }
        }
    }
};

export default phAddressFormMixin;
