import { mapGetters, mapState } from 'vuex';

export default {
    props: {
        deleteLabel: {
            type: String,
            default: 'Delete'
        },
        editLabel: {
            type: String,
            default: 'Edit'
        },
        editLink: {
            type: String,
            default: null
        },
        editGuestLink: {
            type: String,
            default: null
        },
        expiresLabel: {
            type: String,
            default: 'Expires'
        },
        expiredLabel: {
            type: String,
            default: 'Expired'
        },
        errorAriaLabel: {
            type: String,
            default: 'Error attention required'
        },
        hideDefaultPaymethodLink: {
            type: Boolean,
            default: false
        },
        hideDeleteDefaultPaymethodLink: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            required: true
        },
        isGuest: {
            type: Boolean,
            default: false
        },
        modalLabelsDeletePayMethod: {
            type: Object,
            default: () => {
                return {
                    'DeletePayMethodHeading': 'Are you sure?',
                    'DeletePayMethodDetails': 'Deleting this credit card cannot be undone.',
                    'DeletePayMethodDefaultHeading': 'Sorry.',
                    'DeletePayMethodDefaultDetails': 'You cannot delete a Default Payment Method. Edit another payment method and make it the default.',
                    'DeletePayMethodSelectedHeading': 'Sorry.',
                    'DeletePayMethodSelectedDetails': 'The selected pay method can not be deleted. Please choose a different pay method.',
                    'DeletePayMethodSelectedAction': 'Choose another pay method',
                    'Cancel': 'cancel',
                    'Delete': 'delete'
                };
            }
        }
    },
    data() {
        return {
            selectedIndex: null,
            payMethodToDelete: {}
        };
    },
    computed: {
        ...mapGetters('checkout', ['selectedPayMethod']),
        ...mapGetters('checkoutAccordions', ['onExpandPaymentMethod', 'onCollapsePaymentMethod', 'paymentMethodError']),
        ...mapState('checkout', ['selectedPayMethodId']),
        ...mapState('paymentMethod', ['storedPayMethods', 'storedApiLoading', 'storedExternalPayMethods']),

        isCn() {
            return this.$env.IsCn;
        },
        payMethodsSorted() {
            let payMethods = [];
            if(this.isCn) {
                payMethods = this.storedExternalPayMethods?.PayMethods || [];
            } else {
                payMethods = [...this.storedPayMethods] || [];
                // Sort by IsMelaleucaCard
                payMethods.sort((a, b) => b.IsMelaleucaCard - a.IsMelaleucaCard);
            }
            return payMethods;
        }
    },
    watch: {
        storedApiLoading() {
            this.setSelectedIndex();
        },
        selectedIndex(val, oldval) {
            if(val !== oldval) {
                this.updateSelectedIndex();
            }
        },
        selectedPayMethodId() {
            this.setSelectedIndex();
        }
    },
    mounted() {
        this.onExpandPaymentMethod(this.expand);
        this.onCollapsePaymentMethod(this.collapse);
        this.checkoutOption();
        this.setSelectedIndex();
    },
    methods: {
        checkoutOption() {
            window.dataLayer && window.dataLayer.push({
                'event': 'checkoutOption',
                'ecommerce': {
                    'checkout': {
                        'actionField': {
                            'step': 3, // Number of the step REQUIRED
                            'option': this.isCn ? this.selectedPayMethod?.CollectionProcessorType || '' : this.selectedPayMethod?.PayMethodType || '' // Payment method
                        }
                    }
                }
            });
        },
        collapse() {
            if(this.$refs['accordion']) {
                this.$refs['accordion'].$emit('hide');
                this.$refs['accordion'].$emit('focus');
            }
        },
        setSelectedIndex() {
            const selectedIndex =
                this.useDefaultMethodOfPayment
                    ? this.payMethodsSorted.findIndex(method => method.PayMethodDefaults.includes('Products'))
                    : this.payMethodsSorted.findIndex(method => method.PayMethodId === this.selectedPayMethodId);
            this.selectedIndex = selectedIndex > -1 ? selectedIndex : 0;
            this.$emit('initialPayment', this.payMethodsSorted[this.selectedIndex]);
        },
        expand() {
            if(this.$refs['accordion']) {
                this.$refs['accordion'].$emit('show');
                this.$refs['accordion'].$emit('focus');
            }
        },
        getEditLink(method) {
            // Concat Origin and Pathname to prevent Query Strings
            const backTo = `${window.location.origin}${window.location.pathname}`;
            return `${this.editLink}?PayMethodId=${method.PayMethodId}&backTo=${backTo}&fromCheckout=true`;
        },
        getEditAriaLabel(method) {
            const name = method.PaymethodNameDisplay ? ` ${method.PaymethodNameDisplay}` : '';
            const number = method.LastFourDigitsOfAccount ? ` ${method.LastFourDigitsOfAccount}` : '';
            return this.editLabel + name + number;
        },
        updateSelectedIndex() {
            if(this.payMethodsSorted[this.selectedIndex] && (this.selectedPayMethodId !== this.payMethodsSorted[this.selectedIndex]?.PayMethodId)) {
                this.$emit('update', {
                    PayMethodId: this.payMethodsSorted[this.selectedIndex].PayMethodId
                });
            }
        }
    }
};
