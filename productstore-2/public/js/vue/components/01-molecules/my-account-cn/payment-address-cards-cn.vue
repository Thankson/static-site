<template>
    <div class="m-acctCard -isCn">
        <div class="m-acctCard__card">
            <div class="md:pt-12">
                <credit-card-info
                    :nick-name="accountTypeLabel"
                    :card-ending="card.LastFourDigitsOfAccount"
                    :card-ending-aria-label="labels.CardEnding"
                    :card-expiration="isDebitCard ? null : card.ExpirationDisplay"
                    :card-expiration-label="labels.Expires"
                    :card-expiration-aria-label="labels.CardExpirationAria"
                    :card-expiration-near="card.ExpiresSoon"
                    :card-expired="card.Expired"
                    :type="card.PayMethodType"
                ></credit-card-info>
            </div>
            <ul class="flex flex-row flex-wrap">
                <li class="flex font-medium uppercase text-green">
                    <a :href="editCardLink" @click="gtmTrackAction({id: 204}, $event)">{{ labels.Edit }}</a>
                    <span class="font-medium text-green px-10" aria-hidden="true">|</span>
                </li>
                <li class="mr-auto pr-10">
                    <button class="font-medium uppercase text-green" @click="[openModal(), gtmTrackAction({id: 204}, $event)]">{{ labels.Delete }}</button>
                </li>
                <li class="w-full mt-12 md:mt-0 md:w-auto">
                    <button
                        class="font-medium uppercase text-green"
                        :class="{'hidden': isDefault || !canBeDefault}"
                        @click="[setDefaultCardOnParent(this), gtmTrackAction({id: 204}, $event)]"
                    >{{ labels.MakeDefault }}</button>
                    <p v-if="isDefault" class="text-gray-150 text-base">
                        <span class="uppercase font-bold">{{ labels.Default }}</span>
                    </p>
                </li>
            </ul>
        </div>
        <modal id="cnDefaultModal" heading-class="px-30 md:px-0 text-2xl-2 leading-base text-gray-150">
            <template v-slot:heading>
                {{ labels.DeleteDefaultCard }}
            </template>

            <template v-slot:body>
                <div class="px-30 md:px-0 text-gray-120 text-base">
                    <p>{{ labels.CannotDeletePayment }}</p>
                </div>
            </template>

            <template v-slot:footer>
                <div class="px-30 md:px-0 pb-30 md:pb-0">
                    <button class="a-button px-25 text-sm" @click="closeCnDefaultModal">{{ labels.Cancel }}</button>
                </div>
            </template>
        </modal>
        <modal id="cnDefaultErrorModal" width="370px">
            <template v-slot:heading>
                {{ labels.CannotSetDefaultCard }}
            </template>

            <template v-slot:body>
                <div class="px-30 md:px-0 text-gray-120 text-lg" style="line-height: 1.15;">
                    <p v-html="labels.BankCardCannotBeSet"></p>
                </div>
            </template>

            <template v-slot:footer>
                <button class="a-button px-15 w-120 text-center inline-block py-12" @click="closeCnDefaultErrorModal">{{ labels.Continue }}</button>
            </template>
        </modal>
        <modal id="cnNotPreAuthModal" width="370px">
            <template v-slot:heading>
                {{ nonPersonalCard.BankCardNotSetasDefaultTitle }}
            </template>

            <template v-slot:body>
                <div class="text-gray-120 text-lg" style="line-height: 1.15;">
                    <p v-html="nonPersonalCard.BankCardNotSetasDefaultDescription"></p>
                </div>
            </template>

            <template v-slot:footer>
                <button class="a-button px-15 w-120 text-center inline-block py-12" @click="closeCnNotPreAuthModal">{{ nonPersonalCard.BankCardNotSetasDefaultAlertButtonText }}</button>
            </template>
        </modal>
    </div>
</template>

<script>
    import { mapMutations, mapState } from 'vuex';
    import * as paymentMethodUtils from '../../../utils/payment-methods';

    export default {
        name: 'PaymentAddressCardsCn',

        props: {
            card: {
                type: Object,
                default: () => ({
                    PayMethodId: 1017741264,
                    PayMethodType: 'DirectDeposit',
                    NameOnAccount: 'asdfasdf',
                    LastFourDigitsOfAccount: '8525',
                    PaymethodNameDisplay: null,
                    ExpirationDisplay: '2/14',
                    PayMethodDefaults: [paymentMethodUtils.defaultPaymentTypes.products, paymentMethodUtils.defaultPaymentTypes.services],
                    ExpiresSoon: true,
                    Expired: true,
                    RoutingNumber: 858,
                    CanBeDefault: true
                })
            },
            isDefault: {
                type: Boolean,
                default: false
            },
            data: {
                type: Object,
                default: () => {}
            },
            labels: {
                type: Object,
                default: () => ({
                    AccountNumber: 'Account Number',
                    AccountType: 'Account Type',
                    DeleteDefaultError:
                        'You cannot delete a Default payment method. Edit another method and make default.',
                    AddNewLabel: 'Add New Payment Method',
                    Default: 'Default',
                    DefaultForBackupOrder: 'Default For Backup Order',
                    DefaultForHomeSecurity: 'Default For Home Security',
                    DefaultForProducts: 'Default For Products',
                    DefaultForServices: 'for Marketplace Services',
                    DefaultPaymentMethod: 'Default Payment Method',
                    Delete: 'Delete',
                    Edit: 'Edit',
                    Expired: 'Expired',
                    Expires: 'Expires',
                    MakeDefault: 'Make Default',
                    PaymentMethods: 'Payment Methods',
                    RoutingNumber: 'Routing Number',
                    SectionTitle: 'Payment Methods',
                    ModalDetails: 'Deleting this saved credit card cannot be undone.',
                    ModalTitle: 'Are you sure?',
                    Cancel: 'Cancel',
                    PaymentTypes:
                        [
                            {'PaymentType': 'ACHSavings', 'Label': 'ACH Savings'},
                            {'PaymentType': 'ACHChecking', 'Label': 'ACH Checking'},
                            {'PaymentType': 'DirectDebit', 'Label': 'Direct Debit'},
                            {'PaymentType': 'DirectDeposit', 'Label': 'Direct Deposit'}
                        ]
                })
            }
        },
        data() {
            return {
                isDefaultChecked: false,
                editcardLink: '',
                showCnDefaultModal: false,
                isAuthenticated: false
            };
        },
        computed: {
            ...mapState('payAddress', ['showDefaultError', 'errorDefaultCardReasons']),
            accountTypeLabel: function() {
                let currentPaymentType = this.card.PayMethodType;
                let payLabel = ' ';
                let creditCardLabel = '';
                this.labels.PaymentTypes.map(function (ele, i) {
                    if(currentPaymentType === ele.PaymentType) {
                        payLabel = ele.Label;
                    }
                    if(ele.PaymentType === 'CreditCard') {
                        creditCardLabel = ele.Label;
                    }
                });
                if(payLabel === ' ') {
                    payLabel = creditCardLabel;
                }
                return payLabel;
            },
            canBeDefault: function() {
                return this.card.CanBeDefault;
            },
            editCardLink: function() {
                return (
                    this.data.EditLink.Url + '?' + this.data.PaymethodIdQueryParamName + '=' + this.card.PayMethodId
                );
            },
            isDebitCard: function() {
                return this.card.PayMethodType === 'DebitCard';
            },
            nonPersonalCard() {
                return this.labels?.NonPersonalCardCanNotSetDefault || {};
            }
        },
        watch: {
            isDefault(newVal, oldVal) {
                this.isDefaultChecked = newVal;
            },
            showDefaultError(newVal) {
                if(newVal) {
                    const shouldOpenNotPreAuthModal = this.data?.EnablePreAuth &&
                        this.errorDefaultCardReasons.some(reason => reason?.Original === 'NonPersonalCardCanNotSetDefault');
                    if(shouldOpenNotPreAuthModal) {
                        this.$modal.show({id: 'cnNotPreAuthModal'});
                    } else {
                        this.$modal.show({id: 'cnDefaultErrorModal'});
                    }
                    this.$nextTick(() => {
                        this.CLOSE_ERROR_DEFAULT_CARD();
                    });
                }
            }
        },
        mounted() {
            this.isDefaultChecked = this.isDefault;
        },
        methods: {
            ...mapMutations('payAddress', ['CLOSE_ERROR_DEFAULT_CARD']),
            closeCnDefaultModal: function() {
                this.$modal.hide({id: 'cnDefaultModal'});
            },
            closeCnDefaultErrorModal: function() {
                this.$modal.hide({id: 'cnDefaultErrorModal'});
            },
            closeCnNotPreAuthModal: function() {
                this.$modal.hide({id: 'cnNotPreAuthModal'});
                window.location.href = this.data?.AddNewLink?.Url || '#';
            },
            openModal: function() {
                if(this.isDefaultChecked) {
                    this.$modal.show({id: 'cnDefaultModal'});
                    return;
                }
                this.$emit('open-modal', this.card.PayMethodId);
            },
            setDefaultCardOnParent() {
                this.$emit(
                    'set-default-card',
                    this.card.PayMethodId,
                    this.card.PayMethodDefaults.filter(item => !paymentMethodUtils.isProductsDefault(item) && !paymentMethodUtils.isServicesDefault(item))
                );
            }
        }

    };
</script>
