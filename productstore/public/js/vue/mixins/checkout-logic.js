import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import localizationMixin from '@common/source/js/vue/mixins/localization';
import handlePayPalCheckoutDataMixin from './handle-paypal-data';
import placeholderMixin from '@common/source/js/vue/mixins/placeholder';
import orderTakenBy from '@common/source/js/utils/order-taken-by';
import replaceToken, { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
import paymentFormMixin from './payment-form';

import api from '@api/routes/checkout';
import apiSubmitPayment from '@api/routes/account/submitpayment';
import getJwtToken from '@api/routes/checkout/jwttoken';
import externalPaymentApi from '@api/routes/externalpayment/requestforpayment';
import otpApi from '@api/routes/customeraccount/paymethods/paymentauthentication';
import payMethodsApi from '@api/routes/customeraccount/paymethods/getavailablepaymethods';
import cardNumber from '@common/source/js/vue/utils/card-number';
import getOrderNum from '@api/routes/orders/sequence';
import guiInfoApi from '@api/routes/account/customers/gui';
import shippingOnUsMixin from './shipping-on-us';
import CheckoutShippingOnUsBanner from '../components/01-molecules/shipping-on-us/checkout-shipping-on-us-banner.vue';
import * as paymentTypes from '../utils/payment-types';
import getBrowser from '@productstore/source/js/vue/utils/get-browser';
import uniqid from 'uniqid';

export default {
    components: {
        CheckoutShippingOnUsBanner
    },
    mixins: [ handlePayPalCheckoutDataMixin, localizationMixin, paymentFormMixin, placeholderMixin, shippingOnUsMixin ],
    props: {
        coaErrorMessages: {
            type: Object,
            default: () => {
                return {
                    Empty: 'Please add some ammount. Eg.: 5.50',
                    Invalid: 'Something is wrong. Please, review the value. Eg.: 5.50',
                    MoreThanHave: 'Value entered more than you have in Balance.',
                    MoreThanTotal: 'Value entered more than the order total.'
                };
            }
        }
    },
    data() {
        return {
            activeSequenceErrorMessage: null,
            apiErrors: [],
            additionalMessagesForStickyToast: [],
            coa: null, // Credit on Account
            coaFormatted: null,
            cvvCode: '',
            deviceData: null,
            donationCode: {},
            dragonData: null,
            fpxBankId: null,
            fpxBanks: null,
            fpxData: null,
            guiCarrierTypes: [],
            otpData: null,
            showOtp: false,
            showSequenceOpenErrorOnCheckout: false,
            otpTokenInfo: null,
            otpSessionID: null,
            hasConvenienceStoreError: false,
            hasFpxPaymentError: false,
            hasShippingUnavailableError: false,
            hasCvvError: false,
            termsIsChecked: false,
            hasTermsError: false,
            hasInstallmentError: false,
            hasVirtualPaymentError: false,
            showStickyToast: false,
            showTerms: false,
            isPuertoRico: false,
            isDeletingPayMethods: false,
            isPayMethodInfoValid: false,
            notSatisfiedWithAtLeastOneInfo: false,
            loading: true,
            loadingOrder: false,
            newTotal: null,
            newTotalFormatted: null,
            ready: false,
            subTotal: null,
            selectedGui: '',
            isInvoiceAttention: false,
            isTotalPaidWithCoa: false,
            orderData: null,
            portalData: null,
            payMethodErrorInfo: {},
            paymentFailedModal: {
                title: null,
                description: null,
                cta: null
            },
            requireChineseInvoicePdf: false,
            sequenceOpenErrorMessagesForStickyToast: [],
            invoiceUpdated: false,
            crossCountryAddress: {
                newAddress: null,
                oldAddress: null,
                oldAddressIndex: null
            },
            crossCountryAddressLoading: false,
            scrollTip: '',
            readMoreShipping: false,
            scrollBannerTip: '',
            scrollAddressTip: '',
            selectedShipAddress: null,
            terms: {},
            orderNumberCalled: false,
            hasFirstTimeCheckoutError: false,
            cardChoice: null,
            installmentChoice: null,
            // virtual payment state
            bankChoice: null,
            receiptChoice: null,
            referenceNumber: null,
            isInCheckout: false,
            // convenience store state
            storeChoice: null,
            stopSubmitOtp: false,
            payOptions: [],
            isAddressFormOpen: false,
            showPaymentDeclineMessage: false
        };
    },
    computed: {
        ...mapGetters('checkoutAccordions', ['shippingAddressError']),
        ...mapGetters('attentionItems', ['attentionItemErrorMessages', 'footerMessages', 'validationCodes']),
        ...mapGetters('checkout', ['cashReceiptOptions', 'selectedPayMethod', 'selectedInvoice']),
        ...mapState('checkout', ['attentionItems', 'customerRiskData', 'endpointError', 'formattedBackDatingDate', 'hideDefaultPaymethodLink', 'hideDeleteDefaultPaymethodLink', 'hasTermsModal', 'isBackDated', 'isCrossCountry', 'isCn', 'isLoaded',
            'isPreferred', 'isFirstTimeCheckout', 'items', 'requiresCvv', 'selectedPayMethodId', 'selectedShippingOption', 'summary',
            'country', 'userFlags', 'shippingOptions', 'selectedShippingAddressId']),
        ...mapState('paymentMethod', ['storedPayMethods', 'storedApiLoading', 'storedApiCheckoutLoaded', 'paypalClientToken']),
        ...mapState('invoice', ['storedInvoices']),
        ...mapState('shippingAddress', { shippingAddressLoading: 'loading', addresses: 'addresses' }),
        ...mapState('sequentialSections', ['sequence']),

        addShippingAddressLink() {
            // Concat Origin and Pathname to prevent Query Strings
            const backTo = `${window.location.origin}${window.location.pathname}`;
            return `${this.getLocalizationProp('Data.Checkout.AddShippingAddressLink.Url')}?backTo=${backTo}`;
        },
        addPaymentLink() {
            // Concat Origin and Pathname to prevent Query Strings
            const backTo = `${window.location.origin}${window.location.pathname}`;
            return `${this.getLocalizationProp('Data.Checkout.AddPaymentLink.Url')}?backTo=${backTo}&fromCheckout=true&location=checkout`;
        },
        // This flag is specific to the checkout page
        addressEntryEnhancementEnabled() {
            return this.getLocalizationProp('Data.AddressEntryEnhancementEnabled');
        },
        backDatingText() {
            const text = this.getLocalizationProp('Labels.CheckoutItem.OrderBackDateText', null);
            return this.isBackDated && this.formattedBackDatingDate && text ? text.replace('{0}', this.formattedBackDatingDate) : null;
        },
        binNumber() {
            return this.selectedPayMethod.BinNumber;
        },
        browser() {
            return getBrowser(this.$custInfo?.uiCulture);
        },
        checkoutPreferencesLoading() {
            return this.storedApiLoading || this.shippingAddressLoading;
        },
        ccTotal() {
            return this.summary.ConvenienceCertificates?.FormattedUsed;
        },
        commitment() {
            return this.isPreferred ? this.summary.FormattedTotalCommitment : '0';
        },
        crossCountryModalRTE() {
            return this.replaceTokenArray(
                this.getLocalizationProp('Data.CrossCountryModal.RteDescription'),
                [this.crossCountryAddress?.newAddress?.CountryDisplayName, this.crossCountryAddress?.oldAddress?.CountryDisplayName]
            );
        },
        crossCountryModalContinue() {
            return this.replaceTokenArray(
                this.getLocalizationProp('Data.CrossCountryModal.ContinueToSite'),
                [this.crossCountryAddress?.newAddress?.CountryDisplayName]
            );
        },
        cvvErrorMessage() {
            return this.getLocalizationProp('Labels.Cvv.ErrorMessages.Empty');
        },
        cybersource() {
            return this.selectedPayMethod.CollectionsProcessorType === 'CyberSource';
        },
        explicitAttentionItems() {
            return {
                payMethodExpired: {
                    active: this.selectedPayMethod.Expired,
                    data: this.localization,
                    forceLoad: this.getLocalizationProp('Data.PayMethodExpired.Modal.ForceLoad', false),
                    snippet: this.getLocalizationProp('Data.PayMethodExpired.Snippets.Inline.RteContent'),
                    toggleLoad: true
                }
            };
        },
        getCheckoutData() {
            const checkoutData = [];

            this.items.forEach((item, i) => {
                checkoutData.push({
                    item_id: item?.Sku,
                    item_name: item?.Title || item?.FamilyTitle || '',
                    affiliation: 'Online_Store',
                    index: i,
                    price: this.viewPrice ? item?.PriceRange?.RawMinPreferredPrice : item?.PriceRange?.RawMinRegularPrice,
                    quantity: item?.Quantity
                });
            });

            return checkoutData;
        },
        getCartGrossTotal() {
            return this.summary?.FormattedCartGrossTotal || 0;
        },
        getSalesTax() {
            return this.summary?.FormattedSalesTax || 0;
        },
        getCartNetTotal() {
            return this.summary?.FormattedCartNetTotal || 0;
        },
        gstTaxLabel() {
            const gstLabel = this.getLocalizationProp('Labels.GSTLabel');
            return this.taxPercentageLabel(gstLabel);
        },
        getVatSubTotalLabel() {
            const vatSubTotalLabel = this.getLocalizationProp('Data.VATPopupModal.VATPopupSubTotal', 'Total before {0}% VAT');
            const taxRate = this.summary?.TaxBaseRate;
            if(vatSubTotalLabel && taxRate) {
                return replaceToken(vatSubTotalLabel, taxRate * 100);
            } else {
                return vatSubTotalLabel;
            }
        },
        getVatPointTotal () {
            const vatPointTotal = this.getLocalizationProp('Data.VATPopupModal.VATPopupTaxTotal', '{0}% VAT');
            const taxRate = this.summary?.TaxBaseRate;
            if(vatPointTotal && taxRate) {
                return replaceToken(vatPointTotal, taxRate * 100);
            } else {
                return vatPointTotal;
            }
        },
        hasCoa() {
            return this.summary.CreditOnAccount?.Balance > 0;
        },
        hasSequenceOpenError() {
            return this.activeSequenceErrorMessage !== null && this.showImprovedCTACheckout;
        },
        // Note showGstInOrderSummary is for the GST in the order summary section. Note that this replaces HideGST.
        // ShowGSTBelowTotal is used for the display of the GST Summary section below the order detail.
        showGstInOrderSummary() {
            return this.getLocalizationProp('Data.ShowGSTInOrderSummary', false);
        },
        hideSalesTax() {
            return this.getLocalizationProp('Data.HideSalesTax', false);
        },
        invalidCvv() {
            const minLength = this.getLocalizationProp('Data.Cvv.MinLength') || 0;
            return this.showCvv && (!this.cvvCode.length || this.cvvCode.length < minLength || isNaN(this.cvvCode));
        },
        isCCApplicable() {
            return this.summary.ConvenienceCertificates?.Used > 0;
        },
        isGuestShopping() {
            return this.userFlags ? !this.userFlags?.IsAuthenticated : false;
        },
        isKr() {
            return this.getLocalizationProp('Data.HideDollarsToActivate', false);
        },
        isMexico() {
            return Boolean(this.country && this.country.toLowerCase() === 'mexico');
        },
        isPoland() {
            return this.$env.Country === 'Poland' || false;
        },
        itemTotal() {
            const signMoney = this.summary?.FormattedCartGrossTotal.replace(/[0-9,\\.]+/, '');

            return this.isCn ? (this.summary?.TotalDiscount === 0 ? this.summary?.FormattedCartGrossTotal : signMoney + this.formatTotal(parseFloat(this.summary?.CartGrossTotal - this.summary?.TotalDiscount))) : this.summary?.FormattedCartGrossTotal;
        },
        lsdEarned() {
            return this.summary?.LoyaltyShoppingDollars?.FormattedEarnedThisOrder;
        },
        lsdTotal() {
            return this.summary.LoyaltyShoppingDollars?.FormattedUsed;
        },
        lsdUsed() {
            return this.summary?.LoyaltyShoppingDollars?.Used || 0;
        },
        modalInvalidShippingRte() {
            return this.shippingUnavailableAttentionItem?.Modal?.RteContent;
        },
        modalInvalidShippingLearnWhyText() {
            return this.shippingUnavailableAttentionItem?.Modal?.Labels.ShippingUnavailableLearnWhy;
        },
        modalInvalidShippingUnavailableText() {
            return this.shippingUnavailableAttentionItem?.Modal?.Labels.ShippingUnavailable;
        },
        modalInvalidShippingButtonChooseAddressText() {
            return this.shippingUnavailableAttentionItem?.Modal?.Data.ChooseAddressText;
        },
        modalInvalidShippingButtonVerifyAddressText() {
            return this.shippingUnavailableAttentionItem?.Modal?.Data.VerifyAddressLink.Text;
        },
        modalInvalidShippingButtonVerifyAddressUrl() {
            return `${this.shippingUnavailableAttentionItem?.Modal?.Data?.VerifyAddressLink?.Url}?addressid=${this.selectedShippingAddressId}`;
        },
        modalLabelsDeleteAddr() {
            return {
                ...this.getLocalizationProp('Labels.DeleteAddressModal', {}),
                ManageAddresses: this.getLocalizationProp('Data.Checkout.ManageShippingAddressLink.Text', ''),
                ManageAddressUrl: this.getLocalizationProp('Data.Checkout.ManageShippingAddressLink.Url', '')
            };
        },
        modalLabelsDeletePayMethod() {
            return {
                ...this.getLocalizationProp('Labels.DeletePayMethodModal', {}),
                ManagePayMethods: this.getLocalizationProp('Data.Checkout.ManagePayMethodsLink.Text', ''),
                ManagePayMethodsUrl: this.getLocalizationProp('Data.Checkout.ManagePayMethodsLink.Url', '')
            };
        },
        mxAddressEntryEnhancementEnabled() {
            return this.getLocalizationProp('Data.AddressEntryEnhancementEnabled');
        },
        needFurtherPaymentValidation() {
            return this.selectedPayMethod?.NeedFurtherPaymentValidation;
        },
        preferredSavings() {
            const text = this.getLocalizationProp('Labels.CheckoutSummary.YouSaved');
            return this.summary.FormattedPreferredSavings && text ? text.replace('{0}', this.summary.FormattedPreferredSavings) : null;
        },
        productDiscount() {
            return this.isCn ? this.summary.FormattedTotalDiscount : '';
        },
        puertoRicoBannerMessage() {
            const bannerContent = this.getLocalizationProp('Data.BannerMessages.PuertoRicoBannerMessage');
            return bannerContent ?? null;
        },
        redemptionFee() {
            return this.summary?.LsdRedemptionFee?.FormattedPrice;
        },
        rewardsConfigId() {
            return this.getLocalizationProp('Data.RewardTrackerId', null);
        },
        serviceTaxFormatted() {
            return this.summary?.ServiceTaxes?.[0]?.FormattedTaxAmount;
        },
        serviceTaxPercentageLabel() {
            const serviceTaxLabel = this.getLocalizationProp('Labels.ServiceTaxLabel');
            const taxRate = this.summary?.ServiceTaxes?.[0]?.TaxRate || 0;
            const formattedTax = (taxRate * 100).toFixed(0);
            return replaceToken(serviceTaxLabel, formattedTax);
        },
        shippingAddressCountry() {
            const selectedAddress = this.addresses.find((address) => address.AddressId === this.selectedShippingAddressId);
            return selectedAddress?.Country;
        },
        shippingAndHandling() {
            return this.getLocalizationProp('Data.ShippingAndHandling', 'How are shipping and handling cost calculated?\n\n This is the content for Shipping and handling');
        },
        shippingConfigId() {
            return this.getLocalizationProp('Data.ShippingOnUsTrackerId', null);
        },
        shippingUnavailableAttentionItem() {
            return this.attentionItems.filter(x => x.ValidationCode === 'OrderShipMethodChanged')[0];
        },
        shippingMessage() {
            const item = this.attentionItems?.find((item) => item.ShippingMessage === true);
            // Check for undefined/null
            if(!item) return;
            let message = item.Snippets?.Inline?.RteContent || '';
            const parameters = item.Snippets?.Parameters;
            if(parameters) {
                message = replaceTokenArray(message, parameters);
            }
            return message;
        },
        showBecomeMemberCard() {
            return !this.loading && !this.userFlags?.ViewMemberPricing && this.getLocalizationProp('Labels.BecomeMember');
        },
        showCoa() {
            return this.getLocalizationProp('Labels.Coa') && this.hasCoa && !this.isCrossCountry;
        },
        showCartSummary() {
            return !this.loading && !this.checkoutPreferencesLoading && !this.endpointError;
        },
        showConvenienceStorePayment() {
            return this.selectedPayMethod?.PayMethodType === paymentTypes.convenienceStore;
        },
        showCvv() {
            return (this.requiresCvv || this.isMexico) && this.payOptions.some(cardType => cardType.Name === this.selectedPayMethod?.PayMethodType) && !this.isTotalPaidWithCoa;
        },
        showCvvWhatIs() {
            return this.showCvv && this.getLocalizationProp('Labels.Cvv.CvvModal', false);
        },
        showLsdExpiringInCurrentMonth() {
            return this.summary.LoyaltyShoppingDollars && this.summary.LoyaltyShoppingDollars.LsdExpiringInCurrentMonth && !this.getLocalizationProp('Data.HideExpiringThisMonth');
        },
        showFpx() {
            return this.showVirtualPayment && this.selectedPayMethod?.CollectionsProcessorType === 'FPX3DPortal';
        },
        // Note that this is for the GST section at bottom, NOT in the order details
        showGstBelowTotal() {
            return this.summary?.FormattedSalesTax && this.getLocalizationProp('Data.ShowGSTBelowTotal', false);
        },
        // Note that this is for the VAT section at bottom
        showVatBelowTotal() {
            return this.summary?.FormattedSalesTax && this.getLocalizationProp('Data.ShowVatBelowTotal', false);
        },
        showGui() {
            return this.getLocalizationProp('Data.ShowGui', false);
        },
        showImprovedCTACheckout() {
            return this.getLocalizationProp('Data.ShowImprovedCTACheckout', false);
        },
        showInstallment() {
            if(this.$env.Country === 'Korea') {
                // in KR AllowedForInstallment set to false and PayMethodType set to "CreditCard" indicates it's a debit card
                return this.selectedPayMethod?.AllowedForInstallment || this.selectedPayMethod?.PayMethodType === 'CreditCard';
            }

            return this.selectedPayMethod?.AllowedForInstallment;
        },
        showLsdBanner() {
            if(this.summary.LoyaltyShoppingDollars && !this.userFlags?.IsGuest && ((this.isCn ? this.summary.LoyaltyShoppingDollars.Balance >= 0 : true) || this.isCn ? this.summary.LoyaltyShoppingDollars.Earned >= 0 : this.summary.LoyaltyShoppingDollars.Earned) && (this.isCn ? this.isPreferred : true)) {
                return true;
            } return false;
        },
        showLsdRedemptionFee() {
            return Boolean(this.summary?.LsdRedemptionFee?.Sku);
        },
        showMemberBenefitMessage() {
            return !!this.preferredSavings && this.isPreferred;
        },
        showPortal() {
            return this.selectedPayMethod.PayMethodType === paymentTypes.portal;
        },
        showPurchaseCommitment() {
            return this.userFlags?.ShowPurchaseCommitment;
        },
        // Sequence errors take precedence over backdating alerts
        showBackDatingText() {
            return this.backDatingText && (!this.showImprovedCTACheckout ||
                            !(this.showSequenceOpenErrorOnCheckout && this.activeSequenceErrorMessage));
        },
        shouldShowCvvErrorMessage() {
            return this.hasCvvError && this.invalidCvv;
        },
        showSequenceOpenError() {
            return this.showSequenceOpenErrorOnCheckout && this.activeSequenceErrorMessage !== null;
        },
        // For Guest Terms & Conditions
        showTermsConditions() {
            return !this.userFlags?.IsAuthenticated && this.userFlags?.IsGuest && this.userFlags?.IsGuestShoppingEnabled;
        },
        showDragonPay() {
            return this.selectedPayMethod?.PayMethodType === paymentTypes.dragonPayment;
        },
        showVAT() {
            return this.getLocalizationProp('Data.VAT.ShowVATPopup', false);
        },
        showVatInOrderSummary() {
            return this.getLocalizationProp('Data.VAT.ShowVATInOrderSummary', false);
        },
        showVirtualPayment() {
            return this.selectedPayMethod?.PayMethodType === paymentTypes.virtualPayment;
        },
        showWelcomeProgramLsd() {
            return this.summary?.WelcomeProgramLsdAvailable?.IsUserInWelcomeProgram || false;
        },
        staticShippingHandlingText() {
            return this.getLocalizationProp('Labels.StaticShippingHandlingText', false);
        },
        termsError() {
            return this.getLocalizationProp('Labels.TermsConditions.Error');
        },
        totalComp() {
            return this.newTotal ?? this.summary.CartNetTotal;
        },
        totalCompFormatted() {
            return this.newTotalFormatted ?? this.summary.FormattedCartNetTotal;
        },
        totalDiscount() {
            return this.isCn ? this.summary.TotalDiscount : 0;
        },
        useOrderData() {
            return this.getLocalizationProp('Data.UseOrderData', false);
        },
        vatLabel() {
            const vatLabel = this.getLocalizationProp('Data.VAT.VATInlineSummaryLabel', '{0}% VAT Inclusive');
            return this.taxPercentageLabel(vatLabel);
        },
        viewPrice() {
            return this.userFlags.ViewMemberPricing;
        },
        worldPay() {
            return this.selectedPayMethod.CollectionsProcessorType === 'WorldPay';
        },
        wholeNumbersOnly() {
            return this.localization?.Data?.WholeNumbersOnly || false;
        }
    },
    watch: {
        activeSequenceErrorMessage: {
            deep: true,
            handler(newValue, oldValue) {
                // Keep sequenceOpenErrorMessagesForStickyToast array up to date
                if(newValue !== null) {
                    // Replace old value with new value if it exists
                    const index = this.sequenceOpenErrorMessagesForStickyToast.indexOf(oldValue);
                    if(index !== -1) {
                        this.sequenceOpenErrorMessagesForStickyToast.splice(index, 1);
                    }
                    this.sequenceOpenErrorMessagesForStickyToast.push(newValue);
                } else {
                    // Remove old value when new value is null
                    this.sequenceOpenErrorMessagesForStickyToast = this.sequenceOpenErrorMessagesForStickyToast.filter(
                        message => message !== oldValue
                    );
                }
            }
        },
        apiErrors: {
            // Add or remove API errors from the sticky toast modal
            deep: true,
            handler(newValue) {
                if(newValue.length) {
                    newValue.map(error => {
                        this.additionalMessagesForStickyToast.push(error.Translation);
                    });
                } else {
                    this.additionalMessagesForStickyToast = [];
                }
            }
        },
        // Add back dating note to sticky toast
        backDatingText(newValue) {
            this.updateErrorMessagesArrayForStickyToastModal(
                newValue,
                this.backDatingText,
                this.additionalMessagesForStickyToast
            );
        },
        checkoutPreferencesLoading() {
            this.triggerOnLoadModals();
        },
        hasTermsError() {
            this.updateErrorMessagesArrayForStickyToastModal(this.hasTermsError, this.termsError, this.additionalMessagesForStickyToast);
        },
        shippingUnavailableAttentionItem() {
            if(this.shippingUnavailableAttentionItem) {
                this.hasShippingUnavailableError = true;
                this.SET_SHIPPING_ADDRESS_ERROR(true);
            } else {
                this.hasShippingUnavailableError = false;
                this.SET_SHIPPING_ADDRESS_ERROR(false);
            }
        },
        async selectedPayMethod(val) {
            if(val.PayMethodType === paymentTypes.portal && !this.portalData && !this.orderNumberCalled) {
                this.getPortalData();
            }
            // Check to see if the loadingOrder is false to prevent multiple calls to paypal especially
            // on the checkout-edit-account-info component
            if(val.PayMethodType === paymentTypes.payPal && this.loadingOrder === false) {
                this.loadingOrder = true;
                if(!this.paypalClientToken) {
                    await this.getPayPalClientToken();
                }
                await this.getPaypalDeviceData();
                this.loadingOrder = false;
            }
            this.getOtpData(val, this.payOptions);
        },
        payOptions(val) {
            this.getOtpData(this.selectedPayMethod, val);
        },
        ready() {
            this.triggerOnLoadModals();
            if(this.endpointError) {
                this.openServiceFailureModal();
            }
        },
        sequence: {
            deep: true,
            handler() {
                this.setActiveSequenceErrorMessage();
            }
        },
        shippingOnUsEnabled(val) {
            if(val) {
                this.getSOU({ rewardId: this.localization?.Data?.RewardTrackerId, shippingId: this.localization?.Data?.ShippingOnUsTrackerId });
            }
        },
        shouldShowCvvErrorMessage(newValue) {
            this.updateErrorMessagesArrayForStickyToastModal(newValue, this.cvvErrorMessage, this.additionalMessagesForStickyToast);
        }
    },
    async mounted() {
        const isCn = this.getLocalizationProp('Labels.IsCn') ? this.getLocalizationProp('Labels.IsCn') : false;
        this.$store.commit('checkout/SET_CN', isCn);
        this.$store.commit('paymentMethod/SET_CN', isCn);
        if(!this.items.length) await this.getData();
        window.addEventListener('scroll', this.handleScroll);
        // GA
        this.dataLayerPush();

        if(!this.isRiverbendCheckout) {
            await this.getCcPayOptions();
        }

        // Get Gui info on TW checkout page
        if(this.getLocalizationProp('Data.ShowGui')) {
            this.getGuiInfo();
        }

        if(!this.isRiverbendCheckout) {
            // Hides the modal from an external js file handled by BE
            window.closeCheckoutModal = async () => {
                await this.$modal.hide({id: 'otp-modal'});
                this.stopSubmitOtp = true;
                // Retain data when re-calling placeOrder after successful OTP verification.
                const shouldClearData = false;
                this.placeOrder(shouldClearData);
            };
        }
        this.loading = false;
        this.$nextTick(() => {
            this.ready = true;
        });
        if(this.isPayPalAllowed) {
            await this.getPayPalClientToken();
        }
    },
    destroyed() {
        document.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        ...mapActions('checkout', ['cancel', 'getData', 'putCheckout']),
        ...mapActions('checkoutAccordions', ['collapseShippingMethod', 'collapsePaymentMethod', 'collapseShippingAddress', 'expandShippingAddress', 'openAccordionModal']),
        ...mapMutations('checkoutAccordions', ['SET_SHIPPING_ADDRESS_ERROR']),
        ...mapActions('shippingOnUsV2', ['getSOU']),
        ...mapActions('paymentMethod', ['getPayPalClientToken']),

        replaceTokenArray,
        checkCity(payload) {
            (payload) ? this.isPuertoRico = true : this.isPuertoRico = false;
        },
        coaApply(val, signMoney, signMoneyindex) {
            // Coa
            this.coa = parseFloat(val);
            const formattedVal = this.formatTotal(val);
            this.coaFormatted = signMoneyindex === 'ini' ? `-${(signMoney + formattedVal)}` : `-${(formattedVal + signMoney)}`;

            if(this.coa === this.summary.CartNetTotal) {
                this.isTotalPaidWithCoa = true;
            }

            // Total
            const oldTotal = this.summary.CartNetTotal;
            const oldTotalMinusCoa = this.formatTotal(parseFloat(oldTotal - this.coa));

            // parseFloat 'breaks' on commas, so we need to remove them first before passing to OrderTotal
            // For cases where COA is applied and it is a WholeNumberCountry (like Japan), this function removes comma before passing to OrderTotal
            if(oldTotalMinusCoa.includes(',')) {
                this.newTotal = oldTotalMinusCoa.replace(',', '');
            } else {
                this.newTotal = oldTotalMinusCoa;
            }

            this.newTotalFormatted = signMoneyindex === 'ini' ? (signMoney + oldTotalMinusCoa) : (oldTotalMinusCoa + signMoney);

            // Subtotal
            this.subTotal = this.summary.FormattedCartNetTotal;
        },
        coaReset(val) {
            this.coa = null;
            this.coaFormatted = null;
            this.isTotalPaidWithCoa = false;
            this.newTotal = null;
            this.newTotalFormatted = null;
            this.subTotal = null;
        },
        deletingPayMethod(val) {
            this.isDeletingPayMethods = val;
        },
        formatTotal(total) {
            const culture = this.$custInfo.uiCulture || 'en-US';
            if(this.wholeNumbersOnly) {
                const totalFormatted = Number(total).toFixed(0);
                return Number(totalFormatted).toLocaleString(culture);
            } else {
                if(culture === 'fr-CA') { // Bug 167106
                    // With explicit fraction digits, maintain 2 decimal places
                    const totalFormatted = new Intl.NumberFormat(culture, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total);
                    return totalFormatted;
                }
                return Number(total).toFixed(2);
            }
        },
        async getCcPayOptions() {
            // Get all available creditCard payment methods
            const payMethodResponse = await payMethodsApi.get();
            if(payMethodResponse.success) {
                const data = payMethodResponse.data?.Data;
                this.paymentIndex = data?.PayMethods.findIndex((method) => method.Paymethod === 'CreditCard');
                if(this.paymentIndex > -1) {
                    const creditCardOptions = data.PayMethods[this.paymentIndex].Options;
                    creditCardOptions.push({ Name: cardNumber.cardBrands.all });
                    this.payOptions = creditCardOptions;
                }
            }
        },
        async getGuiInfo() {
            const guiInfo = await guiInfoApi.get();
            if(guiInfo.success) {
                this.guiCarrierTypes = guiInfo.data?.Data?.Carriers || [];
                this.donationCode = guiInfo.data?.Data?.DonationCode;
            }
        },
        async getOtpData(selectedPayMethod, payOptions) {
            if(this.selectedPayMethodId && selectedPayMethod &&
                (this.cybersource || this.worldPay) &&
                 payOptions.some(card => card.Name === selectedPayMethod.PayMethodType)) {
                // Get the JWT token data to be retrieved asynchronously
                try {
                    await this.getJwtTokenData();
                    await this.$nextTick();
                    await this.$refs['otp']?.submitToken();
                } catch (error) {
                    console.error('Error getting OTP token:', error);
                }
            }
        },
        getPaypalDeviceData() {
            window.braintree?.client?.create(
                {
                    authorization: this.paypalClientToken
                },
                (clientErr, clientInstance) => {
                    if(clientErr) {
                        console.error('Error creating client: ', clientErr);
                        return;
                    }
                    // Initialize device data collection
                    window.braintree?.dataCollector?.create({
                        client: clientInstance,
                        paypal: true
                    }, (dataCollectorErr, dataCollectorInstance) => {
                        if(dataCollectorErr) {
                            console.error('Error creating data collector:', dataCollectorErr);
                            return;
                        }
                        this.deviceData = dataCollectorInstance?.deviceData;
                    });
                }
            );
        },
        handleInstallmentOptions(params) {
            this.cardChoice = params.card;
            this.installmentChoice = params.installment;
        },
        handleStickyToast(isCartTotalInView) {
            this.showStickyToast = !isCartTotalInView;
        },
        openCannotShipToAddressModal() {
            this.$modal.show({ id: 'modal-invalid-shipping' });
        },
        openCvvModal() {
            this.$modal.show({ id: 'modal-cvv' });
        },
        onChooseAddressButtonClick() {
            this.expandShippingAddress();
            this.$modal.hide({ id: 'modal-invalid-shipping' });
        },
        onConvenienceStoreUpdate({ store, hasError }) {
            this.hasConvenienceStoreError = hasError;
            this.storeChoice = store;
        },
        onFpxUpdate({ bankId, hasError }) {
            this.fpxBankId = bankId;
            this.hasFpxPaymentError = hasError;
        },
        onVirtualPaymentUpdate({ bank, hasError, receipt, referenceNumber }) {
            this.bankChoice = bank;
            this.hasVirtualPaymentError = hasError;
            this.receiptChoice = receipt;
            this.referenceNumber = referenceNumber;
        },
        onSessionIdAvailable(sessionId) {
            this.loadingOrder = false;
            this.otpSessionID = sessionId;
        },
        openCrossCountryAddress(payload) {
            this.crossCountryAddress = payload;
            this.crossCountryAddressLoading = false;
            this.$modal.show({ id: 'modal-cross-country-address' });
            this.$modal.$on.hidden(() => {
                this.cancelCrossCountryAddress();
            });
        },
        openServiceFailureModal() {
            this.$modal.show({ id: 'modal-service-failure' });
        },
        // If PromotionGroup = "ReactivationIncentive", do not need to check for PromotionType
        // If PromotionGroup = "WelcomeGift" or "VIP", do need to check for PromotionType = "FreeGift"
        showFree(item) {
            const isWelcomeOrVip = item.PromotionGroup === 'WelcomeGift' || item.PromotionGroup === 'VIP';
            return (item.PromotionGroup === 'ReactivationIncentive') || (isWelcomeOrVip && item.PromotionType === 'FreeGift');
        },
        // Guest Modal
        showTermsConditionsModal() {
            this.$modal.show({ id: 'terms-conditions' });
        },
        setActiveSequenceErrorMessage() {
            const activeSequence = this.sequence.find(seq => seq.isActive);
            if(activeSequence) {
                // Reset sequence open error on reactive updates.
                // Error is shown ONLY on Place Order click.
                this.showSequenceOpenErrorOnCheckout = false;

                // Iterate over all the references in the component
                // All refs because we have multiple sequence components and we need to target the one which is active
                Object.keys(this.$refs).forEach(ref => {
                    // Check if the reference is a Sequence component and matches the active sequence index
                    if(this.$refs[ref]?.$options?._componentTag === 'OSequentialSection' &&
                        this.$refs[ref]?._props['sequenceIndex'] === activeSequence.index) {
                        const activeRef = ref.toLowerCase();
                        // Find the corresponding error message key from localization properties
                        const errorMessageKey = Object.keys(this.getLocalizationProp('Labels.PlaceOrderCTAErrorMessages', {}))
                            .find(key => key.toLowerCase() === activeRef);
                        // Set the active error message if a matching key is found, otherwise set it to null
                        this.activeSequenceErrorMessage = errorMessageKey
                            ? this.getLocalizationProp(`Labels.PlaceOrderCTAErrorMessages.${errorMessageKey}`, '') : null;
                        if(this.showImprovedCTACheckout && errorMessageKey && (!this.hasShippingAddress || !this.hasPayMethod)) {
                            this.activeSequenceErrorMessage = null;
                        }
                    }
                });
            } else {
                this.activeSequenceErrorMessage = null;
            }
        },
        taxPercentageLabel(label) {
            if(label && this.summary?.TaxBaseRate) {
                const formattedTax = (this.summary?.TaxBaseRate * 100).toFixed(0);
                return replaceToken(label, formattedTax);
            } else {
                return label;
            }
        },
        termsConditions() {
            this.termsIsChecked = !this.termsIsChecked;
            this.hasTermsError = false;
        },
        // International Modal
        showTermsConditionsModalIntl() {
            this.openAccordionModal();
            // this.$modal.show({id: 'terms-conditions-intl'});
        },
        cancelCrossCountryAddress() {
            if(this.crossCountryAddress?.newAddress) {
                this.$store.commit('checkout/SET_CROSS_COUNTRY_OLD_ADDRESS_INDEX', this.crossCountryAddress.oldAddressIndex);
                this.crossCountryAddress = {
                    newAddress: null,
                    oldAddress: null,
                    oldAddressIndex: null,
                    loading: false
                };
            }
        },
        async continueCrossCountryAddress() {
            if(this.crossCountryAddress?.newAddress) {
                this.crossCountryAddressLoading = true;

                // Update checkout API
                const response = await this.updateInfo({
                    ShippingAddressId: this.crossCountryAddress.newAddress.AddressId,
                    Country: this.crossCountryAddress.newAddress.Country,
                    WithinCurrentCountry: this.crossCountryAddress.newAddress.WithinCurrentCountry,
                    WarehouseGroupName: this.crossCountryAddress.newAddress.WarehouseGroupName,
                    GetResponse: true
                });

                // Redirect to cross country checkout page
                if(response?.data?.Success && response?.data?.Data?.CheckoutPage?.Url) {
                    window.location.href = response.data.Data.CheckoutPage.Url;
                }
            }
        },
        async submitDragon(orderNum) {
            let data;
            const params = {
                collectionProcessorType: 'DragonPay3DPortal',
                orderNumber: orderNum,
                paymentId: this.selectedPayMethodId
            };
            const response = await externalPaymentApi.post(params);
            if(response?.data?.Success) {
                data = response?.data?.Data?.requestForm;
                this.dragonData = {
                    action: data?.action,
                    method: data?.method,
                    ...data?.inputs
                };
            } else {
                this.dragonData = null;
            }
        },
        async submitFpx(orderNum) {
            let data;
            const params = {
                collectionProcessorType: 'FPX3DPortal',
                orderNumber: orderNum,
                paymentId: this.selectedPayMethodId,
                bankId: this.fpxBankId
            };
            const fpxResponse = await externalPaymentApi.post(params);
            if(fpxResponse?.data?.Success) {
                data = fpxResponse?.data?.Data?.requestForm;
                this.fpxData = {
                    action: data?.action,
                    method: data?.method,
                    ...data?.inputs
                };
            } else {
                this.fpxData = null;
            }
        },
        async submitOtp() {
            let data;
            let params;
            // UseOrderData is flag for when collectionProcessorType is CyberSource
            if(this.useOrderData) {
                if(!this.orderData && !this.orderNumberCalled) {
                    await this.getOrderIdAndNum();
                }
                params = {
                    orderId: this.orderData.orderId,
                    orderNumber: this.orderData.orderNumber,
                    PayMethodID: this.selectedPayMethodId,
                    CvvCode: this.cvvCode || null,
                    CollectionsProcessorType: this.selectedPayMethod?.CollectionsProcessorType,
                    ...(this.customerRiskData && {
                        CustomerRiskData: this.customerRiskData
                    }),
                    dfReferenceId: this.otpSessionID,
                    amount: parseFloat(this.totalComp),
                    browser: this.browser
                };
            } else {
                params = {
                    PayMethodID: this.selectedPayMethodId,
                    CvvCode: this.cvvCode || null,
                    CollectionsProcessorType: this.selectedPayMethod?.CollectionsProcessorType,
                    ...(this.customerRiskData && {
                        CustomerRiskData: this.customerRiskData
                    }),
                    dfReferenceId: this.otpSessionID,
                    amount: parseFloat(this.totalComp),
                    browser: this.browser
                };
            }
            params.Country = this.shippingAddressCountry;
            const otpResponse = await otpApi.post(params);
            if(otpResponse?.data?.Success) {
                this.showOtp = true;
                data = otpResponse?.data?.Data;
                this.otpData = {
                    JournalKey: data?.JournalKey,
                    IsDSVerificationRequired: data?.IsDSVerificationRequired,
                    MachineCookie: data?.MachineCookie,
                    ThreeDSChallengeToken: data?.ThreeDSChallengeToken,
                    ThreeDSTransactionId: data?.ThreeDSTransactionId,
                    StepUpUrl: data?.StepUpUrl
                };
            } else {
                this.showOtp = false;
                this.otpData = null;

                // display API error message
                this.apiErrors = otpResponse?.data?.ErrorMessages;
            }
            return otpResponse;
        },
        async getJwtTokenData() {
            let data;
            const requestUrl = this.getLocalizationProp('Data.ThreeDSDDCRequestUrl', 'https://centinelapistag.cardinalcommerce.com/V1/Cruise/Collect');
            const listenUrl = this.getLocalizationProp('Data.ThreeDSDDCListenUrl', 'https://centinelapistag.cardinalcommerce.com');
            const response = await getJwtToken.get();
            if(response?.data?.Success) {
                data = response?.data?.Data;
                this.otpTokenInfo = {
                    jWTToken: data,
                    binNumber: this.binNumber,
                    requestUrl: requestUrl,
                    listenUrl: listenUrl
                };
                this.loadingOrder = true;
            } else {
                this.otpTokenInfo = null;
            }
        },
        async getOrderIdAndNum() {
            let data;
            const response = await getOrderNum.get();
            if(response?.data?.Success) {
                data = response?.data?.Data;

                this.orderData = {
                    orderId: data?.OrderId,
                    orderNumber: data?.OrderNumber
                };
                this.orderNumberCalled = true;
            } else {
                this.orderData = null;
            }
        },
        async getPortalData() {
            let data;
            const response = await getOrderNum.get();
            if(response?.data?.Success) {
                data = response?.data?.Data;

                this.portalData = {
                    cartTotal: this.summary?.CartNetTotal,
                    customerId: data.CustomerId,
                    customerName: data.CustomerName,
                    mallId: data.MallId,
                    orderId: data.OrderId,
                    orderNumber: data.OrderNumber,
                    paymentId: this.selectedPayMethodId,
                    responseUrl: data.ResponseUrl,
                    userId: data.UserName
                };
                this.orderNumberCalled = true;
            } else {
                this.portalData = null;
            }
        },
        handleErrorStatus(data) {
            this.showPaymentDeclineMessage = data?.ShowPaymentDeclineMessage;
            if(data?.ShowPaymentDeclineMessage && data?.DetailedErrorMessage) {
                // Handle detailed decline message
                this.apiErrors.push({
                    Original: data?.MessageCode || 'Unknown',
                    Translation: data?.DetailedErrorMessage
                });
            } else if(data.ErrorMessage) {
                this.paymentFailedModal = {
                    title: data?.ErrorMessage.Header,
                    description: data?.ErrorMessage.Body,
                    cta: this.getLocalizationProp('Labels.PaymentFailedModal.Cta', null)
                };
                this.$modal.show({ id: 'modal-payment-failed' });
                this.loadingOrder = false;
            }
            this.loadingOrder = false;
        },
        handleInteger(event, payload) {
            if(payload && payload.model) {
                const regex = new RegExp('^[0-9]+$');
                const keyCode = event.keyCode ? event.keyCode : event.which;
                const key = event.key;

                if(!this.allowedKeys.includes(keyCode) && !event.ctrlKey) {
                    // If NOT integer blocks the key
                    if(!regex.test(key)) {
                        event.preventDefault();
                    }
                }
            }
        },
        async handleProcessOwingBalance(data) {
            const payMethodInfoData = this.$refs.payMethodInfoRef?.getInfo() || {};
            const processOwingBalanceParams = {
                OrderIds: [data?.OrderId],
                PayMethodId: this.selectedPayMethod?.PayMethodId,
                CollectionsProcessorType: this.selectedPayMethod?.CollectionsProcessorType,
                CvvCode: this.cvvCode,
                ThreeDSCustomerEmail: payMethodInfoData?.email,
                ThreeDSCustomerMobileNumber: payMethodInfoData?.phoneNumber
            };
            const processOwingBalanceResponse = await apiSubmitPayment.post(processOwingBalanceParams);
            // Either `processOwingBalanceResponse.success` or `processOwingBalanceResponse.data?.Success` is false, will jump to the payment failure page.
            let redirectUrl = this.getLocalizationProp('Data.Checkout.PaymentFailurePage.Url');
            if(processOwingBalanceResponse.success && processOwingBalanceResponse.data?.Success) {
                if(processOwingBalanceResponse.data?.Data?.IsPaymentSuccessfulAlready) {
                    // IsPaymentSuccessfulAlready then redirect to receipt page
                    redirectUrl = this.getLocalizationProp('Data.Checkout.ReceiptUrl') + data.OrderNumber;
                } else if(processOwingBalanceResponse.data?.Data?.AdditionalVerificationRequired) {
                    redirectUrl = processOwingBalanceResponse.data?.Data?.StepUpUrl;
                }
            }

            return redirectUrl;
        },
        handleScroll() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

            // Notice and banner float banner CN only
            if(this.isCn) {
                let scrollBannerTipH = this.$refs.scrollBannerTip.offsetTop;
                if(scrollTop > scrollBannerTipH) {
                    this.scrollBannerTip = 'p-checkout__bannerTip';
                } else {
                    this.scrollBannerTip = '';
                }
            }
            //  Ship address float
            if(this.selectedShipAddress && this.isCn) {
                let scrollAddressTipH = this.$refs.scrollBannerTip.offsetTop;
                if(scrollTop > scrollAddressTipH) {
                    this.scrollAddressTip = 'p-checkout__tip__ship-address';
                } else {
                    this.scrollAddressTip = '';
                }
            }
        },
        onPortalPaymentUpdate(params) {
            this.cardChoice = params.card;
            this.installmentChoice = params.installment;
        },
        async placeOrder(shouldClearData = true) {
            // validate pay method info if needed
            if(this.needFurtherPaymentValidation) {
                this.$refs.payMethodInfoRef.validate();
                if(!this.isPayMethodInfoValid) {
                    return;
                }
            }

            // prevent placing order if any sequence is open:
            if(this.hasSequenceOpenError) {
                this.showSequenceOpenErrorOnCheckout = true;
                return;
            }
            // clear all api errors
            this.apiErrors.length && (this.apiErrors = []);

            // Clear the data if the user clicks on the place order button as we need to get new information from the API
            if(shouldClearData && this.worldPay) {
                this.stopSubmitOtp = false;
                if(this.otpData) this.otpData.ThreeDSTransactionId = undefined;
            }

            // prevent placing order if shipping address is invalid:
            if(this.hasShippingUnavailableError) {
                this.openCannotShipToAddressModal();
                return;
            }

            if(this.invalidCvv && !this.isTotalPaidWithCoa) {
                this.hasCvvError = true;
                return;
            }

            if(!this.userFlags?.IsAuthenticated && this.userFlags?.IsGuest && !this.termsIsChecked) {
                this.hasTermsError = true;
                return;
            }

            // Set Installment Options
            if(this.showInstallment && this.selectedPayMethod.PayMethodType === paymentTypes.portal && this.cardChoice === null && !this.isTotalPaidWithCoa) {
                this.$refs['installment'].$emit('show-error');
                this.hasInstallmentError = true;
                return;
            }

            if(this.showConvenienceStorePayment) {
                this.$refs['convenience-store'].$emit('check-error');
            }

            if(this.showConvenienceStorePayment && this.hasConvenienceStoreError && !this.isTotalPaidWithCoa) {
                this.$refs['convenience-store'].$emit('show-error');
                return;
            }

            if(this.showInstallment && !this.installmentChoice) {
                this.hasInstallmentError = true;
                return;
            }

            if(this.showVirtualPayment && this.hasVirtualPaymentError) {
                this.$refs['virtual-payment'].$emit('show-error');
                return;
            }

            if(this.showFpx && this.hasFpxPaymentError && !this.isTotalPaidWithCoa) {
                this.$refs['fpx-bank'].$emit('show-error');
                return;
            }

            if(this.selectedPayMethod.PayMethodType === paymentTypes.portal && this.cardChoice !== null) {
                this.$refs['portal'].showPopup();
                return;
            }

            this.loadingOrder = true;
            this.hasCvvError = false;
            this.paymentFailedModal = {
                title: null,
                description: null,
                cta: null
            };
            const params = {
                Carrier: this.isCn ? 'None' : this.selectedShippingOption.Carrier,
                CvvCode: this.cvvCode || null,
                ShippingFeeTotal: this.selectedShippingOption.ShipMethodQuote,
                OrderTotal: parseFloat(this.totalComp),
                CreditOnAccount: this.summary.CreditOnAccount.Balance,
                CreditOnAccountUsed: this.coa,
                LoyaltyShoppingDollars: this.summary.LoyaltyShoppingDollars.Used + this.summary.ConvenienceCertificates.Used,
                PueExemption: this.summary.PueExemption || null,
                OrderTakenBy: orderTakenBy(),
                Installment: this.installmentChoice,
                VirtualCreditCardId: this.cardChoice,
                PayMethodType: this.selectedPayMethod?.PayMethodType,
                DfReferenceId: this.otpSessionID,
                ThreeDSTransactionId: this.otpData?.ThreeDSTransactionId,

                // conditional worldpay params
                ...(this.worldPay && {
                    ...(this.customerRiskData && !this.stopSubmitOtp && {
                        CustomerRiskData: this.customerRiskData
                    }),
                    MachineCookie: this.otpData?.MachineCookie,
                    OrderId: this.otpData?.OrderId,
                    OrderNumber: this.otpData?.OrderNumber,
                    ...(!this.stopSubmitOtp && {
                        Browser: this.browser,
                        JournalKey: this.otpData?.JournalKey
                    })
                }),

                // conditional convenience store params
                ...(this.showConvenienceStorePayment && {
                    SelectedCvsStoreId: this.storeChoice
                }),

                // PayPal/Braintree
                ...(this.deviceData && {
                    DeviceData: this.deviceData
                }),

                // Fpx
                ...(this.showFpx && {
                    BankId: this.fpxBankId
                }),

                // Gui Carrier
                ...(this.showGui && {
                    GuiCarrierType: this.selectedGui
                }),

                // conditional virtual payment params
                ...(this.showVirtualPayment ? {
                    FinancialInstitutionId: this.bankChoice,
                    CashReceipt: this.receiptChoice,
                    CashReferenceNumber: this.referenceNumber
                } : {})
            };

            // Pay method params used by CN
            if(this.isCn) {
                params.CollectionsProcessorType = this.selectedPayMethod.CollectionProcessorType;
                params.requireChineseInvoicePdf = this.requireChineseInvoicePdf || false;
            }

            if(this.cybersource || this.needFurtherPaymentValidation) {
                params.CollectionsProcessorType = this.selectedPayMethod.CollectionsProcessorType;
            }
            if(this.worldPay) {
                params.CollectionsProcessorType = this.selectedPayMethod.CollectionsProcessorType;
            }

            if(!this.stopSubmitOtp && this.useOrderData && this.cybersource &&
            this.payOptions.some(card => card.Name === this.selectedPayMethod.PayMethodType && !this.isTotalPaidWithCoa)) {
                await this.$nextTick();
                if(!this.otpSessionID) await this.$refs['otp'].submitToken(); // Bug 139170 - This prevents DReferenceId getting passed as null
                const otpResponse = await this.submitOtp();
                if(otpResponse?.data?.ErrorMessages?.length > 0) {
                    this.loadingOrder = false;
                    return;
                }
                await this.$nextTick();
                if(this.otpData.IsDSVerificationRequired) {
                    this.$refs['otp'].submitForm();
                    this.loadingOrder = false;
                    return;
                }
                params.OrderId = this.orderData?.orderId;
                params.OrderNumber = this.orderData?.orderNumber;
                params.JournalKey = this.otpData?.JournalKey;
            }

            const response = await api.post(params);
            if(response.success && response.data?.Data) {
                const data = response.data.Data;
                let redirectUrl = null;
                if(data.IsOSCProcessing) {
                    redirectUrl = this.getLocalizationProp('Data.OrderProcessing.OrderProcessingPageLink.Url', null);
                } else if(data.RequireExternalProcessing && this.isCn) {
                    redirectUrl = this.getLocalizationProp('Data.ExternalPayment.ExternalPaymentPageLink.Url', null) + '?orderNumber=' + data.OrderNumber + '&payMethodId=' + this.selectedPayMethodId;
                } else if(data.Status !== 'Error') {
                    redirectUrl = this.getLocalizationProp('Data.Checkout.ReceiptUrl', null) + data.OrderNumber;
                } else if(data.Status === 'Error') {
                    if(data?.AdditionalVerificationRequired) {
                        this.showOtp = true;
                        if(!this.otpSessionID) await this.$refs['otp'].submitToken();
                        !this.worldPay && this.$refs['otp'].submitForm();
                        const worldPayData = data?.WorldPay;
                        this.otpData = {
                            OrderId: data?.OrderId,
                            OrderNumber: data?.OrderNumber,
                            JournalKey: data?.JournalKey || worldPayData?.JournalKey,
                            IsDSVerificationRequired: data?.IsDSVerificationRequired || worldPayData?.IsDSVerificationRequired,
                            MachineCookie: worldPayData?.MachineCookie,
                            ThreeDSChallengeToken: worldPayData?.ThreeDSChallengeToken,
                            ThreeDSTransactionId: worldPayData?.ThreeDSTransactionId,
                            StepUpUrl: worldPayData?.StepUpUrl
                        };
                        // Worldpay needs to call submitForm after setting the otpData.
                        this.worldPay && this.$nextTick(() => {
                            this.$refs['otp'].submitForm();
                        });
                    } else this.handleErrorStatus(data);
                }
                if(data.Status !== 'Error' && this.selectedPayMethod.PayMethodType === paymentTypes.virtualPayment &&
                    !this.fpxData && this.showFpx && this.fpxBankId && data && data.OrderNumber &&
                    data.RequireExternalProcessing) {
                    await this.submitFpx(data.OrderNumber);
                    this.$refs['fpx'].submit();
                    return;
                }
                if(data.Status !== 'Error' && !this.dragonData && this.showDragonPay && data && data.OrderNumber && data.RequireExternalProcessing) {
                    await this.submitDragon(data.OrderNumber);
                    this.$refs['dragon'].submit();
                    return;
                }
                if(data.Status !== 'Error' && this.needFurtherPaymentValidation) {
                    redirectUrl = await this.handleProcessOwingBalance(data);
                }

                if(redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    this.loadingOrder = false;
                }
            } else {
                this.loadingOrder = false;
            }
        },
        reloadPage: function () {
            window.location.reload();
        },
        triggerOnLoadModals() {
            if(this.ready && !this.checkoutPreferencesLoading) {
                this.$nextTick(() => {
                    this.$refs['checkout-attention-items']?.$emit('onLoad');
                });
            }
        },
        uniqid(id) {
            return `${id}-${uniqid()}`;
        },
        updateCoa() {
            const checkoutCoa = this.$refs.checkoutCoa;
            if(checkoutCoa?.inputValue && !checkoutCoa?.error) {
                checkoutCoa.applyCoa();
            }
        },
        updateCvv(value) {
            this.cvvCode = value;
        },
        // add/remove errors on sticky toast modal
        updateErrorMessagesArrayForStickyToastModal(condition, errorMessage, errorList) {
            const indx = errorList.indexOf(errorMessage);
            if(condition && indx === -1) {
                errorList.push(errorMessage);
            } else if(indx !== -1) {
                errorList.splice(indx, 1);
            }
        },
        updateInvoice(params) {
            this.requireChineseInvoicePdf = params.isInvoiceSelected;
        },
        updateInvoiceType(params) {
            this.invoiceUpdated = params;
            setTimeout(() => {
                this.invoiceUpdated = false;
            }, 500);
        },
        async updateInfo(params) {
            if(this.loading) {
                this.cancel();
            }

            this.loading = true;

            if(params.PayMethodId) {
                const payment = this.storedPayMethods.find(method => method.PayMethodId === params.PayMethodId);
                const type = payment?.PayMethodType;
                if(type && type === 'WireTransferFromCustomer') {
                    if(this.isPoland) {
                        this.$modal.show({ id: 'modal-poland-wire-transfer' });
                    } else {
                        this.$modal.show({ id: 'modal-rap-deposit' });
                    }
                }
                // ToDo: Refactor with real payment type
                if(type && type === paymentTypes.portal) {
                    this.getPortalData();
                }
            }

            if(params.ShipMethod && !this.isCn) {
                this.collapseShippingMethod();
            } else if(params.ShippingAddressId) {
                this.hasFirstTimeCheckoutError = false;
                // Updated shipOption and shipAddress used for CN
                if(this.isCn) {
                    params.ShipMethod = this.selectedShippingOption.ShipMethod;
                }

                this.collapseShippingAddress();
            } else if(params.PayMethodId) {
                this.collapsePaymentMethod();
            }

            if(params.GetResponse) {
                const response = await this.putCheckout(params);
                return response;
            } else {
                const cancelled = await this.putCheckout(params);
                if(!cancelled) {
                    this.updateCoa();
                    this.loading = false;
                    this.isInvoiceAttention = false;
                }
            }
        },
        updateShipAddress(address) {
            if(address) {
                // Float banner when user selected a ship address in mobile checkout page used in CN
                this.selectedShipAddress = this.getLocalizationProp('Labels.ShippingAddress.Name', null) + address?.Province + address?.City + (address?.AddressLine1 ? address?.AddressLine1 : '') + (address?.AddressLine2 ? address?.AddressLine2 : '') + (address?.AddressLine3 ? address?.AddressLine3 : '');
                // Set selectedShippingOption according to selectedShippingAddress used for CN
                const defaultCarrier = address.DefaultCarrier;
                const defaultShipMethod = address.DefaultShipMethod;
                const shippingOptionIndex = this.shippingOptions.findIndex((option) => { return option.Carrier === defaultCarrier && option.ShipMethod === defaultShipMethod; });
                this.$store.commit('checkout/SET_SELECTED_SHIP_OPTION', shippingOptionIndex);
            }
        },
        dataLayerPush() {
            window.dataLayer && window.dataLayer.push({
                'event': 'add_shipping_info',
                'ecommerce': {
                    'currency': this.$env?.CurrencyCode || '',
                    'value': this.summary?.CartNetTotal || 0,
                    'shipping_tier': this.selectedShippingOption.ShipMethod,
                    'items': [...this.getCheckoutData]
                }
            });
        },
        openVATModal() {
            this.$modal.show({id: 'vat-popup'});
        },
        closeVATModal() {
            this.$modal.hide({id: 'vat-popup'});
        },
        setGuiCarrierType(selectedGui) {
            this.selectedGui = selectedGui;
        }
    }
};
