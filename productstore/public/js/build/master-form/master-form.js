const MASTER_FORM_MODULE = {
    onReady: function() {
        const $THIS_MODULE = this;
        const $MASTER_FORM = $('#master-form');

        if($MASTER_FORM.length) {
            $THIS_MODULE.addMethods();
            $THIS_MODULE.validation($MASTER_FORM);
        }

        $('.o-masterForm__reset').on('click', function(evt) {
            evt.preventDefault();
            $MASTER_FORM.validate().resetForm();
            $MASTER_FORM[0].reset();
        });
    },
    addMethods: function() {
        $.validator.addMethod('pattern', function(value, element, param) {
            if(this.optional(element)) {
                return true;
            }
            if(typeof param === 'string') {
                param = new RegExp('^(?:' + param + ')$');
            }
            return param.test(value);
        }, 'Invalid format.');
    },
    validation: function(form) {
        form.validate({
            debug: false,
            errorClass: 'formError',
            errorElement: 'em'
        });
    }
};

// module ready
$(document).ready(MASTER_FORM_MODULE.onReady());
