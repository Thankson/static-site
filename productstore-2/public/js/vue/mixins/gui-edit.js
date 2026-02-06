import guiCodeFormMixin from './gui-code-form';
import regexParser from 'regex-parser';

const REGEX_PATTERNS = {
    Mobile: '/^/([A-Z0-9.+-]{7})$/',
    CitizenDigitalCertification: '/^([A-Z]{2})([0-9]{14})$/',
    LoveCode: '/^[0-9]{3,7}$/'
};

export default {
    mixins: [ guiCodeFormMixin ],
    data() {
        return {
            error: false,
            errorMsg: '',
            isValid: null,
            loading: false,
            success: false,
            savedCode: ''
        };
    },
    mounted() {
        this.savedCode = this.inputValue;
    },
    methods: {
        focusInput() {
            this.$refs.form?.focusInput();
        },
        handleError() {
            this.errorMsg = this.errorLabel;
            this.error = true;
            this.focusInput();
        },
        async validateUserInput(value) {
            const chosenRegex = REGEX_PATTERNS[this.carrierType];
            this.isValid = regexParser(chosenRegex).test(value);
        },
        async onSubmit({ value }) {
            if(this.carrierType === 'LoveCode') {
                const codeInputVal = value.split(' ');
                const code = codeInputVal[0]; // extract the code from input
                value = code;
            }
            this.success = false;

            if(value === this.savedCode || this.loading) return;

            if(!value) {
                this.handleError();
                return;
            }

            await this.validateUserInput(value);

            if(!this.isValid) {
                this.handleError();
                return;
            }

            this.error = false;
            this.loading = true;

            const response = await this.updateCodeApi(value);

            if(response.success && response.data.Success) {
                this.success = true;
                this.savedCode = value;
            } else {
                this.focusInput();
                this.error = true;

                if(response.data?.ErrorMessages) {
                    let errors = response.data?.ErrorMessages;
                    if(Array.isArray(errors)) {
                        const errorMsgArray = errors.map(error => error?.Translation);
                        errors = errorMsgArray?.join(' ');
                    }
                    this.errorMsg = errors || this.errorLabel;
                } else {
                    this.errorMsg = response.error || this.errorLabel;
                }
            }

            this.loading = false;
        },
        /**
         * method to handle the http request to Update the GUI Code
         * - the mixin instance is a placeholder
         * - the mixin instance returns an empty object which will set the mixin's "error" state to true
         * - should be overridden at the component level
         * @param {string} value string for the code to be updated with
         * @returns {Object<string,any>|Promise} returns http request Promise from api-service.js
         */
        updateCodeApi(value) {
            console.log('Load GUI Update Code API:', value);
            return {};
        }
    }
};
