<template>
    <div class="o-checkInstall">
        <a-loading-spinner class="ml-40" :visible="loading" />

        <div v-if="!loading" class="o-checkInstall__row">
            <ul class="o-checkInstall__list">
                <li v-if="isPortal" class="o-checkInstall__item">
                    <label class="o-checkInstall__label" for="card-selections">{{ labels.CardSelection }}</label>
                    <v-select
                        id="card-selections"
                        ref="card-select"
                        select-element-mod="o-checkInstall__select"
                        :options="cardText"
                        :values="cardValues"
                        :initial="null"
                        :aria-label="labels.CardSelectionAriaLabel"
                        :is-disabled="true"
                        @change="({ value }) => selectedCardValue = value">
                        <transition-expand>
                            <div
                                v-if="hasCardError"
                                ref="error"
                                tabindex="0"
                                class="o-checkInstall__error w-full text-red text-xs block pt-5">

                                <span>{{ labels.MakeSelection }}</span>
                            </div>
                        </transition-expand>
                    </v-select>
                </li>

                <li class="o-checkInstall__item">
                    <label class="o-checkInstall__label" for="installment-options">{{ labels.InstallmentPeriod }}</label>
                    <v-select
                        id="installment-options"
                        ref="install-select"
                        select-element-mod="o-checkInstall__select"
                        :options="installText"
                        :values="installValues"
                        :initial="installValues[0]"
                        :aria-label="labels.InstallmentAriaLabel"
                        :readonly="isReadonly"
                        @change="({ value }) => selectedInstallValue = value">
                    </v-select>
                </li>

                <li class="o-checkInstall__item -bottom">
                    <button class="o-checkInstall__info" @click="openModal()">{{ labels.CreditCardInstallmentInfo }}</button>
                </li>
            </ul>
        </div>

        <modal width="700px">
            <template v-slot:heading>
                {{ rteHeading }}
            </template>

            <template v-slot:body>
                <div v-html="rteContent"></div>
            </template>
        </modal>
    </div>
</template>

<script>
    import { portal } from '../../../utils/payment-types';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import scrollToMiddle from '../../../utils/scroll-to-middle';
    import { mapActions, mapGetters, mapState } from 'vuex';

    export default {
        name: 'OCheckoutInstallment',
        props: {
            labels: {
                type: Object,
                default: () => {}
            },
            rte: {
                type: Object,
                default: () => {}
            },
            installmentOptions: {
                type: Array,
                default: () => {}
            },
            isOwingBalance: {
                type: Boolean,
                default: false
            },
            payMethod: {
                type: String,
                default: ''
            },
            payMethodType: {
                type: String,
                default: ''
            },
            totalBalanceSelected: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                hasCardError: false,
                selectedCardValue: '',
                selectedInstallValue: ''
            };
        },
        computed: {
            ...mapGetters('paymentMethod', ['paymentMethodById']),
            ...mapState('cardIssuers', ['cardIssuers', 'loaded', 'loading']),
            ...mapState('paymentMethod', ['storedPayMethods', 'storedPayMethod']),
            ...mapState('checkout', ['selectedPayMethodId', 'summary']),

            cardText() {
                return [
                    this.labels.CardSelection,
                    ...this.cardIssuers.map((option) => option.Name)
                ];
            },
            cardValues() {
                return [
                    null,
                    ...this.cardIssuers.map((option) => option.Id)
                ];
            },
            checkoutPaymentMethod() {
                return this.paymentMethodById(this.selectedPayMethodId);
            },
            installText() {
                let interestFree = null;

                if(this.isPortal) {
                    // For 3D Portal
                    interestFree = this.cardIssuers?.find(cardOption => cardOption?.Id === this.selectedCardValue)?.InterestFreePeriod;
                } else if(this.isOwingBalance) {
                    // For Owing Balance Page
                    interestFree = this.storedPayMethod.InterestFreePeriod;
                } else {
                    // For Checkout Page
                    interestFree = this.checkoutPaymentMethod.InterestFreePeriod;
                }

                return this.installmentOptions.map((option, idx) => {
                    if(idx !== 0 && interestFree && this.labels?.InterestFree && parseInt(option?.Value) <= parseInt(interestFree)) {
                        return replaceToken(this.labels.InterestFree, option?.Text);
                    } else {
                        return option?.Text;
                    }
                });
            },
            installValues() {
                return this.installmentOptions.map((option) => option.Value);
            },
            isPortal() {
                return this.payMethodType === portal;
            },
            isReadonly() {
                const payMethod = this.isOwingBalance ? this.storedPayMethod : this.checkoutPaymentMethod;
                if(!payMethod?.AllowedForInstallment) {
                    return true;
                }

                const totalPayment = this.isOwingBalance ? this.totalBalanceSelected : this.summary.CartNetTotal;
                const minInstallAmount = payMethod?.MinimumInstallmentAmount;

                if(!minInstallAmount) {
                    return false;
                }

                return totalPayment < minInstallAmount;
            },
            rteContent() {
                return this.rte?.Modal?.RteContent;
            },
            rteHeading() {
                return this.rte?.Modal?.RteHeading;
            }
        },
        watch: {
            isPortal() {
                if(this.isPortal) {
                    this.getCardNames();
                } else {
                    this.selectedCardValue = null;
                }
            },
            isReadonly() {
                if(this.isReadonly && this.isOwingBalance) {
                    this.selectedInstallValue = this.installValues[0];
                }
            },
            selectedCardValue() {
                this.saveSelections();
            },
            selectedInstallValue() {
                this.saveSelections();
            }
        },
        created() {
            this.$on('show-error', this.showError);
            this.$on('hide-error', this.hideError);
        },
        mounted() {
            this.getCardNames();

            this.selectedInstallValue = this.installValues[0];
        },
        methods: {
            ...mapActions('cardIssuers', ['getCardIssuers']),
            replaceToken,

            getCardNames() {
                if(!this.loaded && this.isPortal) {
                    this.getCardIssuers(this.$env.Country);
                }
            },
            openModal() {
                this.$modal.show();
            },
            saveSelections() {
                this.hasCardError = false;

                this.$emit('update', {
                    card: this.selectedCardValue,
                    installment: this.selectedInstallValue,
                    isPortal: this.isPortal
                });
            },
            hideError() {
                this.hasCardError = false;
            },
            showError() {
                this.hasCardError = true;

                this.$nextTick(() => {
                    const el = this.$refs['error'];
                    scrollToMiddle(el, {
                        complete() {
                            el.focus();
                        }
                    });
                });
            }
        }
    };
</script>
