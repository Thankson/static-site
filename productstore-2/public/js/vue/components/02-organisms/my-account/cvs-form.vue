<template>
    <div class="o-cvsForm">
        <form
            id="cvs-form-vue"
            class="o-addressForm"
            @submit.prevent="checkSave($event)"
            @submit.enter.prevent
            @keyup.enter.prevent
            @keydown.enter.prevent>
            <h4 class="o-cvsForm__title -cvs pb-5 lg:pb-20 lg:text-lg lg:pr-20">{{ getLocalizationProp('Labels.Hint') }}</h4>
            <div class="w-full flex flex-col lg:flex-row lg:w-1_2 lg:pr-20">
                <div class="w-full flex flex-col lg:flex-row">
                    <!-- Name -->
                    <div class="o-addressForm__field -cvs lg:w-1_2 lg:pr-12">
                        <label
                            class="m-formField__label"
                            for="pickupName"
                            v-html="getLocalizationProp('Labels.PickupName')"
                        >
                        </label>
                        <input-basic
                            id="pickupName"
                            vmodel="pickupNameData"
                            name="pickupName"
                            :class="{ '-isInvalid': pickupNameDataError }"
                            :placeholder="getLocalizationProp('Labels.PickupNamePlaceholder')"
                            :value="pickupNameData"
                            aria-describedby="pickupNameErrorMsg"
                            @composition-end="setInput"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            id="pickupNameErrorMsg"
                            :is-visible="pickupNameDataError"
                            :msg="pickupNameDataErrorMsg"
                        />

                    </div>
                    <!-- Phone Number -->
                    <div
                        class="o-addressForm__field -cvs lg:w-1_2"
                    >
                        <label
                            class="m-formField__label"
                            for="mobileNumber"
                            v-html="getLocalizationProp('Labels.MobileNumber')"
                        >
                        </label>
                        <input-basic
                            id="mobileNumber"
                            name="mobileNumber"
                            vmodel="mobileNumberData"
                            :value="mobileNumberData"
                            :placeholder="getLocalizationProp('Labels.MobileNumberPlaceholder')"
                            :class="{ '-isInvalid': mobileNumberDataError }"
                            aria-describedby="mobileNumberErrorMsg"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            v-if="mobileNumberDataError"
                            id="mobileNumberErrorMsg"
                            :is-visible="mobileNumberDataError"
                            :msg="mobileNumberDataErrorMsg"
                        />
                    </div>
                </div>

            </div>
            <!-- Cvs channel select -->
            <div class="m-formField">
                <label
                    class="m-formField__label lg:mt-10 lg:text-base"
                    v-html="getLocalizationProp('Labels.Channel')">
                </label>
                <div v-show="!showCvsAddress">
                    <div
                        v-for="(address, index) in cvsChannel"
                        :key="uniqid(index)"
                        class="block w-5_6">
                        <m-radio
                            v-model="radioSelectedIndex"
                            name="cvsAddress"
                            :input-value="index"
                            mods="w-auto flex-1">
                            <span class="text-md lg:text-xl" v-html="address.CarrierDisplayName" />
                        </m-radio>
                    </div>
                    <div class="w-full lg:mt-20">
                        <a
                            :href="cvsLink"
                            :target="getLocalizationProp('Data.SelectCVSLink.Target')"
                            class="text-sm font-medium my-30 text-green underline inline-block"
                        >
                            {{ getLocalizationProp('Labels.SelectPickupStore') }}
                        </a>
                        <FormFieldErrorMessage
                            id="selectPickupStoreErrorMsg"
                            :is-visible="selectPickupStoreDataError"
                            :msg="selectPickupStoreDataErrorMsg"
                        />
                    </div>
                </div>
                <!-- Cvs address and reset -->
                <div v-show="showCvsAddress" class="w-full">
                    <input
                        id="storeCode"
                        type="hidden"
                        :value="selectPickupStoreData"
                        name="storeCode" />
                    <div v-html="cvsAddressFormat"></div>
                    <button class="text-green text-base underline my-30 lg:my-50" @click.prevent="showAddresses">{{ getLocalizationProp('Labels.SelectAgain') }}</button>
                </div>
            </div>

            <div class="w-full flex pt-30 pb-5 justify-between xs:justify-start">
                <!-- Cancel -->
                <div class="text-center w-1_2 mr-10 xs:mr-30 xs:w-auto">
                    <button class="a-authorBtn -default bg-white rounded px-10 lg:px-50 w-full" @click.stop.prevent="previousPage">
                        {{ getLocalizationProp('Labels.Cancel') }}
                    </button>
                </div>
                <!-- Next/Continue -->
                <div class="text-center w-1_2 xs:w-auto">
                    <button class="o-addressForm__button -save" type="submit" data-testid="button-addNewAddressSaveBtn">
                        {{ getLocalizationProp('Labels.Confirm') }}
                    </button>
                </div>
            </div>
            <div data-loading="address__loading" class="w-40">
                <a-loading-spinner :visible="isLoadingSubmitForm" />
            </div>

            <ul v-if="listError.length" class="e-formError__list">
                <li
                    v-for="(msg, index) in listError"
                    :key="uniqid(index)"
                    class="e-formError__item">
                    {{ msg.Translation }}
                </li>
            </ul>
        </form>
    </div>
</template>

<script>
    import addApi from '@api/routes/customeraccount/addconveniencestore';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import { validationMixin } from 'vuelidate';
    import { maxLength, required } from 'vuelidate/lib/validators';
    import uniqid from 'uniqid';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import getDevice from '@productstore/source/js/vue/utils/get-device.js';
    import {postCvsMessage, cvsInfo} from '@productstore/source/js/vue/utils/channel-types';
    export default {
        name: 'OCvsForm',
        components: {
            FormFieldErrorMessage
        },
        validations() {
            return {
                pickupNameData: {
                    required,
                    maxLength: this.determineLengthValidation(formHelper.maxChar.tw.name)
                },
                mobileNumberData: {
                    required,
                    invalid: (value) => formHelper.isValidPhoneNumber(value, 'tw')
                },
                selectPickupStoreData: {
                    required
                }
            };
        },
        mixins: [ localizationMixin, validationMixin ],

        data() {
            return {
                bc: null,
                cvsType: '',
                cvsLink: '',
                isLoadingSubmitForm: false,
                listError: [],
                mobileNumberData: '',
                mobileNumberDataError: '',
                mobileNumberDataErrorMsg: '',
                pickupNameData: '',
                pickupNameDataError: '',
                pickupNameDataErrorMsg: '',
                radioSelectedIndex: '',
                showCvsAddress: false,
                selectPickupStoreData: '',
                selectPickupStoreDataError: '',
                selectPickupStoreDataErrorMsg: '',
                selectPickupStoreErrorMsg: '',
                storeAddress: '',
                storeName: ''
            };
        },
        computed: {
            carrierName() {
                return this.cvsChannel[this.radioSelectedIndex].CarrierName;
            },
            cvsAddressFormat() {
                return this.selectPickupStoreData
                    ? `<div class="text-sm text-gray-150 lg:text-lg">
                            <div class="font-bold">${this.cvsType} ${this.storeName}</div>
                            <div>${this.storeAddress}</div>
                        </div>`
                    : '';
            },
            cvsChannel() {
                return this.getLocalizationProp('Data.CVSChannels', []);
            },
            isMobile() {
                return getDevice() === 'mobile';
            },
            validateMaxCharLength() {
                return this.getLocalizationProp('Data.ValidateMaxCharLength', false);
            },
            radioDefaultSelectedIndex() {
                return this.cvsChannel.findIndex(item => item.IsDefault === true) || 0;
            }
        },
        watch: {
            $v: {
                deep: true,
                handler() {
                    const allValidatedFields = this.$v.$params;
                    for (let key of Object.keys(allValidatedFields)) {
                        if(this.$v[key]) this[`${key}Error`] = this.$v[key].$error;

                        if(this[`${key}Error`]) {
                            let errorMsg;

                            if(this.$v[key].maxLength === false) {
                                const userInputDataLength = this[key] ? this[key].length : 0;
                                const inputDataMaxLength =
                                    this.$v[key].$params?.maxLength?.max ?? '';
                                errorMsg = this.getLocalizationProp(
                                    'Labels.MaxCharacterLengthExceedError'
                                ).replace('{0}', inputDataMaxLength)
                                    .replace('{1}', userInputDataLength - inputDataMaxLength);
                            } else if(this.$v[key].required === false) {
                                const fieldName = key.replace('Data', '');
                                const fieldNameCapitalized =
                                    fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                                errorMsg = this.getLocalizationProp(
                                    `Labels.${fieldNameCapitalized}Required`,
                                    'Required'
                                );
                            } else if(this.$v['mobileNumberData'].$error) {
                                errorMsg = this.getLocalizationProp('Labels.MobileNumberInvalidError');
                            }

                            this[`${key}ErrorMsg`] = errorMsg;
                        }
                    }
                }
            },
            radioSelectedIndex(val) {
                this.cvsLink = `${this.getLocalizationProp('Data.SelectCVSLink.Url')}?cvsType=${this.cvsChannel[val].CarrierName}&isMobile=${this.isMobile}`;
            }
        },
        mounted() {
            this.radioSelectedIndex = this.radioDefaultSelectedIndex;
            this.getCvsInfo();
            this.$once('hook:beforeDestroy', () => {
                if(this.bc) {
                    this.bc.close();
                    this.bc = null;
                }
            });
        },
        methods: {
            replaceTokenArray,
            addressApiRequest() {
                return {
                    'StoreCode': this.selectPickupStoreData,
                    'Carrier': this.carrierName,
                    'ShipToName': this.pickupNameData,
                    'ShipToPhoneNumber': this.mobileNumberData,
                    'UsageDate': new Date().toISOString()
                };
            },
            async checkSave(evt) {
                this.$v.$touch();
                if(!this.$v.$invalid) {
                    this.listError = [];
                    this.isLoadingSubmitForm = true;
                    const response = await addApi.post(this.addressApiRequest());
                    if(response.success && response.data.Success) {
                        if(response?.data?.Data) {
                            if(document.referrer) {
                                window.location.href = document.referrer;
                            }
                        }
                        this.isLoadingSubmitForm = false;
                    } else {
                        this.isLoadingSubmitForm = false;
                        this.listApiErrors(response);
                    }
                }
            },
            determineLengthValidation(maxCharLimit) {
                return this.validateMaxCharLength && maxLength(maxCharLimit);
            },
            getCvsInfo() {
                this.bc = new BroadcastChannel(postCvsMessage);
                this.bc.addEventListener('message', (e) => {
                    const payload = e.data;
                    if(payload.type === `${cvsInfo}-${this.carrierName.toLowerCase()}`) {
                        this.cvsType = payload.data.cvsType;
                        this.storeAddress = payload.data.storeAddress;
                        this.storeName = payload.data.storeName;
                        this.selectPickupStoreData = payload.data.storeCode;
                        this.showCvsAddress = true;
                    } else {
                        this.selectPickupStoreData = '';
                        this.cvsAddressFormat = '';
                        this.showCvsAddress = false;
                    }
                });
            },
            listApiErrors(response) {
                if(response?.data?.ErrorMessages) this.listError = response?.data?.ErrorMessages;
            },
            previousPage() {
                history.go(-1);
            },
            setInput(val) {
                const id = val.target?.id;
                const model = val.model;
                if(id) this[`${id}Data`] = val.target?.value;
                if(model) {
                    const chosenProp = model.replace('Data', '');
                    this[model] = (val.value === this[chosenProp][0]) ? '' : val.value;
                }
            },
            showAddresses() {
                this.showCvsAddress = false;
            },
            uniqid(id) {
                return `${id}-${uniqid()}`;
            }
        }
    };
</script>
