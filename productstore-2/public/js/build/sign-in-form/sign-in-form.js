const SIGN_IN_FORM_MODULE = {
    onReady: function() {
        const $SIGN_IN_FORM = $('#signInForm');

        if($SIGN_IN_FORM.length) {
            this.validation($SIGN_IN_FORM);
        }
    },
    validation: function(form) {
        const $SIGN_IN_FORM_ERROR = $('#signInForm .o-signInForm__errorMsg');
        let wasSubmitted = false;

        form.validate({
            debug: false,
            errorClass: 'e-inputError',
            onfocusout: function(el) {
                if(wasSubmitted) {
                    if(el.value) {
                        el.classList.remove('e-inputError');
                    } else if(!el.classList.contains('e-inputError')) {
                        el.classList.add('e-inputError');
                    }
                }
            },
            onkeyup: function() {
                if(form.validate().checkForm()) {
                    $SIGN_IN_FORM_ERROR.hide();
                } else if(wasSubmitted) {
                    $SIGN_IN_FORM_ERROR.show();
                }
            },
            invalidHandler: function(e, validator) {
                wasSubmitted = true;

                var errors = validator.numberOfInvalids();

                if(errors > 0) {
                    $SIGN_IN_FORM_ERROR.show();
                } else {
                    $SIGN_IN_FORM_ERROR.hide();
                }
            },
            errorPlacement: function() {
                return false;
            }
        });
    }
};

// module ready
$(document).ready(SIGN_IN_FORM_MODULE.onReady());
