<template>
    <div class="m-acctCard">
        <div class="m-acctCard__card">
            <div v-if="!isCheck && !isAdvancedPayment" class="py-30">
                <credit-card-info
                    :nick-name="card.AccountNickName"
                    :card-ending="card.LastFourDigitsOfAccount"
                    :card-brand-image-src="card.PayMethodImage"
                    :card-brand-name="card.CreditCardDescription"
                    :card-ending-aria-label="labels.CardEnding"
                    :card-expiration="card.ExpirationDisplay"
                    :card-expiration-label="expirationLabel"
                    :card-expiration-aria-label="labels.CardExpirationAria"
                    :card-expiration-near="card.ExpiresSoon"
                    :card-expired="card.Expired"
                    :card-masking="card.Masking"
                    :card-masking-condensed="card.MaskingCondensed"
                    :name-on-account="card.NameOnAccount"
                    :type="card.PayMethodType"
                    :display-name="card.PaymethodNameDisplay"
                ></credit-card-info>
            </div>
            <div v-if="isCheck">
                <ul class="m-acctCard__list">
                    <li class="m-acctCard__item font-bold">
                        <span v-if="labels.AccountType">{{ labels.AccountType }}:</span>
                        <span class="m-acctCard__itemDetail">{{ accountTypeLabel }}</span>
                    </li>
                    <li v-if="card.RoutingNumber" class="m-acctCard__item font-bold">
                        <span v-if="labels.RoutingNumber">{{ labels.RoutingNumber }}:</span>
                        <span class="m-acctCard__itemDetail" v-html="maskedRouteNumber"></span>
                    </li>
                    <li v-if="card.LastFourDigitsOfAccount" class="m-acctCard__item font-bold">
                        <span v-if="labels.AccountNumber">{{ labels.AccountNumber }}:</span>
                        <span class="m-acctCard__itemDetail" v-html="maskedAccountNumber"></span>
                    </li>
                </ul>
            </div>
            <div v-if="isAdvancedPayment">
                <ul class="m-acctCard__list">
                    <li class="m-acctCard__item font-bold">
                        <span class="m-acctCard__itemDetail">{{ accountTypeLabel }}</span>
                    </li>
                    <li v-if="card.RoutingNumber" class="m-acctCard__item font-bold">
                        <span class="m-acctCard__itemDetail" v-html="cleanRouteNumber"></span>
                    </li>
                    <li v-if="card.LastFourDigitsOfAccount" class="m-acctCard__item font-bold">
                        <span class="m-acctCard__itemDetail" v-html="maskedAccountNumber"></span>
                    </li>
                </ul>
            </div>
            <ul class="m-acctCard__actions">
                <li v-if="!isCheck && isEditable" class="m-acctCard__button" data-testid="listitem-editCta">
                    <a
                        :href="editCardLink"
                        :aria-label="customAriaLabel(labels.EditAriaLabel, labels.Edit)"
                        @click="gtmTrackAction({id: 204}, $event)"
                    >
                        {{ labels.Edit }}
                    </a>
                    <span
                        v-if="!hideDeleteButton"
                        class="m-acctCard__button -divider"
                        aria-hidden="true">
                        |
                    </span>
                </li>
                <li>
                    <button
                        v-if="!hideDeleteButton"
                        class="m-acctCard__button"
                        :aria-label="customAriaLabel(labels.DeleteAriaLabel, labels.Delete)"
                        data-testid="button-deleteCta"
                        @click="[openModal(), gtmTrackAction({id: 204}, $event)]"
                    >
                        {{ labels.Delete }}
                    </button>
                </li>
                <li class="m-acctCard__makeDefault">
                    <button
                        v-if="!card.IsOneTimeCard"
                        class="m-acctCard__button"
                        :class="{'hidden': hideAllMakeDefaultButtons || isDefault || !canBeDefault}"
                        :aria-label="customAriaLabel(labels.MakeDefaultAriaLabel, labels.MakeDefault)"
                        data-testid="button-makeDefaultCta"
                        @click="[setDefaultCardOnParent(this), gtmTrackAction({id: 204}, $event)]"
                    >
                        {{ labels.MakeDefault }}
                    </button>
                    <p v-if="isDefault && !isVirtualAccount" class="m-acctCard__text">
                        <span class="m-acctCard__text -default">{{ labels.Default }}</span>
                        <span class="m-acctCard__text -caption">{{ paymentMethodLabel }}</span>
                    </p>
                </li>
            </ul>
        </div>
        <div
            v-show="showDefaultError"
            class="e-formError__item m-acctCard__error float-left text-left w-full mt-20 not-italic"
            role="alert"
        >{{ labels.DeleteDefaultError }}</div>
    </div>
</template>

<script>
    import * as paymentMethodsUtil from '../../../utils/payment-methods';

    export default {
        name: 'PaymentAddressCards',
        props: {
            card: {
                type: Object,
                default: () => ({
                    PayMethodId: 1017741264,
                    PayMethodType: 'VirtualAccount',
                    NameOnAccount: 'Sonny Lewis',
                    LastFourDigitsOfAccount: '8525',
                    PaymethodNameDisplay: null,
                    ExpirationDisplay: '2/14',
                    PayMethodDefaults: [paymentMethodsUtil.defaultPaymentTypes.products, paymentMethodsUtil.defaultPaymentTypes.services],
                    ExpiresSoon: true,
                    Expired: true,
                    RoutingNumber: 858,
                    CanBeDefault: true
                })
            },
            data: {
                type: Object,
                default: () => {}
            },
            hideAllMakeDefaultButtons: {
                type: Boolean,
                default: false
            },
            hideDefaultMopDeleteButton: {
                type: Boolean,
                default: false
            },
            isDefault: {
                type: Boolean,
                default: false
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
                    DeleteAriaLabel: 'Delete {0} shipping address',
                    Edit: 'Edit',
                    EditAriaLabel: 'Edit {0} shipping address',
                    Expired: 'Expired',
                    Expires: 'Expires',
                    MakeDefault: 'Make Default',
                    MakeDefaultAriaLabel: 'Make {0} default shipping address',
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
                            {'PaymentType': 'DirectDeposit', 'Label': 'Direct Deposit'},
                            {'PaymentType': 'VirtualAccount', 'Label': 'Virtual Account'},
                            {'PaymentType': 'AutomaticWithdrawal', 'Label': 'Post Office'},
                            {'PaymentType': 'AdvancedPaymentFromBank', 'Label': 'Hua Nan Bank'}
                        ]
                })
            }
        },
        data() {
            return {
                isDefaultChecked: false,
                showDefaultError: false
            };
        },
        computed: {
            accountTypeLabel() {
                let currentPaymentType = this.card.PayMethodType;
                let payLabel = '';
                this.labels.PaymentTypes.map(function (ele, i) {
                    if(currentPaymentType === ele.PaymentType) {
                        payLabel = ele.Label;
                    }
                });
                return payLabel;
            },
            canBeDefault() {
                return this.card.CanBeDefault;
            },
            canBeDeleted () {
                return this.card?.CanBeDeleted;
            },
            cleanRouteNumber() {
                return this.card.RoutingNumber;
            },
            editCardLink() {
                return (
                    this.data?.EditLink?.Url + '?' + this.data?.PaymethodIdQueryParamName + '=' + this.card?.PayMethodId
                );
            },
            expirationLabel() {
                return this.card.Expired ? this.labels.Expired : this.labels.Expires;
            },
            hideDeleteButton() {
                return this.isVirtualAccount ||
                    (this.hideDefaultMopDeleteButton && this.isDefault) || (!this.canBeDeleted);
            },
            isAdvancedPayment() {
                let payMethList = ['AutomaticWithdrawal', 'AdvancedPaymentFromBank'];

                return payMethList.includes(this.card.PayMethodType);
            },
            isCheck() {
                var payMethList = ['DirectDebit', 'ACHChecking', 'ACHSavings', 'DirectDeposit', 'VirtualAccount'];

                return payMethList.includes(this.card.PayMethodType);
            },
            isEditable() {
                return this.card?.IsEditable;
            },
            isVirtualAccount() {
                return this.card.PayMethodType === 'VirtualAccount';
            },
            maskedRouteNumber() {
                return this.card.Masking ? `${this.card.Masking}-${this.card.RoutingNumber}` : this.card.RoutingNumber;
            },
            maskedAccountNumber() {
                return this.card.MaskingCondensed ? `${this.card.MaskingCondensed}-${this.card.LastFourDigitsOfAccount}` : this.card.LastFourDigitsOfAccount;
            },
            paymentMethodLabel() {
                const isProducts = paymentMethodsUtil.isProductsDefault(this.card.PayMethodDefaults);
                const isServices = paymentMethodsUtil.isServicesDefault(this.card.PayMethodDefaults);

                return isServices && !isProducts ? this.labels.DefaultForServices : '';
            }
        },
        watch: {
            isDefault(newVal, oldVal) {
                this.isDefaultChecked = newVal;
                this.showDefaultError = false;
            }
        },
        mounted() {
            this.isDefaultChecked = this.isDefault;
            if(this.isVirtualAccount) {
                this.$parent.$el.classList.add('hide-card');
            }
        },
        methods: {
            customAriaLabel: function(label, defaultLabel) {
                if(label) {
                    return label.replace('{0}', this.card.LastFourDigitsOfAccount);
                }
                return `${defaultLabel} ${this.card.LastFourDigitsOfAccount}`;
            },
            openModal: function() {
                if(this.isDefaultChecked) {
                    this.showDefaultError = true;
                    return;
                }
                this.$emit('open-modal', this.card.PayMethodId);
            },
            setDefaultCardOnParent() {
                this.showDefaultError = false;
                this.$emit(
                    'set-default-card',
                    this.card.PayMethodId,
                    this.card.PayMethodDefaults.filter(item => !paymentMethodsUtil.isProductsDefault(item) && !paymentMethodsUtil.isServicesDefault(item))
                );
            }
        }

    };
</script>
