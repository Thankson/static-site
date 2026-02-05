<template>
    <form class="p-imea py-20 text-dark">
        <fieldset class="border-1 border-gray-50 pt-20 px-10 md:px-40 mb-20 bg-white">
            <slot name="section-one" />
        </fieldset>
        <fieldset class="border-1 border-gray-50 pt-20 px-10 md:px-40 mb-20 bg-white">
            <slot name="section-two" />
        </fieldset>

        <fieldset class="border-1 border-gray-50 pt-20 px-10 md:px-40 bg-white">
            <!-- Sign Digitally section -->
            <OImeaDigitalSignSection
                :customer-name="customerName"
                :labels="labels"
                :spouse-name="spouseName"
                :script-id="scriptId"
            />
            <v-button
                :aria-label="labels.Submit"
                :cta="labels.Submit"
                class="-medium mr-10 my-20"
                @click="submit"
            />
            <span>
                <a-loading-spinner
                    class="inline-block -m-0"
                    size="sm"
                    :visible="isLoading"
                />
            </span>
        </fieldset>
        <div class="mt-20 italic">
            <p v-html="labels.IndicatesRequiredFields"></p>
        </div>
        <!-- Submit-Failed Modal -->
        <modal id="submit-failed" heading-class="font-bold text-2xl leading-initial">
            <template v-slot:heading>
                <span v-html="labels.ModalSubmitFailed.Title"></span>
            </template>

            <template v-slot:body>
                <p
                    class="text-gray-120"
                    v-html="labels.ModalSubmitFailed.Text"
                ></p>
            </template>

            <template v-slot:footer>
                <v-button
                    class="-green block mb-15 px-24 py-13 text-left text-base"
                    @click="$modal.hide()"
                >
                    {{ labels.ModalSubmitFailed.Ok }}
                </v-button>
            </template>
        </modal>
    </form>
</template>

<script>
    import { mapActions } from 'vuex';
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import OImeaDigitalSignSection from '../../02-organisms/imea/imea-digital-sign-section.vue';
    import submitIMEAData from '@api/routes/customer/submitIMEAData';

    export default {
        name: 'PImea',
        components: {
            OImeaDigitalSignSection
        },
        mixins: [localizationMixin],
        data() {
            return {
                awaitingMxAddressValidationResult: false,
                customerName: '',
                imeaFormData: {},
                isMxAddressValidationPending: false, // MX address entry enhancement
                isExperianModalVisible: false,
                isLoading: false,
                isValid: true,
                servicesPayload: null,
                spouseName: ''
            };
        },
        computed: {
            data() {
                return this.localization.Data || {};
            },
            isAu() {
                return this.$env?.Country === 'Australia' || false;
            },
            isMx() {
                return this.$env?.Country === 'Mexico' || false;
            },
            isNz() {
                return this.$env?.Country === 'NewZealand' || false;
            },
            isPl() {
                return this.$env?.Country === 'Poland' || false;
            },
            labels() {
                return this.localization.Labels || {};
            }
        },
        created() {
            eventBus.$on('getInput', (childInputValues, isValid) => {
                if(!isValid) this.isValid = false;
                this.imeaFormData = { ...this.imeaFormData, ...childInputValues };
            });
            eventBus.$on('getCommissionDepositData', (data) => {
                this.servicesPayload = data;
            });
            eventBus.$on('setIsExperianModalVisible', (val) => {
                this.isExperianModalVisible = val;
            });
            eventBus.$on('setIsMxAddressValidationPending', (val) => {
                this.isMxAddressValidationPending = val;
                if(val === false && this.awaitingMxAddressValidationResult) {
                    this.awaitingMxAddressValidationResult = false; // wait until isMxAddressValidationPending has updated emitted value
                    if(!this.isLoading) this.submitIMEAData();
                }
            });
            eventBus.$on('updateFullName', (isSelfForm, fullName) => {
                // Update customer's or spouse's full name on digital sign section
                if(isSelfForm && fullName) this.customerName = fullName;
                else this.spouseName = fullName;
            });
        },
        beforeDestroy() {
            eventBus.$off('getInput');
            eventBus.$off('getCommissionDepositData');
            eventBus.$off('setIsExperianModalVisible');
            eventBus.$off('updateFullName');
            eventBus.$off('setIsMxAddressValidationPending');
        },
        methods: {
            ...mapActions('paymentMethod', ['savePayMethod']),
            handleSubmitError() {
                this.isLoading = false;
                console.log('error in saving data');
                this.$modal.show({ id: 'submit-failed' });
            },
            async postToBackendAndRedirect() {
                // Removed BSB, AccountNumber and NameOnBankAccount fields from being sent to BE
                const { BSB, AccountNumber, NameOnBankAccount, ...cleanedFormData } = this.imeaFormData;

                const response = await submitIMEAData.post(cleanedFormData);
                if(response?.success && response?.data?.Success) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'IMEA Form',
                        eA: 'CTA',
                        eL: this.labels?.Submit
                    });
                    this.isLoading = false;
                    window.location.href = this.data?.RedirectUrl;
                } else {
                    this.handleSubmitError();
                }
            },
            submit() {
                eventBus.$emit('validate');
                this.$nextTick(() => {
                    if(this.isValid) {
                        if(this.isMxAddressValidationPending) {
                            // Mx address entry enhancement
                            // Set the awaiting flag and abort here. We resume automatically
                            // when the child form emits setIsMxAddressValidationPending(false)
                            this.awaitingMxAddressValidation = true;
                            return;
                        }
                        if(!this.isLoading) this.submitIMEAData();
                    } else {
                        this.isValid = true;
                    }
                });
            },
            async submitIMEAData() {
                if(this.isLoading || this.isExperianModalVisible || this.isMxAddressValidationPending) return;
                this.isLoading = true;
                if(this.servicesPayload) {
                    const saveAchResponse = await this.savePayMethod({
                        isEditing: false,
                        isCreditCard: false,
                        isCommissionDeposit: true,
                        customerId: this.localization?.Data?.CustomerId,
                        bearerToken: this.localization?.Data?.Token,
                        country: this.$env?.Country,
                        envService: this.$env?.ServiceBaseUrl,
                        errorTranslations: this.localization?.Data?.ServerErrorTranslation || null,
                        payload: this.servicesPayload
                    });
                    if(saveAchResponse?.success) {
                        if(this.isMx || this.isPl) this.postToBackendAndRedirect();
                        if(this.isAu || this.isNz) {
                            this.imeaFormData = {
                                ...this.imeaFormData,
                                PayMethodId: saveAchResponse.response?.payMethodId,
                                PayMethodType: 'DirectDeposit'
                            };
                            this.postToBackendAndRedirect();
                        }
                    } else {
                        const messageType = saveAchResponse.response?.messageType;
                        const messageHandlers = {
                            'InvalidAccountNumber': () => eventBus.$emit('setBankAccountInvalid'),
                            'InvalidAchAccountNumber': () => eventBus.$emit('setBankAccountInvalid'),
                            'InvalidAchRoutingNumber': () => eventBus.$emit('setBSBNumberInvalid')
                        };

                        if(messageType && messageHandlers[messageType]) {
                            messageHandlers[messageType]();
                            this.isLoading = false;
                            return;
                        }
                        this.handleSubmitError();
                    }
                } else this.postToBackendAndRedirect();
            }
        }
    };
</script>
