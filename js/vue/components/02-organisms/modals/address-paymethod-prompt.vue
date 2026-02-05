<template>
    <modal margin="40px" :width="!updated ? '530px' : '500px'">
        <template #heading>
            <div v-if="!updated" class="mb-20">
                {{ titleLabel }}
            </div>
            <div v-show="!hasErrors" class="inline-block text-base font-normal leading-normal" v-html="desc"></div>
        </template>

        <template #footer>
            <template v-if="!updated">
                <button
                    class="a-button text-base text-left leading-tight mt-30 md:text-center"
                    type="button"
                    @click="onUpdate">

                    <span class="px-7">{{ confirmLabel }}</span>
                </button>

                <button
                    class="a-button -outline text-base text-left font-medium leading-tight mt-20 md:text-center"
                    type="button"
                    @click="hide">

                    <span class="px-7">{{ cancelLabel }}</span>
                </button>
            </template>

            <button
                v-else
                class="a-button text-base text-left leading-tight mt-30 md:text-center"
                type="button"
                @click="hide">

                <span class="px-7">{{ okLabel }}</span>
            </button>

            <a-loading-spinner
                class="-mb-15"
                :visible="loading"
            />

            <p v-if="errorMsg" class="text-sm text-red leading-tight mt-15">
                {{ errorMsg }}
            </p>
        </template>
    </modal>
</template>

<script>
    import apiUpdateAddress from '@api/routes/subscription/updateaddress';
    import { mapActions, mapMutations, mapState } from 'vuex';
    import { defaultPaymentTypes, isProductsDefault, isRiverbendDefault } from '../../../utils/payment-methods';

    export default {
        name: 'OAddressPaymethodPrompt',
        props: {
            cancelLabel: {
                type: String,
                default: 'Cancel'
            },
            confirmLabel: {
                type: String,
                default: 'Confirm'
            },
            descLabel: {
                type: String,
                default: ''
            },
            isPayMethodPrompt: {
                type: Boolean,
                default: false
            },
            isPromptEnabled: {
                type: Boolean,
                default: false
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            okLabel: {
                type: String,
                default: ''
            },
            providedPayMethods: {
                type: Array,
                default: null
            },
            titleLabel: {
                type: String,
                default: ''
            },
            updatedLabel: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                addressMatches: [],
                defaultPayMethod: null,
                errorMsg: '',
                hasErrors: false,
                loading: false,
                newAddressRequest: {},
                nseDefaultPayMethod: null,
                updated: false
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedPayMethods']),
            desc() {
                return !this.updated ? this.descLabel : this.updatedLabel;
            },
            shouldShowPaymentModal() {
                if(this.isRiverbend) return true;

                return this.storedPayMethods?.some(pm => pm.PayMethodDefaults.includes(defaultPaymentTypes.riverbend));
            }
        },
        watch: {
            providedPayMethods(newVal) {
                if(newVal && this.isPayMethodPrompt) {
                    this.SET_PAYMENT_METHODS({
                        paymentMethods: newVal
                    });
                    this.handlePaymethodChange();
                }
            },
            storedPayMethods() {
                if(!this.isPromptEnabled && !this.isPayMethodPrompt) return;
                this.handlePaymethodChange();
            }
        },
        mounted() {
            this.$modal.$on.hide(() => (this.reset()));
        },
        methods: {
            ...mapActions('payAddress', ['setDefaultCardSimple']),
            ...mapMutations('paymentMethod', ['SET_PAYMENT_METHODS']),
            handlePaymethodChange() {
                if(!this.shouldShowPaymentModal) return;
                if(!this.isPayMethodPrompt) return;
                const payMethodTypeToCheck = this.isRiverbend ? 'riverbend' : 'products';
                const defaultPayMethod = this.storedPayMethods.find(payMethod => payMethod.PayMethodDefaults.includes(defaultPaymentTypes[payMethodTypeToCheck]));
                if(this.defaultPayMethod && this.defaultPayMethod.PayMethodId !== defaultPayMethod.PayMethodId) {
                    this.defaultPayMethod = defaultPayMethod;
                    if(this.isAlreadyOtherPayMethodDefault(defaultPayMethod)) return;
                    this.show();
                } else if(!this.defaultPayMethod) {
                    this.defaultPayMethod = defaultPayMethod;
                }
            },
            hide() {
                this.$modal.hide();
                this.updated = false;
                this.$emit('onComplete');
            },
            isAlreadyOtherPayMethodDefault(payMethod) {
                // if the paymethod that was set as default is
                // already the default for the other service no reason to show
                // the modal
                // e.g. products default is already riverbend default or vice versa
                if(this.isRiverbend) {
                    if(isProductsDefault(payMethod.PayMethodDefaults)) return true;
                } else {
                    if(isRiverbendDefault(payMethod.PayMethodDefaults)) return true;
                }
                return false;
            },
            async onUpdate() {
                this.errorMsg = '';
                this.loading = true;

                if(this.isPayMethodPrompt) {
                    const defaultToAdd = this.isRiverbend ? defaultPaymentTypes.products : defaultPaymentTypes.riverbend;
                    await this.updatePaymethodDefault(this.defaultPayMethod, defaultToAdd);
                } else {
                    await this.updateAddress();
                }

                this.loading = false;
                this.updated = true;
            },
            reset() {
                this.addressMatches = [];
                this.errorMsg = '';
                this.newAddressRequest = {};
                this.hasErrors = false;
                this.updated = false;
            },
            show(newAddressRequest, addressMatches) {
                if(!this.isPromptEnabled) return;
                if(this.isPayMethodPrompt) {
                    this.$modal.show();
                } else if(newAddressRequest.Country === this.$env.Country) {
                    this.newAddressRequest = newAddressRequest;
                    this.addressMatches = addressMatches;
                    this.$modal.show();
                }
            },
            showPaymethodPrompt(newPayMethod) {
                if(this.isPromptEnabled) {
                    if(newPayMethod) this.defaultPayMethod = newPayMethod;
                    this.$modal.show();
                }
            },
            async updateAddress() {
                // generate Promise array for each address to be updated
                const updateRequests = this.addressMatches.map((addr) => {
                    const payload = {
                        ...this.newAddressRequest,
                        AddressId: addr.AddressId,
                        AddressType: addr.AddressType,
                        IsDefault: addr.IsDefault,
                        NameOnAddress: addr.NameOnAddress
                    };

                    return new Promise((resolve) => {
                        apiUpdateAddress.post(payload).then((resp) => resolve(resp));
                    });
                });

                const responseArr = await Promise.all(updateRequests);
                const errorResponseArr = responseArr?.filter((response) => !response.success || !response.data?.Success) || [];
                console.log('errorResponseArr', errorResponseArr);
                if(!errorResponseArr.length) {
                    this.update = true;
                } else {
                    const value = this.isRiverbend ? 'Melaleuca' : 'Riverbend Steaks';
                    this.errorMsg = `There was an issue updating your ${value} address. Please manually update your account information.`;
                    this.hasErrors = true;
                    errorResponseArr.forEach((response) => {
                        console.error('There was an issue updating the address:', response.data?.ErrorMessages || response.error);
                    });
                }
            },
            async updatePaymethodDefault(paymethod, defaultToAdd) {
                const response = await this.setDefaultCardSimple({
                    paymentId: paymethod?.PayMethodId,
                    existingDefaults: paymethod?.PayMethodDefaults || [],
                    defaultToAdd
                });
                if(!response.success || !response.data?.Success) {
                    this.errorMsg = 'There was an issue updating your pay method. Please manually update your account information.';
                    this.hasErrors = true;
                    console.error(this.errorMsg);
                } else {
                    this.errorMsg = '';
                }
            }
        }
    };
</script>
