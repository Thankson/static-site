<template>
    <div class="o-checkVirtual">
        <a-loading-spinner class="ml-40" :visible="loading" />

        <div v-if="!loading" class="o-checkVirtual__row">
            <ul class="o-checkVirtual__list">
                <li class="w-full">
                    <div class="o-checkVirtual__item">
                        <label
                            class="o-checkVirtual__label"
                            :for="bankId">

                            {{ bankLabel }}
                        </label>

                        <v-select
                            :id="bankId"
                            ref="selectedBank"
                            :class="{ '-error': $v.$dirty && $v.selectedBank.$invalid }"
                            :options="bankText"
                            :values="bankValues"
                            :initial="null"
                            :is-disabled="true"
                            :is-required="true"
                            :aria-invalid="$v.$dirty && $v.selectedBank.$invalid"
                            :aria-describedby="$v.$dirty && $v.selectedBank.$invalid ? bankErrorId : null"
                            @change="({ value }) => selectedBank = value"
                        />
                    </div>

                    <span
                        v-if="$v.$dirty && $v.selectedBank.$invalid"
                        :id="bankErrorId"
                        class="o-checkVirtual__error">

                        {{ bankErrorLabel }}
                    </span>
                </li>

                <li class="w-full">
                    <div class="o-checkVirtual__item">
                        <label
                            class="o-checkVirtual__label"
                            :for="receiptId">

                            {{ receiptLabel }}
                        </label>

                        <v-select
                            :id="receiptId"
                            ref="selectedReceipt"
                            :class="{ '-error': $v.$dirty && $v.selectedReceipt.$invalid }"
                            :options="receiptText"
                            :values="receiptValues"
                            :initial="receiptValues[0]"
                            :is-required="true"
                            :aria-invalid="$v.$dirty && $v.selectedReceipt.$invalid"
                            :aria-describedby="$v.$dirty && $v.selectedReceipt.$invalid ? bankErrorId : null"
                            @change="({ value }) => selectedReceipt = value"
                        />
                    </div>

                    <span
                        v-if="$v.$dirty && $v.selectedReceipt.$invalid"
                        :id="receiptErrorId"
                        class="o-checkVirtual__error">

                        {{ receiptErrorLabel }}
                    </span>
                </li>

                <li v-if="showBusinessNumber" class="w-full">
                    <div class="o-checkVirtual__item -overflow">
                        <label
                            class="o-checkVirtual__label -overflow"
                            :for="businessNumberId">

                            {{ businessNumberLabel }}
                        </label>

                        <div class="o-checkVirtual__input">
                            <input
                                :id="businessNumberId"
                                ref="businessNumber"
                                v-model="businessNumber"
                                name="BusinessRegistrationNumber"
                                type="text"
                                class="a-input py-6"
                                :class="{ '-isInvalid': $v.$dirty && $v.businessNumber.$invalid }"
                                aria-required="true"
                                :aria-invalid="$v.$dirty && $v.businessNumber.$invalid ? true : null"
                                :aria-describedby="$v.$dirty && $v.businessNumber.$invalid ? businessNumberErrorId : null"
                            />
                            <span
                                v-if="$v.$dirty && $v.businessNumber.$invalid"
                                :id="businessNumberErrorId"
                                class="o-checkVirtual__error">
                                {{ businessNumberErrorLabel }}
                            </span>
                        </div>
                    </div>

                </li>

                <li v-if="showMobileNumber" class="w-full">
                    <div class="o-checkVirtual__item">
                        <label
                            class="o-checkVirtual__label"
                            :for="mobileNumberId">

                            {{ mobileNumberLabel }}
                        </label>

                        <div class="o-checkVirtual__input">
                            <input
                                :id="mobileNumberId"
                                ref="mobileNumber"
                                v-model="mobileNumber"
                                name="MobileNumber"
                                type="text"
                                class="a-input py-6"
                                :class="{ '-isInvalid': $v.$dirty && $v.mobileNumber.$invalid }"
                                aria-required="true"
                                :aria-invalid="$v.$dirty && $v.mobileNumber.$invalid ? true : null"
                                :aria-describedby="$v.$dirty && $v.mobileNumber.$invalid ? mobileNumberErrorId : null"
                            />
                        </div>
                    </div>

                    <span
                        v-if="$v.$dirty && $v.mobileNumber.$invalid"
                        :id="mobileNumberErrorId"
                        class="o-checkVirtual__error">

                        {{ mobileNumberErrorLabel }}
                    </span>
                </li>

                <li v-if="noticeLabel" class="w-full">
                    <div class="o-checkVirtual__item -bottom">
                        <p class="o-checkVirtual__notice">
                            *
                            <span class="-mt-2 ml-5" v-html="noticeLabel" />
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import apiGetBanks from '@api/routes/customeraccount/paymethods/banks';
    import { validationMixin } from 'vuelidate';
    import { required, minLength, maxLength } from 'vuelidate/lib/validators';
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'OCheckoutVirtualPayment',
        mixins: [ safeId, validationMixin ],
        safeIds: [
            'bankId',
            'bankErrorId',
            'businessNumberId',
            'businessNumberErrorId',
            'mobileNumberId',
            'mobileNumberErrorId',
            'receiptId',
            'receiptErrorId'
        ],
        validations() {
            const businessNumberValidation = {
                businessNumber: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(10)
                }
            };

            const mobileNumberValidation = {
                mobileNumber: {
                    required,
                    minLength: minLength(11),
                    maxLength: maxLength(16)
                }
            };

            return {
                selectedBank: { required },
                selectedReceipt: { required },
                ...(this.showBusinessNumber && businessNumberValidation),
                ...(this.showMobileNumber && mobileNumberValidation)
            };
        },
        props: {
            bankErrorLabel: {
                type: String,
                default: 'Please select a bank.'
            },
            bankLabel: {
                type: String,
                default: 'Bank Choice'
            },
            bankPlaceholder: {
                type: String,
                default: 'Select Bank'
            },
            businessNumberErrorLabel: {
                type: String,
                default: 'Please enter a valid business registration number.'
            },
            businessNumberLabel: {
                type: String,
                default: 'Business Registration Number'
            },
            mobileNumberErrorLabel: {
                type: String,
                default: 'Please enter a valid mobile number.'
            },
            mobileNumberLabel: {
                type: String,
                default: 'Mobile Number'
            },
            mobileNumberValue: {
                type: String,
                default: ''
            },
            noticeLabel: {
                type: String,
                default: ''
            },
            receiptErrorLabel: {
                type: String,
                default: 'Please select a receipt.'
            },
            receiptLabel: {
                type: String,
                default: 'Cash Receipt'
            },
            /**
             * @typedef {Object} ReceiptOption
             * @property {string} text
             * @property {string} value
             *
             * @typedef {Array<ReceiptOption>} ReceiptOptions
             */
            /** @type {ReceiptOptions} */
            receiptOptions: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                bankText: {},
                bankValues: {},
                bankOptions: [],
                businessNumber: '',
                mobileNumber: '',
                receiptValues: {},
                receiptText: {},
                loading: true,
                selectedBank: '',
                selectedReceipt: '',

                // dynamic ids
                bankId: '',
                bankErrorId: '',
                businessNumberId: '',
                businessNumberErrorId: '',
                mobileNumberId: '',
                mobileNumberErrorId: '',
                receiptId: '',
                receiptErrorId: ''
            };
        },
        computed: {
            referenceNumber() {
                switch (true) {
                    case this.showBusinessNumber:
                        return this.businessNumber;
                    case this.showMobileNumber:
                        return this.mobileNumber;
                    default:
                        return null;
                }
            },
            showBusinessNumber() {
                return this.selectedReceipt === 'Business';
            },
            showMobileNumber() {
                return this.selectedReceipt === 'Personal';
            }
        },
        watch: {
            bankOptions() {
                this.prepareBankData();
            },
            mobileNumberValue() {
                this.mobileNumber = this.mobileNumberValue;
            },
            receiptOptions() {
                this.prepareReceiptData();
            },
            referenceNumber() {
                this.emitUpdate();
            },
            selectedBank() {
                this.emitUpdate();
            },
            selectedReceipt() {
                this.emitUpdate();
            }
        },
        created() {
            this.$on('show-error', this.showError);

            this.getBankNames();
        },
        mounted() {
            this.mobileNumber = this.mobileNumberValue;
            this.prepareReceiptData();
        },
        methods: {
            emitUpdate() {
                this.$emit('update', {
                    bank: this.selectedBank,
                    hasError: this.$v.$invalid,
                    receipt: this.selectedReceipt,
                    referenceNumber: this.referenceNumber
                });
            },
            async getBankNames() {
                const response = await apiGetBanks.query({
                    country: this.$env.Country
                });

                if(response.success && response.data?.Success) {
                    const bankOptions = response.data?.Data || [];
                    this.bankOptions = bankOptions.filter((bank) => bank.IsVirtualAccountInstitution);
                }
            },
            prepareReceiptData() {
                this.receiptText = this.receiptOptions.map((option) => option.text);
                this.receiptValues = this.receiptOptions.map((option) => option.value);
            },
            prepareBankData() {
                this.bankText = [
                    this.bankPlaceholder,
                    ...this.bankOptions.map((option) => option.Name)
                ];

                this.bankValues = [
                    null,
                    ...this.bankOptions.map((option) => option.Id)
                ];

                this.loading = false;
            },
            showError() {
                this.$v.$touch();

                // order of required fields in DOM
                const requiredFields = [
                    'selectedBank',
                    'selectedReceipt',
                    'businessNumber',
                    'mobileNumber'
                ];

                // focus on topmost field that's invalid
                for (const field of requiredFields) {
                    if(this.$v[field] && this.$v[field].$invalid && this.$refs[field]) {
                        const el = this.$refs[field];
                        if(el.nodeType === Node.ELEMENT_NODE || el._isVue) {
                            el.focus();
                            break;
                        }
                    }
                }
            }
        }
    };
</script>
