import eventBus from './event-bus';

const imeaAddressFormMixin = {
    props: {
        data: {
            type: Object,
            default: () => ({})
        },
        labels: {
            type: Object,
            default: () => ({})
        },
        isChevronFocused: {
            type: Boolean,
            default: false
        },
        isCollapseOpen: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            isExperianModalVisible: false
        };
    },
    watch: {
        $v: {
            deep: true,
            handler() {
                const allValidatedFields = this.$v.$params;
                for (let key of Object.keys(allValidatedFields)) {
                    if(this.$v[key]) this[`${key}Error`] = this.$v[key].$error;

                    if(this[`${key}Error`]) {
                        let errorMsg;

                        if(this.$v[key].maxLength === false) {
                            const userInputDataLength = this[key] ? this[key].length : 0;
                            const inputDataMaxLength =
                                this.$v[key].$params?.maxLength?.max ?? '';
                            errorMsg =
                                this.labels?.MaxCharacterLengthExceedError
                                    .replace('{0}', inputDataMaxLength)
                                    .replace('{1}', userInputDataLength - inputDataMaxLength);
                        } else if(this.$v[key].required === false || this.$v[key].noSpaces === false) {
                            const fieldName = key.replace('Data', '');
                            const fieldNameCapitalized =
                                fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                            errorMsg = this.labels[`${fieldNameCapitalized}`]?.RequiredErrorMessage;
                        } else if(this.$v[key].postalCode === false) {
                            errorMsg = this.labels?.PostalCode.InvalidErrorMessage;
                        }

                        this[`${key}ErrorMsg`] = errorMsg;
                    }
                }
            }
        }
    },
    created() {
        this.setFormValidations();
    },
    beforeDestroy() {
        eventBus.$off('validate');
    },
    methods: {
        getLabel(fieldName) {
            return `${this.labels[fieldName]?.Text}${this.labels[fieldName]?.Required ? '*' : ''}`;
        },
        handleSuggestionKeyup(event) {
            event.preventDefault();
            event.stopPropagation();

            if(event.key === 'Escape') {
                this.showAddressList = false;
                this.$refs['address_1input'].$el.focus();
            }

            let addressButtons = this.$refs['suggestion'];

            if(this.showAddressList && addressButtons.length > 0) {
                if(event.key === 'ArrowDown') {
                    this.addressFocusIndex =
                        this.addressFocusIndex + 1 >= addressButtons.length
                            ? this.addressFocusIndex
                            : this.addressFocusIndex + 1;
                } else if(event.key === 'ArrowUp') {
                    this.addressFocusIndex =
                        this.addressFocusIndex - 1 < -1
                            ? this.addressFocusIndex
                            : this.addressFocusIndex - 1;
                }
                if(this.addressFocusIndex === -1) {
                    this.$refs['address_1input'].$el.focus();
                    this.showAddressList = true;
                } else {
                    addressButtons[this.addressFocusIndex].focus();
                }
            }
        },
        setIsExperianModalVisible(val) {
            this.isExperianModalVisible = val;
            eventBus.$emit('setIsExperianModalVisible', val);
        }
    }
};

export default imeaAddressFormMixin;
