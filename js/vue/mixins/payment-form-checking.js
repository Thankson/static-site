import { validationMixin } from 'vuelidate';
import { integer, required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import paymentFormMixin from './payment-form';
import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
import ExampleCheck from '../components/01-molecules/example-check/example-check.vue';
import formHelper from '@common/source/js/vue/utils/form-helper';

export default {
    components: {
        ExampleCheck,
        vInput
    },
    mixins: [ paymentFormMixin, validationMixin ],
    validations() {
        return {
            // Account Holder Validation Settings
            accountHolderValue: {
                required,
                allowed: value => {
                    return formHelper.isValidTextInput(value);
                },
                min: value => {
                    if(value === null) return false;
                    return value.length >= this.accountHolder.MinLength;
                },
                max: value => {
                    if(value === null) return false;
                    return value.length <= this.accountHolder.MaxLength;
                }
            },

            // Account Type Validation Settings
            accountTypeValue: {
                required
            },

            // Rounting Number Validation Settings
            routingNumberValue: {
                required,
                integer,
                min: value => {
                    if(value === null) return false;
                    return value.length >= this.routingNumber.MinLength;
                },
                max: value => {
                    if(value === null) return false;
                    return value.length <= this.routingNumber.MaxLength;
                }
            },

            // Account Number Validation Settings
            accountNumberValue: {
                required,
                integer,
                min: value => {
                    if(value === null) return false;
                    return value.length >= this.accountNumber.MinLength;
                },
                max: value => {
                    if(value === null) return false;
                    return value.length <= this.accountNumber.MaxLength;
                }
            }
        };
    },
    props: {
        accountHolder: {
            type: Object,
            default: function() {
                return {
                    Id: 'accountholder',
                    Name: 'accountholder',
                    MinLength: 1,
                    MaxLength: 100,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'NAME ON ACCOUNT'
                };
            }
        },
        accountType: {
            type: Object,
            default: function() {
                return {
                    Id: 'select-accounttype',
                    Name: 'accounttype',
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    SelectMod: '-bg-transparent -sm-md w-full',
                    Label: 'ACCOUNT TYPE',
                    Arrow: {
                        Direction: '-down',
                        Size: '-sm',
                        OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-15 pointer-events-none',
                        TailwindColor: 'gray'
                    }
                };
            }
        },
        routingNumber: {
            type: Object,
            default: function() {
                return {
                    Id: 'routingnum',
                    Name: 'routingnum',
                    MinLength: this.$env.Country === 'Canada' ? 8 : 9,
                    MaxLength: 9,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'ROUTING NUMBER'
                };
            }
        },
        accountNumber: {
            type: Object,
            default: function() {
                return {
                    Id: 'accountnum',
                    Name: 'accountnum',
                    MinLength: 4,
                    MaxLength: 17,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'ACCOUNT NUMBER'
                };
            }
        },
        isEnrollment: {
            type: Boolean,
            default: false
        },
        isGuestCheckout: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            accountHolderValue: '',
            accountTypeValue: null,
            routingNumberValue: '',
            accountNumberValue: '',
            paymentMethod: null
        };
    },
    computed: {
        ...mapState('riverbendSubscription', ['isRiverbendSubscription']),
        accountOptions() {
            let accountOptions = [];

            if(this.accountType.Options && this.accountType.Options.length) {
                accountOptions = this.accountType.Options;
            }

            accountOptions = [
                {
                    Label: this.getLabels('Labels.Checking.AccountTypes.Select', 'Select'),
                    Value: null
                },
                {
                    Label: this.getLabels('Labels.Checking.AccountTypes.Checking', 'Checking'),
                    Value: 'ACHChecking'
                },
                {
                    Label: this.getLabels('Labels.Checking.AccountTypes.Savings', 'Savings'),
                    Value: 'ACHSavings'
                }
            ];

            return accountOptions;
        },
        isGuestOrEnrollment() {
            return this.isGuestCheckout || this.isEnrollment;
        }
    },
    watch: {
        paymentMethod: {
            deep: true,
            handler() {
                if(this.isEditing && this.paymentMethod.PayMethodId) {
                    this.accountHolderValue = this.paymentMethod.NameOnAccount;
                    this.accountTypeValue = this.paymentMethod.PayMethodType;
                    this.routingNumberValue = this.paymentMethod.RoutingNumber;
                    this.accountNumberValue = this.paymentMethod.LastFourDigitsOfAccount; // TODO
                }
            }
        }
    },
    mounted() {
        this.paymentMethod = this.storedPayMethod;

        this.$nextTick(() => {
            this.setDefaultCustomerName();
        });
    },
    methods: {
        getInitialValue(prop, store, model, current) {
            if(prop.Value) {
                return prop.Value;
            }

            let value = null;

            if(this.isEditing && this.storedPayMethod) {
                this[model] = current;
                value = current;
            }

            return value;
        },
        setDefaultCustomerName() {
            // If it's adding a new pay method
            if(!this.isEditing && !this.paymentId && !this.accountHolderValue) {
                this.accountHolderValue = this.defaultCustomerName;
            }
        }
    }
};
