const ADDRESS_MODULE_CN = {
    onReady: function() {
        const $ADDRESS_FORM_CN = $('#add-address-cn, #edit-address-cn');
        // Adding the error ul in the DOM
        if(ADDRESS_MODULE_CN.elements.errorMsgs) ADDRESS_MODULE_CN.elements.errorMsgs.append('<ul class="e-formError__list"></ul>');

        ADDRESS_MODULE_CN.config.isBusinessForm = false;

        // Validation
        if($ADDRESS_FORM_CN.length) {
            ADDRESS_MODULE_CN.addMethodsCn();
            ADDRESS_MODULE_CN.validation($ADDRESS_FORM_CN);
        }

        // Cancel button - Redirect to prev page
        $('[data-cancel="addressCn"]').on('click', () => {
            if(ADDRESS_MODULE_CN.urlParams.get('backTo')) {
                const backTo = `${ADDRESS_MODULE_CN.urlParams.get('backTo')}`;
                window.location.href = backTo;
            } else {
                history.go(-1);
            }
            return false;
        });

        ADDRESS_MODULE_CN.config.isAdding = parseInt($('#addressid').val()) === 0;

        ADDRESS_MODULE_CN.handleFirstAddressAddition();
    },
    addLoadingSpin: function(bool) {
        const loadingIcon = $('*[data-loading]');
        if(bool) {
            loadingIcon.show();
        } else {
            loadingIcon.hide();
        }
    },
    urlParams: new URLSearchParams(window.location.search),
    addMethodsCn: function() {
        $.validator.addMethod('pattern', function(value, element, param) {
            if(this.optional(element)) {
                return true;
            }
            if(typeof param === 'string') {
                param = new RegExp('^(?:' + param + ')$');
            }
            return param.test(value);
        }, function(value, element, param) {
            const customMsg = $(element).attr('data-msg-required');
            return customMsg;
        });
    },
    config: {
        isBusinessForm: false,
        isFormValid: false,
        isPageLoaded: false,
        isAdding: false,
        isFirstAddressAddition: false,
        formData: {},
        getUrl: '/api/customeraccount/addresses',
        addUrl: '/api/customeraccount/addaddress',
        editUrl: '/api/customeraccount/updateaddress'
    },
    elements: {
        errorMsgs: $('*[data-target-error-cn]'),
        errorItemClass: 'e-formError__item',
        targetAnswer: $('*[data-answer]'),
        get formErrorList() {
            return $(this.errorMsgs).children('ul');
        }
    },
    resetForm: function(form) {
        if(form) form.validate().resetForm();

        // Reset fields State and Zipcode
        $('#state option[selected="selected"]').removeAttr('selected');
        $('#state option:first').attr('selected', 'selected');
        $('#zipcode, #postalcode').val('');
        ADDRESS_MODULE_CN.elements.formErrorList.html('').hide();

        // Reset loading icons
        ADDRESS_MODULE_CN.elements.targetAnswer.hide();
        ADDRESS_MODULE_CN.addLoadingSpin(false);
    },
    sendForm: function() {
        let url = null;
        if(ADDRESS_MODULE_CN.config.isAdding) {
            url = ADDRESS_MODULE_CN.config.addUrl;
        } else {
            url = ADDRESS_MODULE_CN.config.editUrl;
        }

        // Add address
        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(ADDRESS_MODULE_CN.config.formData),
            contentType: 'application/json',
            accept: 'application/json',
            beforeSend: function () {
                ADDRESS_MODULE_CN.addLoadingSpin(true);
            },
            success: function(data) {
                ADDRESS_MODULE_CN.addLoadingSpin(false);

                // Showing feedback
                ADDRESS_MODULE_CN.elements.targetAnswer.show();
                if(data?.Data?.Message) ADDRESS_MODULE_CN.elements.targetAnswer.html(`<p class="text-green">${data.Data.Message}</p>`);

                if(!data?.Success) {
                    ADDRESS_MODULE_CN.addLoadingSpin(false);
                    ADDRESS_MODULE_CN.elements.targetAnswer.show();
                    if(data?.ErrorMessages.length > 0) {
                        data.ErrorMessages.forEach(errorMessage => {
                            ADDRESS_MODULE_CN.elements.targetAnswer.html(`<p class="text-error">${errorMessage.Translation}</p>`);
                        });
                    }
                } else {
                    // Check if there's a target URL on query string
                    if(ADDRESS_MODULE_CN.urlParams.get('backTo')) {
                        const addressId = data?.Data?.AddressId || parseInt(ADDRESS_MODULE_CN.config.formData.AddressId);
                        const backTo = `${ADDRESS_MODULE_CN.urlParams.get('backTo')}?addressId=${addressId}`;
                        window.location.href = backTo;
                    } else if(data?.Data?.RedirectUrl) {
                        window.location.href = data?.Data?.RedirectUrl;
                    } else {
                        // Redirect to prev page
                        window.location.href = document.referrer;
                    }
                }
                return false;
            },
            error: function(data) {
                console.log('-error-> ', data);
                ADDRESS_MODULE_CN.addLoadingSpin(false);
                ADDRESS_MODULE_CN.elements.targetAnswer.show();
                if(data?.Error) {
                    ADDRESS_MODULE_CN.elements.targetAnswer.html(`<p class="text-error">${data.Error}</p>`);
                }
            }
        });
    },
    setIsFormValid(payload) {
        ADDRESS_MODULE_CN.config.isFormValid = payload;
    },
    handleFirstAddressAddition() {
        if(!ADDRESS_MODULE_CN.config.isAdding) return;

        $.ajax({
            url: ADDRESS_MODULE_CN.config.getUrl,
            type: 'GET',
            contentType: 'application/json',
            accept: 'application/json',
            success: function(data) {
                if(data?.Success) {
                    // If no address information is returned, it's treated as the first address addition.
                    ADDRESS_MODULE_CN.config.isFirstAddressAddition = !data?.Data?.length;
                    if(ADDRESS_MODULE_CN.config.isFirstAddressAddition) {
                        $('#defaultShip').prop('checked', true).prop('disabled', true);
                        $('[for=defaultShip]').addClass('-disabled');
                    }
                }
            }
        });
    },
    addAddresses() {
        ADDRESS_MODULE_CN.config.formData = {
            'AddressId': $('#addressid').val() || 0,
            'AddressLine1': $('#street').val(),
            'City': $('#city').val(),
            'Province': $('#province').val(),
            'Suburb': $('#region').val(),
            'AddressType': ($('#defaultShip').length) ? 'ShippingAddress' : 'BusinessAddress',
            'IsDefault': ($('#defaultShip').length) ? $('#defaultShip').is(':checked') : '',
            'Country': $('#country').val(),
            'NameOnAddress': $('#recipientname').val(),
            'PhoneNumber': $('#phonenumbercn').val(),
            'PostalCode': $('#zipcode').val() || '000000'
        };

        // Add shipping address
        ADDRESS_MODULE_CN.sendForm();
    },
    validation: function(form) {
        form.validate({
            debug: false,
            errorClass: 'formError -noIcon -bgIcon',
            errorElement: 'em',
            onfocusout: function(element, event) {
                $(element).valid(); // Uncomment if want to validate on focus out

                // Removing the valid field from the error list
                const errorList = ADDRESS_MODULE_CN.elements.formErrorList.children(`.${ADDRESS_MODULE_CN.elements.errorItemClass}`);
                const targetId = event.currentTarget.id;
                const $el = $(element)[0];

                // Check if is the correct field
                let isHidden = null;
                if($el.nextSibling && $el.nextSibling.nodeName === 'EM') {
                    isHidden = $($el.nextSibling).css('display') === 'none';
                }

                // Show errors
                errorList.each((i, el) => {
                    const _el = $(el)[0];
                    const errorId = _el.dataset.error;

                    if(targetId === errorId) {
                        if(isHidden) {
                            $(_el).hide();
                        } else {
                            ADDRESS_MODULE_CN.elements.formErrorList.show();
                            $(_el).show();
                        }
                    }
                });

                // Hidden all if there is no more errors
                if(!ADDRESS_MODULE_CN.elements.formErrorList.children('li:visible').length) {
                    ADDRESS_MODULE_CN.elements.formErrorList.hide();
                }
            },
            submitHandler: function(form, event) {
                event.preventDefault();
                ADDRESS_MODULE_CN.config.isFormValid = true;
                if($('#area-error').length === 0) {
                    ADDRESS_MODULE_CN.addAddresses();
                }
            }
        });
    }
};

// module ready
$(document).ready(ADDRESS_MODULE_CN.onReady());
export default ADDRESS_MODULE_CN;
window.sendformcn = ADDRESS_MODULE_CN;
