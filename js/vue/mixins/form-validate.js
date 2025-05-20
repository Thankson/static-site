export default {
    data() {
        return {
            defaultErrorMessage: 'Error input!'
        };
    },
    computed: {
        // errorMessages() {
        //     return {
        //         uploadPhotosTerm: {
        //             uploadPhotosTermValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
        //         },
        //         frontOfIDCardMediaInfo: {
        //             frontOfIDCardMediaInfoValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
        //         }
        //     };
        // },
        hasErrorMessages() {
            return !!this.errorMessages;
        }
    },
    methods: {
        specialFieldsInvalid() {
            if(this.$refs.areaCnRef) {
                return this.$refs.areaCnRef.showError;
            }
            return false;
        },
        submitPartialForm() {
            this.$v.$touch();
            return this.$v.$invalid || this.specialFieldsInvalid();
        },

        isFieldError(fieldName) {
            return this.$v[fieldName].$dirty && this.$v[fieldName].$error;
        },

        // getErrorMessages(fieldName, validator, params) {
        //     const validationMessages = {
        //         uploadPhotosTerm: {
        //             uploadPhotosTermValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
        //         },
        //         frontOfIDCardMediaInfo: {
        //             frontOfIDCardMediaInfoValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
        //         }
        //     };
        //     return validationMessages[fieldName][validator] || this.defaultErrorMessage;
        // },
        getValidationErrors(fieldName) {
            const field = this.$v[fieldName];

            let errors = [];
            if(!field.$dirty) return errors;

            for (const validator in field.$params) {
                if(!field[validator]) {
                    const ems = this.hasErrorMessages
                        ? (this.errorMessages[fieldName][validator] || this.defaultErrorMessage)
                        : this.getErrorMessages(fieldName, validator, field.$params[validator]);
                    errors = errors.concat(ems);
                }
            }
            return errors;
        }
    }
};
