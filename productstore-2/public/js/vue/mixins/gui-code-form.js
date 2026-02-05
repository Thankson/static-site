export default {
    props: {
        errorLabel: {
            type: String,
            default: 'Field Error'
        },
        inputLabel: {
            type: String,
            default: 'Field Name'
        },
        inputPlaceholder: {
            type: String,
            default: 'Field Placeholder'
        },
        inputValue: {
            type: String,
            default: ''
        },
        isReadonly: {
            type: Boolean,
            default: false
        },
        submitLabel: {
            type: String,
            default: 'Submit'
        },
        successLabel: {
            type: String,
            default: 'Success'
        }
    }
};
