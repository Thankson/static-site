<template>
    <section class="o-acctCardSection">
        <!-- Show spinner while API is being loaded submitted -->
        <div v-if="apiLoading" class="o-acctCardSection__loading">
            <a-loading-spinner
                :visible="apiLoading"
                class="o-acctCardSection__loadingIcon"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <h4 class="o-acctCardSection__title">{{ getLocalizationProp('Labels.SectionTitle', 'Payment Methods') }}</h4>
        <p v-if="getLocalizationProp('Labels.SubTitle') !== null" class="mb-10" v-html="getLocalizationProp('Labels.SubTitle', '')"></p>
        <p v-if="isCn && hasWillExpiredCard" class="o-acctCardSection__expired">
            <span aria-hidden="true" class="o-acctCardSection__error">error_outline</span>
            <span>{{ getLocalizationProp('Labels.Expired', '') }}</span>
        </p>

        <p v-if="isCn && hasExpiredCard" class="o-acctCardSection__expired">
            <span aria-hidden="true" class="o-acctCardSection__error">error_outline</span>
            <span>{{ getLocalizationProp('Labels.ExpiredAlert', '') }}</span>
        </p>

        <ul class="o-acctCardSection__list">
            <li v-for="card in creditInfo" :key="card.PayMethodId" :class="hideCard(card) ? '-hideCard' : ''" class="o-acctCardSection__col">
                <payment-address-cards
                    v-if="!isCn"
                    :labels="localization.Labels"
                    :data="localization.Data"
                    :card="card"
                    :is-default="isCardDefault(card.PayMethodDefaults)"
                    :hide-all-make-default-buttons="getLocalizationProp('Data.HideAllMakeDefaultLinks', false)"
                    :hide-default-mop-delete-button="getLocalizationProp('Data.HideDefaultLink', false)"
                    @set-default-card="makeDefault"
                    @open-modal="onOpenModal"
                >
                    <credit-card-info />
                </payment-address-cards>
                <payment-address-cards-cn
                    v-if="isCn"
                    :labels="localization.Labels"
                    :data="localization.Data"
                    :card="card"
                    :is-default="isCardDefault(card.PayMethodDefaults)"
                    v-on:set-default-card="makeDefault"
                    @open-modal="onOpenModal"
                >
                    <credit-card-info />
                </payment-address-cards-cn>

                <pre-authorization-status
                    v-if="isCn"
                    class="transform -translate-y-15 md:-translate-y-20"
                    :card="card"
                    :script-id="scriptId"
                />
            </li>
        </ul>

        <modal heading-class="o-acctCardSection__modalHeading">
            <template v-slot:heading>
                <span v-html="getLocalizationProp('Labels.ModalTitle', 'Are you sure?')"></span>
            </template>

            <template v-slot:body>
                <p class="o-acctCardSection__modalDesc" v-html="getLocalizationProp('Labels.ModalDetails', 'Deleting this saved credit card cannot be undone')"></p>
            </template>

            <template v-slot:footer>
                <div class="flex w-full">
                    <div class="o-acctCardSection__modalBtn -secondary" :class="{'-isCn': isCn}">
                        <v-button v-modal-hide class="-white -full" @click="gtmTrackAction({id: 204}, $event)">{{ getLocalizationProp('Labels.Cancel', 'Cancel') }}</v-button>
                    </div>

                    <div class="o-acctCardSection__modalBtn -primary" :class="{'-isCn': isCn}">
                        <v-button class="-green -full" @click="[onDeletedPayCard(), gtmTrackAction({id: 204}, $event)]">{{ getLocalizationProp('Labels.Delete', 'Delete') }}</v-button>
                    </div>
                </div>
            </template>
        </modal>

        <div v-if="!apiLoading && !apiError" class="lg:pr-20 lg:w-1_2">
            <a :href="getLocalizationProp('Data.AddNewLink.Url')" :target="getLocalizationProp('Data.AddNewLink.Target', '#')" class="a-button -outline -large justify-center w-full text-center md:mt-30" @click="gtmTrackAction({id: 204}, $event)">
                <span class="mr-5 test">+</span>{{ getLocalizationProp('Labels.AddNewLabel', 'Add New Payment Method') }}
            </a>
            <p v-if="isCn && getLocalizationProp('Labels.AddNewNote')" class="o-acctCardSection__note" v-html="getLocalizationProp('Labels.AddNewNote')"></p>
        </div>

        <m-error-card
            v-if="apiError"
            :reload-text="getLocalizationProp('Labels.RefreshPage')"
            :text="getLocalizationProp('Labels.GenericFailureMessage')"
        />

        <OAddressPaymethodPrompt
            ref="paymentPrompt"
            :cancel-label="getLocalizationProp('Labels.PaymethodPromptModel.ChangeOne', '')"
            :confirm-label="getLocalizationProp('Labels.PaymethodPromptModel.ChangeBoth', '')"
            :desc-label="getLocalizationProp('Labels.PaymethodPromptModel.Description', '')"
            :is-pay-method-prompt="true"
            :is-prompt-enabled="isPaymethodPromptEnabled"
            :ok-label="getLocalizationProp('Labels.Checkout.Ok', 'OK')"
            :provided-pay-methods="creditInfo"
            :title-label="getLocalizationProp('Labels.PaymethodPromptModel.Title', '')"
            :updated-label="getLocalizationProp('Labels.PaymethodPromptModel.Updated', '')"
        />

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState, mapMutations} from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { isProductsDefault, isServicesDefault } from '../../../utils/payment-methods';
    import OAddressPaymethodPrompt from '@productstore/source/js/vue/components/02-organisms/modals/address-paymethod-prompt.vue';

    export default {
        name: 'PaymentAddressSection',
        components: { OAddressPaymethodPrompt },
        mixins: [ localizationMixin ],
        props: {
            addNewLabel: {
                type: String,
                default: 'Add new shipping Address'
            },
            addNewLink: {
                type: String,
                default: '#'
            },
            title: {
                type: String,
                default: 'Shipping Addresses'
            }
        },
        data() {
            return {
                isDefaultChecked: false,
                selectedModal: null,
                showModal: false
            };
        },
        computed: {
            ...mapState('payAddress', ['creditInfo', 'defaultProductCard', 'apiLoading', 'apiError']),
            ...mapGetters('payAddress', ['creditInfo', 'defaultProductCard', 'apiLoading', 'apiError']),
            hasExpiredCard() {
                let expiredCard = false;

                if(this.creditInfo && this.creditInfo.length) {
                    expiredCard = this.creditInfo.find(item => item.Expired === true);

                    if(expiredCard && expiredCard.PayMethodId) {
                        expiredCard = true;
                    } else {
                        expiredCard = false;
                    }
                }

                return expiredCard;
            },
            hasProdServDefaults() {
                let prodServDefaults = false;

                if(this.creditInfo && this.creditInfo.length) {
                    prodServDefaults = this.creditInfo.find(item => isProductsDefault(item.PayMethodDefaults) && isServicesDefault(item.PayMethodDefaults));

                    if(prodServDefaults && prodServDefaults.PayMethodId) {
                        prodServDefaults = true;
                    } else {
                        prodServDefaults = false;
                    }
                }

                return prodServDefaults;
            },
            hasWillExpiredCard() {
                let willExpiredCard = false;

                if(this.creditInfo && this.creditInfo.length) {
                    willExpiredCard = this.creditInfo.find(item => item.ExpiresSoon === true);

                    if(willExpiredCard && willExpiredCard.PayMethodId) {
                        willExpiredCard = true;
                    } else {
                        willExpiredCard = false;
                    }
                }

                return willExpiredCard;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isPaymethodPromptEnabled() {
                return this.localization?.Data?.RiverbendPaymethodAddressPrompt;
            }
        },
        mounted() {
            if(this.apiEndpoint) {
                this.setRoute({ apiEndpoint: this.apiEndpoint });
            }
            this.fetchCreditInfo(this.getLocalizationProp('Data.ParamsPl'));
        },
        methods: {
            ...mapMutations('payAddress', ['UPDATE_CREDITINFO', 'DELETE_PAYMENTMETHOD']),
            ...mapActions('payAddress', ['fetchCreditInfo', 'setRoute', 'setDefaultCard', 'deletePaymentMethod']),
            hideCard(card) {
                // For K.R VirtualAccount payments cannot be modified only shown if set default
                if(card?.PayMethodType !== 'VirtualAccount') {
                    return false;
                } else {
                    if(!this.isCardDefault(card?.PayMethodDefaults)) {
                        return true;
                    }
                }
            },
            isCardDefault: function(_payMethods) {
                if(_payMethods === undefined || !_payMethods.length) {
                    return false;
                } else {
                    // CN doesn't have default service paymenthod
                    return isProductsDefault(_payMethods) || (isServicesDefault(_payMethods) && !this.isCn);
                }
            },
            makeDefault: function(payMethodId, currentDefaults) {
                this.setDefaultCard({
                    paymentId: payMethodId,
                    hasProdServ: this.hasProdServDefaults,
                    otherDefaults: currentDefaults
                });
            },
            onDeletedPayCard: function() {
                this.$modal.hide();
                this.deletePaymentMethod(this.selectedModal);
                this.selectedModal = null;
            },
            onModalClose: function() {
                this.$modal.hide();
            },
            onOpenModal: function(id) {
                this.selectedModal = id;
                this.$modal.show();
            }
        }
    };
</script>
