<template>
    <div class="m-formField__areaSelect">
        <input id="cityId" :value="cityId" name="cityId" hidden="hidden" />
        <input id="city" :value="city" name="city" hidden="hidden" />
        <input id="provinceId" :value="provinceId" name="provinceId" hidden="hidden" />
        <input id="province" :value="province" name="province" hidden="hidden" />
        <input id="region" :value="region" name="region" hidden="hidden" />
        <input id="regionId" :value="regionId" name="regionId" hidden="hidden" />

        <input
            :id="id"
            ref="district"
            :class="[showError || isFieldError ? 'formError areaFormError' : '']"
            :name="name"
            :type="inputType"
            :placeholder="placeholder"
            :aria-placeholder="placeholder"
            :value="district"
            readonly="readonly"
            class="a-input -md"
            :data-rule-required="!showOption"
            :data-rule-pattern="pattern"
            :data-msg-required="district==='' ? validationRequired : validationAlert"
            :aria-required="true"
            @click="isOptionShow()"
        />
        <div v-if="showOption && getCurrentDevice() === 'desktop'" class="m-formField__mask -desktop" @click="isOptionShow()"></div>
        <div v-if="showOption && getCurrentDevice() === 'desktop'" class="m-formField__options -desktop" :class="{'-useInVue': useInVueComponent}" :for="id">
            <ul v-if="provinceList !==undefined && provinceList.length > 0 " id="Province" class="m-formField__lists -province">
                <li v-for="prov in provinceList" :id="provinceId === prov.id? 'activeProvince' : ''" :key="prov.id" class="m-formField__item" :class="provinceId === prov.id? '-active' : ''" @click="provActive(prov.id, prov.fullname)">{{ prov.fullname }}</li>
            </ul>
            <ul v-if="cityList !==undefined && cityList.length > 0 " id="City" class="m-formField__lists -city">
                <li v-for="ct in cityList" :id="cityId === ct.id? 'activeCity' : ''" :key="ct.id" class="m-formField__item" :class="cityId === ct.id? '-active' : ''" @click="cityActive(ct.id, ct.fullname)">{{ ct.fullname }}</li>
            </ul>
            <ul v-if="regionList !==undefined && regionList.length > 0 " id="Region" class="m-formField__lists -region">
                <li v-for="reg in regionList" :id="regionId === reg.id? 'activeRegion' : ''" :key="reg.id" class="m-formField__item" :class="regionId === reg.id? '-active' : ''" @click="regionActive(reg.id, reg.fullname)">{{ reg.fullname }}</li>
            </ul>
        </div>
        <div v-if="showOption && (getCurrentDevice() === 'mobile')" class="m-formField__mobileOptions">
            <div class="m-formField__mask"></div>
            <div class="m-formField__box">
                <div class="m-formField__container">
                    <div class="m-formField__btn" @click="isOptionShow()">取消</div>
                    <div class="m-formField__btn" @click="isOptionShow()">确定</div>
                </div>
                <div class="m-formField__options -mobile" :for="id">
                    <ul
                        v-if="provinceList !==undefined && provinceList.length > 0 " id="Province" class="m-formField__lists -province"
                        @touchmove="touchMove"
                        @touchend="touchEnd('prov', $event)"
                    >
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li v-for="(prov, index) in provinceList" :id="provinceId === prov.id? 'activeProvince' : ''" :key="index" :data-index="index" class="m-formField__item" :class="provinceId === prov.id? '-active' : ''">{{ prov.fullname }}</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                    </ul>
                    <ul
                        v-if="cityList !==undefined && cityList.length > 0 " id="City" class="m-formField__lists -city"
                        @touchmove="touchMove"
                        @touchend="touchEnd('city', $event)"
                    >
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li v-for="(ct, index) in cityList" :id="cityId === ct.id? 'activeCity' : ''" :key="index" :data-index="index" class="m-formField__item" :class="cityId === ct.id? '-active' : ''">{{ ct.fullname }}</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                    </ul>
                    <ul
                        v-if="regionList !==undefined && regionList.length > 0 " id="Region" class="m-formField__lists -region"
                        @touchmove="touchMove"
                        @touchend="touchEnd('region', $event)"
                    >
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li v-for="(reg, index) in regionList" :id="regionId === reg.id? 'activeRegion' : ''" :key="index" :data-index="index" class="m-formField__item" :class="regionId === reg.id? '-active' : ''">{{ reg.fullname }}</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                        <li class="m-formField__item">&nbsp;</li>
                    </ul>
                </div>
            </div>
        </div>

        <em v-if="showError" id="area-error" class="-noIcon -bgIcon">
            <p class="flex text-red text-sm leading-tight my-10">
                <span v-if="!useInVueComponent" aria-hidden="true" class="font-material text-xs mr-3 mt-2 leading-base">error_outline</span>
                <span>{{ areaInfo.prohibitErrorMessage }}</span>
            </p>
        </em>

        <modal id="address-invalid-format-description" :heading-visible="false">
            <template v-slot:content>
                <div class="to-md:mx-30 to-md:mb-30">
                    <p class="mb-30">{{ addressInvalidFormatDescription }}</p>
                    <button class="a-button px-15 -medium" @click="closeModal('AddressInvalidFormatDescription')">{{ continueEdit }}</button>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';
    import districtApi from '@api/routes/address/getdistrictlist';
    import adCodesApi from '@api/routes/address/getadcodes';
    import prohibitAreaApi from '@api/routes/address/getprohibitarea';
    import districtChildrenApi from '@api/routes/address/getdistrictchildren';
    import localization from '@common/source/js/vue/mixins/localization';
    import getDevice from '../../../utils/get-device';

    export default {
        name: 'MAreaSelect',
        mixins: [ localization ],
        props: {
            id: {
                type: String,
                default: 'district'
            },
            inputType: {
                type: String,
                default: 'text'
            },
            name: {
                type: String,
                default: 'district'
            },
            placeholder: {
                type: String,
                default: ''
            },
            useInVueComponent: {
                type: Boolean,
                default: false
            },
            addressId: {
                type: [String, Number],
                default: 0
            },
            isFieldError: {
                type: Boolean,
                default: false
            },
            saveCity: {
                type: String,
                default: ''
            },
            saveCityId: {
                type: String,
                default: ''
            },
            saveProvince: {
                type: String,
                default: ''
            },
            saveProvinceId: {
                type: String,
                default: ''
            },
            saveRegion: {
                type: String,
                default: ''
            },
            saveRegionId: {
                type: String,
                default: ''
            },
            validationAlert: {
                type: String,
                default: ''
            },
            validationRequired: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                city: null,
                cityId: null,
                cityList: [],
                district: '',
                province: null,
                provinceId: null,
                provinceList: [],
                region: null,
                regionId: null,
                regionList: [],
                showOption: false,
                showError: false,
                topOffsetCity: 0,
                topOffsetProvince: 0,
                topOffsetRegion: 0,
                activeIndexP: 0,
                activeIndexC: 0,
                activeIndexR: 0,
                beijing: [
                    {
                        'id': '110000',
                        'name': '北京',
                        'fullname': '北京市',
                        'pinyin': [
                            'bei',
                            'jing'
                        ],
                        'location': {
                            'lat': 39.90469,
                            'lng': 116.40717
                        },
                        'cidx': [
                            0,
                            15
                        ]
                    }
                ],
                tianjin: [
                    {
                        'id': '120000',
                        'name': '天津',
                        'fullname': '天津市',
                        'pinyin': [
                            'tian',
                            'jin'
                        ],
                        'location': {
                            'lat': 39.0851,
                            'lng': 117.19937
                        },
                        'cidx': [
                            16,
                            31
                        ]
                    }
                ],
                chongqin: [
                    {
                        'id': '500000',
                        'name': '重庆',
                        'fullname': '重庆市',
                        'pinyin': [
                            'chong',
                            'qing'
                        ],
                        'location': {
                            'lat': 29.56471,
                            'lng': 106.55073
                        },
                        'cidx': [
                            297,
                            334
                        ]
                    }
                ],
                shanghai: [
                    {
                        'id': '310000',
                        'name': '上海',
                        'fullname': '上海市',
                        'pinyin': [
                            'shang',
                            'hai'
                        ],
                        'location': {
                            'lat': 31.23037,
                            'lng': 121.4737
                        },
                        'cidx': [
                            102,
                            117
                        ]
                    }
                ],
                pattern: '[\u4e00-\u9fa5]+[,]{1,}[\u4e00-\u9fa5]+[,]{1,}[\u4e00-\u9fa5]+',
                isTouch: false
            };
        },
        computed: {
            ...mapState('shippingAddress', ['areaInfo']),
            isEditing() {
                const addressIdStr = String(this.addressId);
                return addressIdStr && addressIdStr !== '0';
            },
            addressInvalidFormatDescription() {
                return this.useInVueComponent
                    ? this.getLocalizationProp('Labels.ShippingSection.AddressInvalidFormatDescription')
                    : this.getLocalizationProp('Labels.AddressInvalidFormatDescription');
            },
            continueEdit() {
                return this.useInVueComponent
                    ? this.getLocalizationProp('Labels.ShippingSection.ContinueEdit')
                    : this.getLocalizationProp('Labels.ContinueEdit');
            }
        },
        watch: {
            region(newVal) {
                this.$nextTick(() => {
                    this.$refs.district.blur();
                });
                this.$emit('update:save-region', newVal);
            },
            showOption(newVal) {
                if(newVal === false) {
                    this.verifyDistrict();
                    this.$nextTick(() => {
                        this.$refs.district.focus();
                        this.$refs.district.blur();
                    });
                }
            },
            province(val) {
                this.$emit('update:save-province', val);
            },
            city(val) {
                this.$emit('update:save-city', val);
            },
            isEditing: {
                handler() {
                    this.initData();
                },
                immediate: true
            }
        },
        mounted() {
            this.setProhibit();
        },
        methods: {
            ...mapMutations('shippingAddress', ['SET_AREA_INFO']),
            async initData() {
                // only edit need init data
                if(!this.isEditing) return;

                this.province = this.saveProvince;
                this.city = this.saveCity;
                this.region = this.saveRegion;
                this.district = ((this.province !== null && this.province !== '') ? this.province : '') + ((this.city !== null && this.city !== '') ? (',' + this.city) : '') + ((this.region !== null && this.region !== '') ? (',' + this.region) : '');

                if(this.useInVueComponent) {
                    const resData = await this.getAreaIdVirAreaName({
                        province: this.province,
                        city: this.city,
                        suburb: this.region
                    });
                    this.provinceId = resData.ProvinceId;
                    this.cityId = resData.CityId;
                    this.regionId = resData.SuburbId;
                } else {
                    this.provinceId = this.saveProvinceId;
                    this.cityId = this.saveCityId;
                    this.regionId = this.saveRegionId;
                }

                if(this.provinceId !== null && this.provinceId !== '') {
                    this.getDistrict();
                }
                if(this.cityId !== null && this.cityId !== '') {
                    this.getDistrict(this.provinceId, 'c');
                }
                if(this.regionId !== null && this.regionId !== '') {
                    this.getDistrict(this.cityId, 'r');
                }

                this.$nextTick(() => {
                    if(this.district !== null && this.district !== '') {
                        if(!(new RegExp(/^[\u4e00-\u9fa5]+[,]{1,}[\u4e00-\u9fa5]+[,]{1,}[\u4e00-\u9fa5]+$/).test(this.district))) {
                            this.$modal.show({id: 'address-invalid-format-description'});
                            this.$nextTick(() => {
                                this.$refs['district'].focus();
                            });
                        }
                    }
                });
            },
            async getAreaIdVirAreaName(params) {
                const response = await adCodesApi.query(params);
                if(response.success && response.data.Success) {
                    return response.data.Data;
                }
            },
            async getProhibitFromApi() {
                const response = await prohibitAreaApi.query();
                if(response.success && response.data.Success) {
                    return response.data.Data;
                }
            },
            async setProhibit() {
                if(this.areaInfo) {
                    return;
                }

                let prohibit, prohibitErrorMessage;
                if(this.useInVueComponent) {
                    const resData = await this.getProhibitFromApi();
                    prohibit = resData.ProhibitArea || [];
                    prohibitErrorMessage = resData.ErrorMessage || '';
                } else {
                    prohibit = this.getLocalizationProp('Data.Prohibit', []);
                    prohibitErrorMessage = this.getLocalizationProp('Labels.ErrorMessage');
                }
                this.SET_AREA_INFO({
                    prohibit,
                    prohibitErrorMessage
                });
            },
            closeModal: function(id) {
                this.$modal.hide({id: id});
            },
            getCurrentDevice() {
                return getDevice();
            },
            isOptionShow() {
                if(this.showOption === false) {
                    this.showOption = true;
                    this.getDistrict();
                    this.$nextTick(() => {
                        if(document.getElementById('activeProvince')) {
                            document.getElementById('Province').scroll(0, document.getElementById('activeProvince').offsetTop - 100);
                        }
                        if(document.getElementById('activeCity')) {
                            document.getElementById('City').scroll(0, document.getElementById('activeCity').offsetTop - 100);
                        }
                        if(document.getElementById('activeRegion')) {
                            document.getElementById('Region').scroll(0, document.getElementById('activeRegion').offsetTop - 100);
                        }
                    });
                } else {
                    this.showOption = false;
                }
            },
            async getDistrict(id, type) {
                let response;
                if(id) {
                    response = await districtChildrenApi.query({
                        id: id
                    });
                } else {
                    response = await districtApi.query();
                }
                if(response.success && response.data.Success) {
                    if(id) {
                        if(type === 'c' && id === '110000') {
                            this.cityList = this.beijing;
                        } else if(type === 'c' && id === '310000') {
                            this.cityList = this.shanghai;
                        } else if(type === 'c' && id === '500000') {
                            this.cityList = this.chongqin;
                        } else if(type === 'c' && id === '120000') {
                            this.cityList = this.tianjin;
                        } else {
                            if(type === 'c') {
                                this.cityList = response.data.Data.result[0];
                            } else {
                                this.regionList = response.data.Data.result[0];
                            }
                        }
                        if(type === 'c' && (this.getCurrentDevice() === 'mobile') && !this.cityId) {
                            this.cityActive(this.cityList[0].id, this.cityList[0].fullname);
                        }
                        if(type === 'r' && (this.getCurrentDevice() === 'mobile') && !this.regionId) {
                            this.regionActive(this.regionList[0].id, this.regionList[0].fullname);
                        }
                    } else {
                        this.provinceList = response.data.Data.result[0];
                    }
                }
            },
            provActive(pid, pname, index) {
                this.provinceId = pid;
                this.province = pname;
                this.cityId = '';
                this.city = '';
                this.regionId = '';
                this.region = '';
                this.district = this.province;
                this.cityList = [];
                this.regionList = [];
                this.getDistrict(pid, 'c');
                if(this.getCurrentDevice() === 'mobile' && index) {
                    document.getElementById('Province').scroll({top: (index * 50), left: 0, behavior: 'smooth'});
                }
            },
            cityActive(cid, cname, index) {
                this.cityId = cid;
                this.city = cname;
                this.district = this.province + ',' + this.city;
                this.regionId = '';
                this.region = '';
                this.regionList = [];
                this.getDistrict(cid, 'r');
                if(this.getCurrentDevice() === 'mobile' && index) {
                    document.getElementById('City').scroll({top: (index * 50), left: 0, behavior: 'smooth'});
                }
            },
            regionActive(rid, rname, index) {
                this.regionId = rid;
                this.region = rname;
                this.district = this.province + ',' + this.city + ',' + this.region;
                if(this.getCurrentDevice() === 'desktop') {
                    this.showOption = false;
                    this.$refs.district.focus();
                } else {
                    this.$refs.district.focus();
                    if(this.getCurrentDevice() === 'mobile' && index) {
                        document.getElementById('Region').scroll({top: (index * 50), left: 0, behavior: 'smooth'});
                    }
                }
            },
            verifyDistrict() {
                const provinceName = this.province;
                const cityName = this.city;
                const regionName = this.region;

                if(provinceName !== null && provinceName !== '') {
                    const isProhibitProvince = this.areaInfo.prohibit.some((item, i) => {
                        return (item.StateProvinceShortName === provinceName || item.StateProvinceName === provinceName) && item.ProhibitCityList[0].CityName === null;
                    });
                    this.showError = isProhibitProvince;
                }
                if(!this.showError && ((cityName !== null && cityName !== '') || (regionName !== null && regionName !== ''))) {
                    const currentProvince = this.areaInfo.prohibit.filter((pro, i) => {
                        return pro.StateProvinceShortName === provinceName || pro.StateProvinceName === provinceName;
                    });
                    if(currentProvince.length > 0 && currentProvince[0].ProhibitCityList !== undefined && currentProvince[0].ProhibitCityList.length > 0) {
                        const isProhibitCity = currentProvince[0].ProhibitCityList.some((item, i) => {
                            return item.CityName === cityName || item.CityName === regionName;
                        });
                        this.showError = isProhibitCity;
                    }
                }
            },
            touchMove(e) {
                const moveX = e.touches[0].clientX;
                const moveY = e.touches[0].clientY;
                if(moveX || moveY) {
                    this.isTouch = true;
                }
            },
            touchEnd(type, e) {
                if(type === 'prov') {
                    if(this.isTouch) {
                        const sct = document.getElementById('Province').scrollTop;
                        this.activeIndexP = Math.round(sct / 50);
                    } else {
                        this.activeIndexP = e.target.dataset.index;
                    }
                    document.getElementById('Province').scroll({top: (this.activeIndexP * 50), left: 0, behavior: 'smooth'});
                    this.provActive(this.provinceList[this.activeIndexP].id, this.provinceList[this.activeIndexP].fullname);
                }
                if(type === 'city') {
                    if(this.isTouch) {
                        const sct = document.getElementById('City').scrollTop;
                        this.activeIndexC = Math.round(sct / 50);
                    } else {
                        this.activeIndexC = e.target.dataset.index;
                    }
                    document.getElementById('City').scroll({top: (this.activeIndexC * 50), left: 0, behavior: 'smooth'});
                    this.cityActive(this.cityList[this.activeIndexC].id, this.cityList[this.activeIndexC].fullname);
                }
                if(type === 'region') {
                    if(this.isTouch) {
                        const sct = document.getElementById('Region').scrollTop;
                        this.activeIndexR = Math.round(sct / 50);
                    } else {
                        this.activeIndexR = e.target.dataset.index;
                    }
                    document.getElementById('Region').scroll({top: (this.activeIndexR * 50), left: 0, behavior: 'smooth'});
                    this.regionActive(this.regionList[this.activeIndexR].id, this.regionList[this.activeIndexR].fullname);
                }
                this.isTouch = false;
            }
        }
    };
</script>
