import { validationMixin } from 'vuelidate';
import { maxLength, required, requiredIf } from 'vuelidate/lib/validators';
import { mapActions, mapState } from 'vuex';
import uniqid from 'uniqid';
import localizationMixin from '@common/source/js/vue/mixins/localization';
import experianMixin from '@common/source/js/vue/mixins/experian';
import phAddressFormMixin from './address-form-ph';
import hkAddressFormMixin from './address-form-hk';
import twAddressFormMixin from './address-form-tw';
import replaceToken, { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
import apiAdd from '@api/routes/customeraccount/addaddress';
import apiUpdate from '@api/routes/customeraccount/updateaddress';
import apiValidate from '@api/routes/address/validate';
import formHelper from '@common/source/js/vue/utils/form-helper';
import * as addressTypes from '../utils/address-types';
import { compareAddress } from '../utils/format-address';

const AUSTRALIA = 'australia';
const AUSTRIA = 'austria';
const BELGIUM = 'belgium';
const CANADA = 'canada';
const ESTONIA = 'estonia';
const FINLAND = 'finland';
const GERMANY = 'germany';
const HONGKONG = 'hongkong';
const HUNGARY = 'hungary';
const IRELAND = 'ireland';
const ITALY = 'italy';
const JAPAN = 'japan';
const KOREA = 'korea';
const LATVIA = 'latvia';
const LITHUANIA = 'lithuania';
const LUXEMBOURG = 'luxembourg';
const MALAYSIA = 'malaysia';
const MEXICO = 'mexico';
const NETHERLANDS = 'netherlands';
const NEW_ZEALAND = 'newzealand';
const PHILIPPINES = 'philippines';
const POLAND = 'poland';
const SINGAPORE = 'singapore';
const SPAIN = 'spain';
const TAIWAN = 'taiwan';
const UNITED_KINGDOM = 'unitedkingdom';
const UNITED_STATES = 'unitedstates';
const CHINA = 'china';

export default {
    directives: {
        clickoutside: {
            bind(el, binding, vnode) {
                el.clickOutsideEvent = function(event) {
                    // Click outside the el and his childrens
                    if(!(el === event.target || el.contains(event.target))) {
                        // Call method provided in attribute value
                        vnode.context[binding.expression](event);
                    }
                };
                document.body.addEventListener('click', el.clickOutsideEvent);
                document.body.addEventListener('touchstart', el.clickOutsideEvent);
            },
            unbind(el) {
                document.body.removeEventListener('click', el.clickOutsideEvent);
                document.body.removeEventListener('touchstart', el.clickOutsideEvent);
            },
            stopProp(event) {
                event.stopPropagation();
            }
        }
    },
    mixins: [ experianMixin, hkAddressFormMixin, localizationMixin, phAddressFormMixin, twAddressFormMixin, validationMixin ],
    props: {
        hasBusinessAddress: { // has business address already
            type: Boolean,
            default: false
        },
        hasShippingAddress: { // has shipping address already
            type: Boolean,
            default: false
        },
        isBusiness: {
            type: Boolean,
            default: false
        },
        isInCheckout: { // OLE checkout address flow
            type: Boolean,
            default: false
        },
        isRiverbendSubscription: {
            type: Boolean,
            default: false
        },
        restrictSuggestionInputToAddress: {
            type: Boolean,
            default: false
        },
        scriptId: {
            type: String,
            default: ''
        },
        showAddressEditView: {
            type: Boolean,
            default: false
        },
        showBusinessAddForm: { // Business-address-form visibility
            type: Boolean,
            default: false
        },
        showShippingAddForm: { // Shipping-address-form visibility
            type: Boolean,
            default: true
        }
    },
    validations() {
        // Ordered according to the render order of the inputs on each culture's form
        switch (this.chosenCountry) {
            case AUSTRALIA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.au.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.au.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.au.address_2)
                    },
                    // City
                    suburbData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.au.suburb)
                    },
                    // Province
                    stateData: {
                        required,
                        allowed: (value) => value !== this.statePlaceholder
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'au')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'au')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.au.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case AUSTRIA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.at.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.at.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.at.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.at.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'at')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'at')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.at.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case BELGIUM:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.be.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.be.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.be.address_2)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'be')
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.be.city)
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'be')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.be.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case CANADA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.name)
                    },
                    address_1Data: {
                        required,
                        pobox: formHelper.rbPoApoFpoValidator(this.isRiverbendSubscription || this.isRiverbend, 'address', 'us'),
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.address_1)
                    },
                    address_2Data: {
                        pobox: formHelper.rbPoApoFpoValidator(this.isRiverbendSubscription || this.isRiverbend, 'address', 'us'),
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.address_2)
                    },
                    cityData: {
                        required,
                        fpoApo: formHelper.rbPoApoFpoValidator(this.isRiverbendSubscription || this.isRiverbend, 'city', 'us'),
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.city)
                    },
                    provinceData: {
                        required,
                        allowed: (value) => value !== this.provincePlaceholder
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'ca')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'ca')
                    },
                    companyNameData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.companyName)
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case ESTONIA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ee.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ee.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ee.address_2)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'ee')
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ee.city)
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'ee')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ee.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case FINLAND:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.fi.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.fi.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.fi.address_2)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'fi')
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.fi.city)
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'fi')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.fi.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case GERMANY:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.de.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.de.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.de.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.de.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'de')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'de')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.de.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case HONGKONG:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hk.name)
                    },
                    areaData: {
                        required
                    },
                    cityData: {
                        required
                    },
                    suburbData: {
                        required: requiredIf(() => this.isHkSuburbSelectRequired)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hk.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hk.address_2)
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'hk')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hk.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case HUNGARY:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hu.name)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hu.city)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hu.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hu.address_2)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'hu')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'hu')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.hu.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case IRELAND:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ie.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ie.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ie.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ie.city)
                    },
                    countyData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ie.county)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'ie')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'ie')
                    },

                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ie.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case ITALY:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.it.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.it.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.it.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.it.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'it')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'it')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.it.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case JAPAN:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.jp.name)
                    },
                    postalCodeData: {
                        required
                    },
                    // Prefectures
                    provinceData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.jp.province)
                    },
                    // Municipality
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.jp.city)
                    },
                    // Town
                    suburbData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.jp.suburb)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.jp.address_1)
                    },
                    phoneNumberData: {
                        required,
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'jp')
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case KOREA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.kr.name)
                    },
                    zipCodeData: {
                        required
                    },
                    // Base Address
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.kr.address_1)
                    },
                    // Detailed Address
                    address_2Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.kr.address_2)
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.kr.deliveryInstructions)
                    },
                    phoneNumberData: {
                        required,
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'kr')
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case LATVIA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lv.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lv.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lv.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lv.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'lv')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'lv')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lv.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case LITHUANIA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lt.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lt.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lt.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lt.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'lt')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'lt')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lt.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case LUXEMBOURG:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lu.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lu.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lu.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lu.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'lu')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'lu')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.lu.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case MALAYSIA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.my.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.my.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.my.address_2)
                    },
                    address_3Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.my.address_3)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.my.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'my')
                    },
                    stateData: {
                        required,
                        allowed: (value) => value !== this.statePlaceholder
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'my')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.my.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case MEXICO:
                return this.mxAddressEntryEnhancementEnabled
                    ? { // return new validations when Mexico address entry enhancement is enabled
                        address_1Data: {
                            required: requiredIf(() =>
                                !this.optionalFields.includes('address1')),
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('address_1');
                            },
                            supportedCharacter: (val) => {
                                if(!val) return true;
                                return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                            }
                        },
                        address_2Data: {
                            required: requiredIf(() =>
                                !this.optionalFields.includes('address2')),
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('address_2');
                            },
                            supportedCharacter: (val) => {
                                if(!val) return true;
                                return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                            }
                        },
                        cityData: {
                            required: requiredIf(() =>
                                !this.optionalFields.includes('city')),
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('city');
                            },
                            supportedCharacter: (val) => {
                                if(!val) return true;
                                return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                            }
                        },
                        deliveryInstructionsData: {
                            required: requiredIf(() =>
                                !this.optionalFields.includes('deliveryInstructions')),
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('deliveryInstructions');
                            },
                            supportedCharacter: (val) => {
                                if(!val) return true;
                                return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                            }
                        },
                        nameData: {
                            required: requiredIf(() => !this.optionalFields.includes('name')),
                            supportedCharacter: (val) => {
                                if(!val) return true;
                                return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                            },
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('name');
                            }
                        },
                        phoneNumberData: {
                            required: requiredIf(() => !this.optionalFields.includes('phoneNumber')),
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('phoneNumber');
                            },
                            phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'mx')
                        },
                        postalCodeData: {
                            required: requiredIf(() =>
                                !this.optionalFields.includes('postalCode')),
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('postalCode');
                            },
                            postalCode: (val) => {
                                if(!val) return true;
                                return formHelper.isValidPostalCode(val, 'mx');
                            }
                        },
                        stateMxData: {
                            required: requiredIf(() =>
                                !this.optionalFields.includes('state')),
                            allowed: (value) => value !== this.stateMx[0]
                        },
                        suburbData: {
                            required: requiredIf(() =>
                                !this.optionalFields.includes('suburb')),
                            allowed: (value) => {
                                const hasPlaceholderAsFirst =
                                    Array.isArray(this.suburbList) &&
                                    this.suburbList.length > 0 &&
                                    this.suburbList[0] === this.suburbPlaceholder;
                                if(hasPlaceholderAsFirst) {
                                    const isSetToPlaceholder = value !== this.suburbList[0];
                                    return isSetToPlaceholder;
                                }
                                // If the first item isn't the placeholder, bypass this allowed check
                                return true;
                            },
                            characterLimit: (val) => {
                                if(!val) return true;
                                return val.length <= this.getMaxLength('suburb');
                            },
                            supportedCharacter: (val) => {
                                if(!val) return true;
                                return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                            }
                        },
                        defaultShip: {
                            required: requiredIf(() => !this.doesDefaultAddressExist),
                            allowed: value => {
                                if(!this.doesDefaultAddressExist) {
                                    return value === true;
                                }
                                return true;
                            }
                        }
                    }
                    : {
                        nameData: {
                            required,
                            maxLength: this.determineLengthValidation(formHelper.maxChar.default.name)
                        },
                        address_1Data: {
                            required,
                            maxLength: this.determineLengthValidation(formHelper.maxChar.mx.address_1),
                            allowed: (value) => {
                                if(!this.validateAddressFeature) return true;
                                else return formHelper.isValidAddress(value);
                            }
                        },
                        address_2Data: {
                            maxLength: this.determineLengthValidation(formHelper.maxChar.mx.address_2),
                            allowed: (value) => {
                                if(!this.validateAddressFeature) return true;
                                else return formHelper.isValidAddress(value);
                            }

                        },
                        address_3Data: {
                            maxLength: this.determineLengthValidation(formHelper.maxChar.mx.address_3),
                            allowed: (value) => {
                                if(!this.validateAddressFeature) return true;
                                else return formHelper.isValidAddress(value);
                            }

                        },
                        cityData: {
                            required,
                            maxLength: this.determineLengthValidation(formHelper.maxChar.default.city)
                        },
                        // Colonia
                        suburbData: {
                            required,
                            maxLength: this.determineLengthValidation(formHelper.maxChar.default.suburb)
                        },
                        stateMxData: {
                            required,
                            allowed: (value) => value !== this.statePlaceholder
                        },
                        postalCodeData: {
                            required,
                            postalCode: (value) => formHelper.isValidPostalCode(value, 'mx')
                        },
                        phoneNumberData: {
                            phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'mx')
                        },
                        deliveryInstructionsData: {
                            maxLength: this.determineLengthValidation(formHelper.maxChar.default.deliveryInstructions)
                        },
                        defaultShip: {
                            required: requiredIf(() => !this.doesDefaultAddressExist),
                            allowed: value => {
                                if(!this.doesDefaultAddressExist) {
                                    return value === true;
                                }
                                return true;
                            }
                        }
                    };
            case NETHERLANDS:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nl.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nl.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nl.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nl.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'nl')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'nl')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nl.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case NEW_ZEALAND:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nz.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nz.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nz.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nz.city)
                    },
                    suburbData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nz.suburb)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'nz')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'nz')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.nz.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case PHILIPPINES:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ph.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ph.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ph.address_2)
                    },
                    provinceData: {
                        required
                    },
                    cityData: {
                        required
                    },
                    // Barangay
                    suburbData: {
                        required
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'ph')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.ph.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case POLAND:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.pl.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.pl.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.pl.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.pl.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'pl')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'pl')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.pl.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case SINGAPORE:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.sg.name)
                    },
                    // Ship To
                    companyNameData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.sg.companyName)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.sg.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.sg.address_2)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.sg.city)
                    },
                    stateData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.sg.state)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'sg')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'sg')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.sg.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case SPAIN:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.es.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.es.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.es.address_2)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'es')
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.es.city)
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'es')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.es.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case TAIWAN:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.tw.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.tw.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.tw.address_2)
                    },
                    cityData: {
                        required
                    },
                    suburbData: {
                        required
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'tw')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'tw')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.tw.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case UNITED_KINGDOM:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.uk.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.uk.address_1)
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.uk.address_2)
                    },
                    suburbData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.suburb)
                    },
                    cityData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.uk.city)
                    },
                    postalCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'uk')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'uk')
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.uk.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case UNITED_STATES:
                return {
                    nameData: {
                        required: requiredIf(() => {
                            return !this.showBusinessAddForm;
                        }),
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.name)
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.address_1),
                        pobox: formHelper.rbPoApoFpoValidator(this.isRiverbendSubscription || this.isRiverbend, 'address', 'us')
                    },
                    address_2Data: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.address_2),
                        pobox: formHelper.rbPoApoFpoValidator(this.isRiverbendSubscription || this.isRiverbend, 'address', 'us')
                    },
                    cityData: {
                        required,
                        fpoApo: formHelper.rbPoApoFpoValidator(this.isRiverbendSubscription || this.isRiverbend, 'city', 'us'),
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.city)
                    },
                    stateData: {
                        required,
                        allowed: (value) => value !== this.statePlaceholder,
                        fpoApo: formHelper.rbPoApoFpoValidator(this.isRiverbendSubscription || this.isRiverbend, 'state', 'us')
                    },
                    zipCodeData: {
                        required,
                        postalCode: (value) => formHelper.isValidPostalCode(value, 'us')
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'us')
                    },
                    companyNameData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.companyName)
                    },
                    deliveryInstructionsData: {
                        maxLength: this.determineLengthValidation(formHelper.maxChar.default.deliveryInstructions)
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
            case CHINA:
                return {
                    nameData: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.cn.name),
                        isValidCnAddress: formHelper.isValidCnAddress
                    },
                    phoneNumberData: {
                        phoneNumber: (value) => formHelper.isValidPhoneNumber(value, 'cn')
                    },
                    provinceData: {
                        required,
                        isValidCnAreaName: formHelper.isValidCnAreaName
                    },
                    cityData: {
                        required,
                        isValidCnAreaName: formHelper.isValidCnAreaName
                    },
                    suburbData: {
                        required,
                        isValidCnAreaName: formHelper.isValidCnAreaName
                    },
                    address_1Data: {
                        required,
                        maxLength: this.determineLengthValidation(formHelper.maxChar.cn.address_1),
                        isValidCnAddress: formHelper.isValidCnAddress
                    },
                    postalCodeData: {
                        postalCode: (value) => formHelper.isValidOptionalPostalCode(value, 'cn')
                    },
                    defaultShip: {
                        required: requiredIf(() => !this.doesDefaultAddressExist),
                        allowed: value => {
                            if(!this.doesDefaultAddressExist) {
                                return value === true;
                            }
                            return true;
                        }
                    }
                };
        }

        return {};
    },
    data() {
        return {
            address_1Data: null,
            address_1DataError: null,
            address_1DataErrorMsg: null,
            address_2Data: null,
            address_2DataError: null,
            address_2DataErrorMsg: null,
            address_3Data: null,
            address_3DataError: null,
            address_3DataErrorMsg: null,
            addressFocusIndex: -1,
            addressId: 0,
            addressShipping: {}, // Final object with data
            area: [],
            areaData: null,
            areaDataError: null,
            areaDataErrorMsg: null,
            apiCustomerAccountError: null,
            checkboxChecked: false, // checkbox for business address as same as shipping-address - OLE flow
            chosenCountry: UNITED_STATES,
            city: [],
            cityData: null,
            cityDataError: null,
            cityDataErrorMsg: null,
            companyNameData: null,
            companyNameDataError: null,
            companyNameDataErrorMsg: null,
            countriesLabels: [],
            countriesValues: [],
            countryValue: null,
            county: null,
            countyData: null,
            countyDataError: null,
            countyDataErrorMsg: null,
            crossCountryAddress: {
                isDefault: null,
                newAddress: null,
                newAddressLabel: null,
                oldAddress: null,
                oldAddressLabel: null
            },
            crossCountryAddressLoading: false,
            copyPasteError: null,
            defaultShip: false,
            defaultShipError: false,
            defaultShipErrorMsg: null,
            deliveryInstructionsData: null,
            deliveryInstructionsDataError: null,
            deliveryInstructionsDataErrorMsg: null,
            errorsMsgs: [],
            hasImea: false,
            init: true, // init component,
            intervalId: null,
            isAddressVerifiedByUserCheckbox: false,
            isCrossCountry: false,
            isFormValid: false,
            isLoadingSubmitForm: false,
            isValidatedByServicesApi: null, // set from the response of apiValidate - expected values should only be null or false
            listError: [],
            lastVerifiedDateTime: null,
            mainExperianFields: {
                inputId: 'address_1',
                resultsCtaClass: '.address-validation__btn',
                wrapper: '.m-formField.-text.-address1'
            },
            nameData: null,
            nameDataError: null,
            nameDataErrorMsg: null,
            phoneNumberData: '',
            phoneNumberDataError: null,
            phoneNumberDataErrorMsg: null,
            postalCode: [],
            postalCodeData: '',
            postalCodeDataError: null,
            postalCodeDataErrorMsg: null,
            province: [],
            provinceData: '',
            provinceDataError: null,
            provinceDataErrorMsg: null,
            regions: [],
            settingInitialData: false,
            showModal: false,
            specialCharsError: false,
            stateMxData: null,
            stateMxDataError: null,
            stateMxDataErrorMsg: null,
            stateData: '',
            stateDataError: null,
            stateDataErrorMsg: null,
            state: [],
            stateMx: [],
            stateLongNames: [],
            suburb: [],
            suburbAfter: false,
            suburbBefore: false,
            suburbData: null,
            suburbDataError: null,
            suburbDataErrorMsg: null,
            suburbDisables: null,
            suburbList: [],
            suggestionPick: false,
            useTabThroughSuggestions: false,
            zipCodeData: null,
            zipCodeDataError: null,
            zipCodeDataErrorMsg: null
        };
    },
    computed: {
        ...mapState('shippingAddress', {
            addresses: 'addresses',
            addressesLoaded: 'loaded',
            goToCheckSave: 'experianModalAcceptGoToCheckSave'
        }),
        ...mapState('riverbendSubscription', {
            isRiverbendGuest: 'isGuestEnrollment'
        }),
        // For address-form thru My Account page - OLE requirement
        addAsShipAddressAlso() {
            return (!this.isInCheckout && !this.localization.Data?.HasShippingAddress) || false;
        },
        address1Readonly() {
            return [KOREA].includes(this.chosenCountry);
        },
        addressApiRequest() {
            return {
                'AddressId': this.addressId,
                'AddressLine1': this.addressEntered.address1,
                'AddressLine2': this.addressEntered.address2,
                'AddressLine3':
                    this.addressEntered.address3
                        ? this.addressEntered.address3
                        : this.addressEntered.companyName,
                ...(this.shouldValidateWithServicesApi && { 'AddressSource': 'Sitecore' }),
                'AddressType':
                    this.isBusiness
                        ? addressTypes.business
                        : addressTypes.shipping,
                'City': this.addressEntered.city,
                'CompanyName': this.addressEntered?.companyName,
                'Country': this.addressEntered.country.replaceAll(' ', ''),
                'County': this.addressEntered.county,
                'DeliveryInstructions': this.addressEntered.deliveryInstructions,
                'IsDefault': this.defaultShip,
                'IsUserOverride':
                    // If experian is down (i.e., apiExperianError), pass false, otherwise specify whether the user has chosen an experian address suggestion
                    // If ShippingAddressServiceValidation localization flag (i.e., shouldValidateWithServicesApi) is true, pass false or the validation api will always return that the address is valid
                    this.apiExperianError || this.shouldValidateWithServicesApi
                        ? false
                        : !this.suggestionPick,
                'LastVerifiedDateTime':
                    this.lastVerifiedDateTime ??
                        (this.apiExperianError || this.apiCustomerAccountError || this.listError
                            ? null
                            : new Date().toUTCString()),
                'NameOnAddress': this.nameData,
                'PhoneNumber': this.phoneNumberData,
                'PostalCode': this.isChina ? (this.addressEntered.zipCode || '000000') : this.addressEntered.zipCode,
                'Province': this.addressEntered.state,
                'Suburb': this.addressEntered.suburb,
                'State': this.addressEntered.state
            };
        },
        addressEntered() {
            // if any of these fields change, there is a watch function to set the variable isFormValid to false
            let fieldsCountry = {
                'id': this.addressId,
                'name': this.nameData,
                'address1': this.address_1Data,
                'address2': this.address_2Data,
                'zipCode': this.postalCodeData,
                'phoneNumber': this.phoneNumberData,
                'deliveryInstructions': this.deliveryInstructionsData
            };

            switch (this.chosenCountry) {
                case AUSTRALIA:
                    fieldsCountry.country = 'Australia';
                    fieldsCountry.state = this.stateData?.toUpperCase();
                    fieldsCountry.city = this.suburbData; // Services want the suburb to be passed as city for Australia
                    break;
                case AUSTRIA:
                    fieldsCountry.country = 'Austria';
                    fieldsCountry.city = this.cityData;
                    break;
                case BELGIUM:
                    fieldsCountry.country = 'Belgium';
                    fieldsCountry.city = this.cityData;
                    break;
                case CANADA:
                    fieldsCountry.country = 'Canada';
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.state = this.provinceData?.toUpperCase();
                    fieldsCountry.companyName = this.companyNameData;
                    break;
                case ESTONIA:
                    fieldsCountry.country = 'Estonia';
                    fieldsCountry.city = this.cityData;
                    break;
                case FINLAND:
                    fieldsCountry.country = 'Finland';
                    fieldsCountry.city = this.cityData;
                    break;
                case GERMANY:
                    fieldsCountry.country = 'Germany';
                    fieldsCountry.city = this.cityData;
                    break;
                case HONGKONG:
                    fieldsCountry.country = 'HongKong';
                    fieldsCountry.suburb = this.suburbData;
                    fieldsCountry.city = this.areaData;
                    fieldsCountry.state = this.cityData;
                    break;
                case HUNGARY:
                    fieldsCountry.country = 'Hungary';
                    fieldsCountry.city = this.cityData;
                    break;
                case IRELAND:
                    fieldsCountry.country = 'Ireland';
                    fieldsCountry.county = this.countyData;
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.postalCode = this.postalCodeData;
                    break;
                case ITALY:
                    fieldsCountry.country = 'Italy';
                    fieldsCountry.city = this.cityData;
                    break;
                case JAPAN:
                    fieldsCountry.country = 'Japan';
                    fieldsCountry.postalCode = this.postalCodeData;
                    fieldsCountry.state = this.provinceData;
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.suburb = this.suburbData;
                    break;
                case KOREA:
                    fieldsCountry.country = 'Korea';
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.state = this.stateData;
                    fieldsCountry.suburb = this.suburbData;
                    fieldsCountry.zipCode = this.zipCodeData;
                    break;
                case LATVIA:
                    fieldsCountry.country = 'Latvia';
                    fieldsCountry.city = this.cityData;
                    break;
                case LITHUANIA:
                    fieldsCountry.country = 'Lithuania';
                    fieldsCountry.city = this.cityData;
                    break;
                case LUXEMBOURG:
                    fieldsCountry.country = 'Luxembourg';
                    fieldsCountry.city = this.cityData;
                    break;
                case MALAYSIA:
                    fieldsCountry.country = 'Malaysia';
                    fieldsCountry.address3 = this.address_3Data;
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.state = this.stateData;
                    break;
                case MEXICO:
                    fieldsCountry.country = 'Mexico';
                    fieldsCountry.address3 = this.address_3Data;
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.state = this.stateMxData;
                    fieldsCountry.suburb = this.suburbData;
                    fieldsCountry.companyName = this.companyNameData;
                    break;
                case NETHERLANDS:
                    fieldsCountry.country = 'Netherlands';
                    fieldsCountry.city = this.cityData;
                    break;
                case NEW_ZEALAND:
                    fieldsCountry.country = 'New Zealand';
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.suburb = this.suburbData;
                    break;
                case PHILIPPINES:
                    fieldsCountry.country = 'Philippines';
                    fieldsCountry.suburb = this.suburbData;
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.state = this.provinceData;
                    break;
                case POLAND:
                    fieldsCountry.country = 'Poland';
                    fieldsCountry.city = this.cityData;
                    break;
                case SINGAPORE:
                    fieldsCountry.country = 'Singapore';
                    fieldsCountry.postalCode = this.postalCodeData;
                    fieldsCountry.state = this.stateData?.toUpperCase();
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.companyName = this.companyNameData;
                    break;
                case SPAIN:
                    fieldsCountry.country = 'Spain';
                    fieldsCountry.city = this.cityData;
                    break;
                case TAIWAN:
                    fieldsCountry.country = 'Taiwan';
                    fieldsCountry.suburb = this.suburbData;
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.state = this.provinceData;
                    break;
                case UNITED_KINGDOM:
                    fieldsCountry.country = 'United Kingdom';
                    fieldsCountry.suburb = this.suburbData;
                    fieldsCountry.city = this.cityData;
                    break;
                case UNITED_STATES:
                    fieldsCountry.country = 'United States';
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.state = this.stateData?.toUpperCase();
                    fieldsCountry.zipCode = this.zipCodeData;
                    fieldsCountry.companyName = this.companyNameData;
                    break;
                case CHINA:
                    fieldsCountry.country = 'China';
                    fieldsCountry.state = this.provinceData;
                    fieldsCountry.city = this.cityData;
                    fieldsCountry.suburb = this.suburbData;
                    fieldsCountry.postalCode = this.postalCodeData;
                    break;
            }
            // current input values
            return fieldsCountry;
        },
        addressEnteredFormatted() {
            const lineBreak = '<br />';

            const address1 = this.addressEntered.address1 ? this.addressEntered.address1 + lineBreak : '';
            const address2 = this.addressEntered.address2 ? this.addressEntered?.address2 + lineBreak : '';

            const phoneNumber = this.addressEntered.phoneNumber ? this.addressEntered.phoneNumber + lineBreak : '';
            const name = this.addressEntered.name ? this.addressEntered.name + lineBreak : '';

            let suburb = this.addressEntered.suburb || '';
            if(suburb) {
                if(this.addressEntered.country === 'Australia' || this.addressEntered.country === 'Philippines') {
                    suburb = suburb + ',';
                } else if(this.addressEntered.country === 'New Zealand' || this.addressEntered.country === 'Taiwan' || this.addressEntered.country === 'HongKong') {
                    suburb = suburb + lineBreak;
                } else suburb = suburb + ' ';
            }

            const city = this.addressEntered.city ? this.addressEntered.city + ', ' : '';
            const state = this.addressEntered.state ? this.addressEntered.state + ' ' : '';
            let zipCode = this.addressEntered.zipCode || '';
            if(zipCode) {
                if(this.addressEntered.country === 'Taiwan') {
                    zipCode = zipCode + lineBreak;
                }
            }

            let country = '';
            if(this.addressEntered.country) {
                if(this.addressEntered.country === 'Australia' || this.addressEntered.country === 'New Zealand') {
                    country = lineBreak + this.addressEntered.country;
                } else if(this.addressEntered.country === 'Taiwan' || this.addressEntered.country === 'HongKong') {
                    country = this.addressEntered.country;
                }
            }

            if(this.addressEntered.country === 'Malaysia') {
                return `${address1} ${address2} ${zipCode} ${city} ${state} ${country}`;
            }

            if(this.addressEntered.country === 'Taiwan' || this.addressEntered.country === 'HongKong') {
                return `${zipCode} ${city} ${suburb} ${address1} ${address2} ${country}`;
            }

            if(this.addressEntered.country === 'China') {
                return `${phoneNumber} ${name} ${this.addressEntered.state}${this.addressEntered.city}${this.addressEntered.suburb}${address1}`;
            }

            return address1 + address2 + suburb + city + state + zipCode + country;
        },
        addressEntryEnhancementEnabled() {
            return this.localization.Data?.AddressEntryEnhancementEnabled && this.isMexico;
        },
        // Note Korea is Sort Order should be cityName / routingLine / suburbName, not cityName / suburbName / routingLine
        addressFields() {
            switch (this.chosenCountry) {
                case AUSTRALIA:
                    return [ 'address_1Data', 'suburbData', 'stateData', 'postalCodeData'];
                case CANADA:
                    return [ 'address_1Data', 'address_2Data', 'cityData', 'postalCodeData', 'provinceData'];
                case KOREA:
                    return [ 'address_1Data', 'address_2Data', 'postalCodeData'];
                case MEXICO:
                    return [ 'address_1Data', 'cityData', 'postalCodeData', 'stateMxData', 'suburbData'];
                case NEW_ZEALAND:
                    return [ 'address_1Data', 'suburbData', 'cityData', 'postalCodeData'];
                case UNITED_STATES:
                    return [ 'address_1Data', 'address_2Data', 'cityData', 'zipCodeData', 'stateData' ];
            }
            return [];
        },
        apiExperianError() {
            // Alias apiError var imported from experian mixin
            return this.apiError;
        },
        areaPlaceholder() {
            return this.getLocalizationProp('Labels.ShippingSection.AreaPlaceholder', 'Area');
        },
        addressSuggestionMaxCount() {
            return this.localization?.Data?.AddressSuggestionMaxCount || undefined;
        },
        bearerToken() {
            return this.getLocalizationProp('Data.Token', '');
        },
        checkDefaultCountryAddress() {
            return (this.getLocalizationProp('Data.CrossCountryModal.DefaultShippingCountry') || '').toLowerCase();
        },
        cityPlaceholder() {
            return this.getLocalizationProp('Labels.ShippingSection.CityPlaceholder', 'City');
        },
        cityReadonly() {
            return [JAPAN, SINGAPORE].includes(this.chosenCountry);
        },
        crossCountryModalContinue() {
            return this.replaceTokenArray(
                this.getLocalizationProp('Data.CrossCountryModal.ContinueToSite', 'Continue to {0} site'),
                [this.crossCountryAddress?.newAddressLabel]
            );
        },
        crossCountryModalRTE() {
            return this.replaceTokenArray(
                this.getLocalizationProp('Data.CrossCountryModal.RteDescription', 'Looks Like You\'ve Changed Your Shipping Country.'),
                [this.crossCountryAddress?.newAddressLabel, this.crossCountryAddress?.oldAddressLabel]
            );
        },
        doesDefaultAddressExist() {
            if(this.isRiverbendSubscription || this.isRiverbend) return true;
            if(this.addresses?.length === 0) return false;
            if(this.addresses?.some((address) => address && address.IsDefault)) return true;
        },
        // addressEntryEnhancementEnabled - let children know of API failure
        hasAddUpdateAddressApiError() {
            return this.listError.length > 0;
        },
        initialCountry() {
            if(this.chosenCountry) {
                return this.chosenCountry;
            }
            if(this.prefilledFormValues?.CountryValue) {
                return this.prefilledFormValues.CountryValue.replaceAll(' ', '').toLowerCase();
            }
            return this.localization.Data.ShippingSection.Regions[0].ServiceName.replaceAll(' ', '').toLowerCase();
        },
        isAustralia() {
            return this.chosenCountry === AUSTRALIA;
        },
        isAustria() {
            return this.chosenCountry === AUSTRIA;
        },
        isBelgium() {
            return this.chosenCountry === BELGIUM;
        },
        isEstonia() {
            return this.chosenCountry === ESTONIA;
        },
        isFinland() {
            return this.chosenCountry === FINLAND;
        },
        /*
         * Used for no-render of existing North America & Asia fields at the bottom
         * of the left col below the address inputs AND disabling of Experian
         *
         * List of countries to be included will grow as new European cultures are added
         */
        isEurope() {
            return [
                AUSTRIA,
                BELGIUM,
                ESTONIA,
                FINLAND,
                GERMANY,
                HUNGARY,
                IRELAND,
                ITALY,
                LATVIA,
                LITHUANIA,
                LUXEMBOURG,
                NETHERLANDS,
                POLAND,
                SPAIN,
                UNITED_KINGDOM
            ].includes(this.chosenCountry);
        },
        isGermany() {
            return this.chosenCountry === GERMANY;
        },
        isHongkong() {
            return this.chosenCountry === HONGKONG;
        },
        isHungary() {
            return this.chosenCountry === HUNGARY;
        },
        isIreland() {
            return this.chosenCountry === IRELAND;
        },
        isItaly() {
            return this.chosenCountry === ITALY;
        },
        isJapan() {
            return this.$env?.Country === 'Japan';
        },
        isKorea() {
            return this.chosenCountry === KOREA;
        },
        isLatvia() {
            return this.chosenCountry === LATVIA;
        },
        isLithuania() {
            return this.chosenCountry === LITHUANIA;
        },
        isLuxembourg() {
            return this.chosenCountry === LUXEMBOURG;
        },
        isMalaysia() {
            return this.chosenCountry === MALAYSIA;
        },
        isMexico() {
            return this.chosenCountry === MEXICO;
        },
        isNetherlands() {
            return this.chosenCountry === NETHERLANDS;
        },
        isNewZealand() {
            return this.chosenCountry === NEW_ZEALAND;
        },
        isPhilippines() {
            return this.chosenCountry === PHILIPPINES;
        },
        isPoland() {
            return this.chosenCountry === POLAND;
        },
        isSingapore() {
            return this.chosenCountry === SINGAPORE;
        },
        isSpain() {
            return this.chosenCountry === SPAIN;
        },
        isTaiwan() {
            return this.chosenCountry === TAIWAN;
        },
        isUnitedKingdom() {
            return this.chosenCountry === UNITED_KINGDOM;
        },
        isChina() {
            return this.chosenCountry === CHINA;
        },
        neverShowSuggestions() {
            return [
                HONGKONG,
                MALAYSIA,
                PHILIPPINES,
                SINGAPORE,
                TAIWAN,
                CHINA
            ].includes(this.chosenCountry) || this.isEurope;
        },
        optionalFields() {
            switch (this.chosenCountry) {
                case AUSTRALIA:
                    return ['address2', 'companyName', 'deliveryInstructions'];
                case AUSTRIA:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case BELGIUM:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case CANADA:
                    return ['address2', 'phoneNumber', 'companyName', 'deliveryInstructions'];
                case ESTONIA:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case FINLAND:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case GERMANY:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case HONGKONG:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case HUNGARY:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case IRELAND:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case ITALY:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case JAPAN:
                    return [ 'suburb' ];
                case KOREA:
                    return ['deliveryInstructions'];
                case LATVIA:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case LITHUANIA:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case LUXEMBOURG:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case MALAYSIA:
                    return ['address2', 'address3', 'phoneNumber', 'deliveryInstructions'];
                case MEXICO:
                    return this.mxAddressEntryEnhancementEnabled ? ['address2', 'deliveryInstructions'] : ['address2', 'address3', 'phoneNumber', 'companyName', 'deliveryInstructions'];
                case NETHERLANDS:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case NEW_ZEALAND:
                    return ['address2', 'phoneNumber', 'companyName', 'deliveryInstructions', 'suburb'];
                case PHILIPPINES:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case POLAND:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case SINGAPORE:
                    return ['address2', 'phoneNumber', 'companyName', 'deliveryInstructions'];
                case SPAIN:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case TAIWAN:
                    return ['address2', 'phoneNumber', 'deliveryInstructions'];
                case UNITED_KINGDOM:
                    return ['address2', 'suburb', 'phoneNumber', 'deliveryInstructions'];
                case UNITED_STATES:
                    return ['address2', 'phoneNumber', 'companyName', 'deliveryInstructions'];
            }
            return [];
        },
        phoneNumberPlaceholder() {
            switch (this.chosenCountry) {
                case AUSTRALIA:
                    return this.getLocalizationProp(
                        'Labels.ShippingSection.PhoneNumberAuPlaceholder'
                    );
                case NEW_ZEALAND:
                    return this.getLocalizationProp(
                        'Labels.ShippingSection.PhoneNumberNzPlaceholder'
                    );
                default:
                    return this.getLocalizationProp(
                        'Labels.ShippingSection.PhoneNumberPlaceholder'
                    );
            }
        },
        preventCopyPasteFeature() {
            return this.localization?.Data?.PreventCopyPasteFeature || false;
        },
        postalCodePlaceholder() {
            return this.getLocalizationProp('Labels.ShippingSection.PostalCodePlaceholder', 'Postal Code');
        },
        postalCodeReadonly() {
            return [JAPAN].includes(this.chosenCountry);
        },
        prefilledFormValues() {
            return this.localization?.Data?.PrefilledFormValues || {};
        },
        provincePlaceholder() {
            return this.getLocalizationProp('Labels.ShippingSection.ProvincePlaceholder', 'Province');
        },
        provinceReadonly() {
            return [JAPAN].includes(this.chosenCountry);
        },
        renderValidationsBelowInputs() {
            return this.localization?.Data?.RenderValidationsBelowInputs || false;
        },
        serviceEnv() {
            return this.$env?.ServiceBaseUrl;
        },
        shouldValidateWithServicesApi() {
            return this.localization?.Data?.ShippingAddressServiceValidation || false;
        },
        showAddressSearch() {
            const hasZipField = this.showFields.includes('zipCode') || this.showFields.includes('postalCode');
            return hasZipField && [JAPAN, KOREA].includes(this.chosenCountry);
        },
        showFields() {
            switch (this.chosenCountry) {
                case AUSTRALIA:
                    return [ 'country', 'name', 'address_1', 'address_2', 'suburb', 'state', 'postalCode', 'deliveryInstructions'];
                case AUSTRIA:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case BELGIUM:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case CANADA:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'province', 'postalCode', 'phoneNumber', 'companyName', 'deliveryInstructions'];
                case ESTONIA:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case FINLAND:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case GERMANY:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case HONGKONG:
                    return [ 'name', 'address_1', 'address_2', 'postalCode', 'city', 'suburb', 'phoneNumber', 'deliveryInstructions'];
                case HUNGARY:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case IRELAND:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'county', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case ITALY:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'county', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case JAPAN:
                    return [ 'name', 'address_1', 'postalCode', 'province', 'city', 'suburb', 'phoneNumber'];
                case KOREA:
                    return [ 'name', 'address_1', 'address_2', 'zipCode', 'phoneNumber', 'deliveryInstructions'];
                case LATVIA:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case LITHUANIA:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case LUXEMBOURG:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case MALAYSIA:
                    return [ 'name', 'address_1', 'address_2', 'address_3', 'city', 'postalCode', 'state', 'phoneNumber', 'deliveryInstructions'];
                case MEXICO:
                    return this.mxAddressEntryEnhancementEnabled
                        ? [ 'name', 'phoneNumber', 'country', 'postalCode', 'stateMx', 'city', 'suburb', 'address_1', 'address_2', 'deliveryInstructions']
                        : [ 'country', 'name', 'address_1', 'address_2', 'address_3', 'city', 'stateMx', 'postalCode', 'suburb', 'phoneNumber', 'deliveryInstructions'];
                case NETHERLANDS:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case NEW_ZEALAND:
                    return [ 'country', 'name', 'address_1', 'address_2', 'suburb', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case PHILIPPINES:
                    return [ 'name', 'address_1', 'address_2', 'province', 'city', 'suburb', 'phoneNumber', 'deliveryInstructions'];
                case POLAND:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case SINGAPORE:
                    return [ 'name', 'address_1', 'address_2', 'city', 'state', 'postalCode', 'phoneNumber', 'companyName', 'deliveryInstructions'];
                case SPAIN:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case TAIWAN:
                    return [ 'name', 'address_1', 'address_2', 'city', 'suburb', 'postalCode', 'phoneNumber', 'deliveryInstructions'];
                case UNITED_KINGDOM:
                    return [ 'country', 'name', 'address_1', 'address_2', 'suburb', 'city', 'postalCode', 'phoneNumber', 'deliveryInstructions' ];
                case UNITED_STATES:
                    return [ 'country', 'name', 'address_1', 'address_2', 'city', 'state', 'zipCode', 'phoneNumber', 'companyName', 'deliveryInstructions'];
                case CHINA:
                    return ['name', 'phoneNumber', 'areaCn', 'address_1', 'postalCode'];
            }
            return [];
        },
        countyPlaceholder() {
            return this.getLocalizationProp('Labels.ShippingSection.CountyPlaceholder', 'County');
        },
        statePlaceholder() {
            return this.getLocalizationProp('Labels.ShippingSection.StatePlaceholder', 'State');
        },
        stateReadonly() {
            return [SINGAPORE].includes(this.chosenCountry);
        },
        suburbPlaceholder() {
            return this.getLocalizationProp('Labels.ShippingSection.SuburbPlaceholder', 'Suburb');
        },
        validateAddressFeature() {
            return this.localization?.Data?.ValidateAddressFeatureFlag || false;
        },
        validateMaxCharLength() {
            return this.localization?.Data?.ValidateMaxCharLength || false;
        },
        zipCodeReadonly() {
            return [KOREA].includes(this.chosenCountry);
        }
    },
    watch: {
        $v: {
            deep: true,
            handler() {
                // Get all validated fields
                const allValidatedFields = this.$v.$params;
                let errorsMsgs = [];

                for (let key of Object.keys(allValidatedFields)) {
                    // Passing boolean errors for each field
                    if(this.$v[key]) this[`${key}Error`] = this.$v[key].$error;
                    // Errors Messages
                    if(this[`${key}Error`]) {
                        let keyError = key.replace('Data', '').replace('_', '');
                        let errorMsg = '';

                        // handle property name exceptions
                        switch (true) {
                            case keyError.includes('state'):
                                keyError = 'state';
                                break;
                            case this.$v[key].maxLength === false:
                                keyError = 'MaxCharacterLengthExceed';
                                break;
                        }
                        if(this.$v[key].supportedCharacter === false) {
                            const inValidCharacters = formHelper.getUnsupportedCharacter(this.$v[key].$model, 'mx');
                            errorMsg = this.getLocalizationProp('Labels.ShippingSection.SpecialCharactersError')?.replace('{0}', inValidCharacters);
                        } else if(this.$v[key].characterLimit === false) {
                            errorMsg = this.getLocalizationProp('Labels.ShippingSection.AllowedCharacterLengthExceeded');
                        } else {
                        // check for special characters in address fields
                            if(!this.mxAddressEntryEnhancementEnabled && this.isMexico && this.validateAddressFeature && /address/i.test(key) && this.$v[key]?.allowed === false) {
                                keyError = 'SpecialChars';
                                this.specialCharsError = true;
                            }

                            const keyErrorCapitalized =
                            keyError.charAt(0).toUpperCase() + keyError.slice(1);
                            const userInputDataLength = this[key] ? this[key].length : 0;

                            const inputDataMaxLength = this.$v[key].$params?.maxLength?.max ?? '';
                            errorMsg = this.getLocalizationProp(
                                `Labels.ShippingSection.${keyErrorCapitalized}Error`,
                                'Required'
                            ).replace(
                                '{0}', inputDataMaxLength
                            ).replace(
                                '{1}', userInputDataLength - inputDataMaxLength
                            );
                        }
                        errorsMsgs.push(errorMsg);

                        this[`${key}ErrorMsg`] = errorMsg;
                    }

                    this.errorsMsgs = errorsMsgs;
                }
            }
        },
        addressEntered() {
            // Reset if change any field
            this.isFormValid = false;
            if(this.isSingapore) {
                this.cityData = this.prefilledFormValues?.CityValue ?? 'Singapore';
                this.stateData = this.prefilledFormValues?.StateValue ?? 'SGP';
            }
        },
        chosenCountry(val, oldVal) {
            if(val === SINGAPORE) {
                this.cityData = this.prefilledFormValues?.CityValue ?? 'Singapore';
                this.stateData = this.prefilledFormValues?.StateValue ?? 'SGP';
            }

            // Reset Mexico-specific fields when switching FROM or TO Mexico
            if(oldVal === MEXICO || val === MEXICO) {
                this.resetMexicoAddressFields();
            }

            this.getCountryInfo();
        }
    },
    async mounted() {
        // Setting the country should be executed before the asynchronous task to prevent the `address-form` from shaking due to changing the country.
        this.getCountryInfo();
        this.setCountry();

        const searchTerms = new URLSearchParams(window.location.search);
        this.addressId = searchTerms.get('addressid') || searchTerms.get('addressId') || 0;
        this.hasImea = this.$custInfo?.hasIMEA;

        this.settingInitialData = true;

        if(!this.isRiverbend && !this.isRiverbendGuest && !this.isGuestOrder) {
            await this.fetchAllAddresses();
        }

        if(this.isPhilippines) {
            await this.setPhInitialSelectPlaceholders();
            await this.setPhPrefilledData();
        }
        if(this.isHongkong) {
            await this.setHkInitialSelectPlaceholders();
            await this.setHkCityData();
            await this.setHkPrefilledData();
        }

        if(this.isTaiwan && !this.isInCheckout) {
            await this.setTwInitialSelectPlaceholders();
            await this.setTwCityData();
            await this.setTwPrefilledData();
        }

        // Mexico address entry enhancement - Phone Number field to be pre-filled in ADD flow -->
        if(this.mxAddressEntryEnhancementEnabled && this.isMexico) {
            this.phoneNumberData = this.getLocalizationProp('Data.PrimaryPhoneNumber', '');
        }

        this.crossCountryAddress.oldAddress = this.checkDefaultCountryAddress;
        this.crossCountryAddress.isDefault = this.defaultShip;

        this.$nextTick(() => {
            if(!this.isPhilippines && !this.isHongkong && !this.isTaiwan) {
                this.setPrefilledData();
            }

            this.settingInitialData = false;

            if(this.isJapan || this.isKorea || this.isPhilippines) {
                this.expDisabled = true;
            }

            // Store results
            this.$nextTick(() => {
                this.finalDataKeys();
                this.init = false;
            });
        });
    },
    methods: {
        ...mapActions('shippingAddress', ['fetchAllAddresses']),

        replaceTokenArray,
        callModal() {
            this.showModal = true;
        },
        getMaxLength(field) {
            return formHelper.maxChar.mxImprovedUx[field] || 100;
        },

        checkFinalAddress() {
            // If the user selected an address from experian then it is a valid address.
            if(this.suggestionPick) {
                this.isFormValid = true;
                if(this.isRiverbendSubscription) {
                    this.submitRiverbendAddress();
                } else {
                    this.submitAddress();
                }
                return;
            }
            // Japan, Korea, Philippines, Hongkong, Taiwan, and Europe don't use experian api
            // so additional checks aren't needed
            if(
                this.isJapan ||
                this.isKorea ||
                this.isPhilippines ||
                this.isHongkong ||
                this.isTaiwan ||
                this.isEurope ||
                // Bypass experian if ShippingAddressServiceValidation flag is true
                // and user has verified address with checkbox
                (this.shouldValidateWithServicesApi && this.isAddressVerifiedByUserCheckbox)
            ) {
                this.submitAddress();
                return;
            }
            // Format the user entered address to be like the response from the experian api
            let apiFormatAddress = '';
            let postalCode = '';
            switch (this.chosenCountry) {
                case AUSTRALIA:
                    apiFormatAddress = `${this.address_1Data} ${this.suburbData}  ${this.stateData} ${this.postalCodeData}`;
                    break;
                case CANADA:
                    apiFormatAddress = `${this.address_1Data} ${this.cityData} ${this.provinceData} ${this.postalCodeData}`;
                    break;
                case HONGKONG:
                    apiFormatAddress = `${this.postalCodeData} ${this.cityData} ${this.suburbData} ${this.address_1Data} ${this.chosenCountry}`;
                    break;
                case MALAYSIA:
                    apiFormatAddress = `${this.address_1Data} ${this.postalCodeData} ${this.cityData} ${this.stateData}`;
                    break;
                case MEXICO:
                    apiFormatAddress = `${this.address_1Data} ${this.postalCodeData} ${this.cityData} ${this.stateLongNames[this.stateMx.findIndex(mx => mx === this.stateMxData)]}`;
                    break;
                case NEW_ZEALAND:
                    apiFormatAddress = `${this.address_1Data} ${this.suburbData}${this.suburbData ? ' ' : ''}${this.cityData} ${this.postalCodeData}`;
                    break;
                case PHILIPPINES:
                    apiFormatAddress = `${this.address_1Data} ${this.suburbData} ${this.cityData} ${this.provinceData}`;
                    break;
                case SINGAPORE:
                    apiFormatAddress = `${this.address_1Data} ${this.cityData} ${this.stateData} ${this.postalCodeData}`;
                    break;
                case TAIWAN:
                    apiFormatAddress = `${this.postalCodeData} ${this.cityData} ${this.suburbData} ${this.address_1Data} ${this.chosenCountry}`;
                    break;
                case UNITED_STATES:
                    apiFormatAddress = `${this.address_1Data} ${this.cityData} ${this.stateData}`;
                    postalCode = this.zipCodeData;
                    break;
                case CHINA:
                    apiFormatAddress = `${this.address_1Data} ${this.cityData} ${this.provinceData}`;
                    break;
            }
            // Just need to confirm the address a second time
            if(this.isChina) {
                // open the second confirm modal
                this.openSecondConfirmAddressModal();
                return;
            }
            // When the user enters their address manually without clicking on a suggestion.
            if(this.addressList && apiFormatAddress) {
                // Checks to see if the address entered in is in the list of suggestions
                const userDataInSuggestions = this.addressList.find(address => {
                    const doesUsCaAddressMatch = address?.text?.replaceAll(',', '').toLowerCase() === apiFormatAddress.toLowerCase();
                    const doesAddressMatch = address?.suggestion?.replaceAll(',', '').toLowerCase() === apiFormatAddress.toLowerCase();
                    // Have to match postal codes separately for US and CA since the postal codes come separately where MEX and Rest Of World they come together with the address.
                    const doesPostalCodeMatch = (this.chosenCountry === UNITED_STATES && address.postalCode.slice(0, 5) === postalCode.slice(0, 5)) || this.chosenCountry === CANADA;
                    return (doesUsCaAddressMatch && doesPostalCodeMatch) || doesAddressMatch;
                });
                // Found the user's address in the list of suggestions
                if(userDataInSuggestions || this.isMalaysia || this.isSingapore) {
                    if(this.chosenCountry === UNITED_STATES) {
                        // Replace zip code on form. For the +4 digits of the US zip code, we trust the response from Experian more than the user's input
                        this.zipCodeData = userDataInSuggestions.postalCode;
                    }
                    this.isFormValid = true;
                    if(this.isRiverbendSubscription) {
                        this.submitRiverbendAddress();
                    } else {
                        this.submitAddress();
                    }
                } else {
                    // Not in the system - call modal
                    this.callModal();
                }
            }
        },
        async chosenUserEnteredAddress() { // MX address entry enhancement
            this.suggestionPick = false;
            await this.handleAddressSelection(this.userEnteredAddressFromInternalDataset);
        },
        async chosenValidatedAddress(addressChose) { // MX address entry enhancement
            this.suggestionPick = true;
            const addressData = this.validatedAddressFromInternalDataset[addressChose];
            await this.handleAddressSelection(addressData);
        },
        specialFieldsInvalid() {
            if(this.showAreaCn) {
                const hasProhibitAreaCnError = this.$refs.areaCnRef.showError;
                if(hasProhibitAreaCnError) return true;
            }
            return false;
        },
        checkOverTheLimitValidation(field) {
            return this.$v[field]?.characterLimit;
        },
        checkSave(evt) {
            // Calling modal if default is ticked and crosscountry
            this.crossCountryAddress.newAddress = this.chosenCountry;
            this.crossCountryAddress.isDefault = this.defaultShip;
            const newAddress = this.crossCountryAddress.newAddress;
            const oldAddress = this.crossCountryAddress.oldAddress;
            if(this.addressEntryEnhancementEnabled && !this.isInCheckout) {
                this.handleMexicoEnhancedAddressForm(evt);
            } else this.$v.$touch();
            if(this.specialFieldsInvalid()) return;
            // Mexico address entry enhancement is enabled and postal code mismatch errors present, return early
            if(this.addressEntryEnhancementEnabled && this.hasPostalCodeValidationErrors) return;
            if(!this.$v.$invalid) {
                if((this.crossCountryAddress.isDefault || this.isInCheckout) && (oldAddress !== newAddress) && this.localization?.Data?.IsCrossCountryEnabled) {
                    // Cross country modal
                    evt.preventDefault();
                    this.openCrossCountryAddress(oldAddress, newAddress);
                } else {
                    // Sending the form
                    if(this.isRiverbendSubscription) {
                        (this.isFormValid) ? this.submitRiverbendAddress() : this.checkFinalAddress();
                    } else {
                        if(this.addressEntryEnhancementEnabled && this.isInCheckout) {
                            // MX address entry enhancement enabled and in checkout - validate with internal dataset
                            // bypass experian modal and instead trigger validated-address-picker modal
                            this.validateWithInternalDataset();
                        } else {
                            (this.isFormValid) ? this.submitAddress() : this.checkFinalAddress();
                        }
                    }
                }
            }
        },

        async choseAddress(addressUserChose) {
            const response = await this.chosenAddress(addressUserChose, false, true);
            if(response) {
                if(this.isRiverbendSubscription) {
                    this.submitRiverbendAddress();
                } else {
                    this.submitAddress();
                }
            }
        },

        choseEnteredAddress() {
            if(this.isRiverbendSubscription) {
                this.submitRiverbendAddress();
            } else {
                this.submitAddress();
            }
        },

        closeModal() {
            this.showModal = false;
        },

        continueCrossCountryAddress() {
            this.crossCountryAddressLoading = true;
            (this.isFormValid) ? this.submitAddress() : this.checkFinalAddress();
        },

        determineLengthValidation(maxCharLimit) {
            return this.validateMaxCharLength && maxLength(maxCharLimit);
        },

        finalDataKeys() {
            let addressShipping = {
                id: this.addressId,
                address1: this.address_1Data,
                address2: this.address_2Data,
                address3: this.address_3Data,
                city: this.cityData,
                province: this.provinceData?.toUpperCase(),
                state: this.stateData?.toUpperCase(),
                suburb: this.suburbData,
                county: this.countyData,
                zipCode: this.zipCodeData || this.postalCodeData,
                phoneNumber: this.phoneNumberData,
                deliveryInstructions: this.deliveryInstructionsData,
                companyName: this.companyNameData
            };
            switch (this.chosenCountry) {
                case AUSTRALIA:
                    addressShipping.country = 'Australia';
                    break;
                case CANADA:
                    addressShipping.country = 'Canada';
                    break;
                case HONGKONG:
                    addressShipping.country = 'HongKong';
                    break;
                case MALAYSIA:
                    addressShipping.country = 'Malaysia';
                    break;
                case MEXICO:
                    addressShipping.country = 'Mexico';
                    addressShipping.state = this.stateMxData;
                    break;
                case NEW_ZEALAND:
                    addressShipping.country = 'NewZealand';
                    break;
                case PHILIPPINES:
                    addressShipping.country = 'Philippines';
                    break;
                case SINGAPORE:
                    addressShipping.country = 'Singapore';
                    break;
                case TAIWAN:
                    addressShipping.country = 'Taiwan';
                    break;
                case UNITED_STATES:
                    addressShipping.country = 'UnitedStates';
                    break;
                case CHINA:
                    addressShipping.country = 'China';
                    break;
            }
            this.addressShipping = addressShipping;
        },

        formatLabel(localProp, localizationProp, fallbackLabel) {
            const label = this.getLocalizationProp(localizationProp, fallbackLabel);

            if(this.optionalFields.includes(localProp)) {
                return replaceToken(this.getLocalizationProp('Labels.ShippingSection.Optional'), label);
            }

            return label;
        },

        getCountryInfo() {
            // Get all info about the countries, states
            const countries = this.getLocalizationProp('Data.ShippingSection.Regions') ?? UNITED_STATES;
            // reassign values once address form opens up
            this.countriesLabels = [];
            this.countriesValues = [];
            if(countries) {
                countries.forEach((country) => {
                    // countries
                    this.countriesLabels.push(country.RegionName);
                    this.countriesValues.push(country.ServiceName.toLowerCase().replace(' ', ''));
                });

                // US states
                const usData = countries.find((name) => name.ServiceName.toLowerCase().replace(' ', '') === UNITED_STATES);
                if(usData) this.state = this.getStateValues(usData, this.statePlaceholder);
                // CAN provinces
                const canData = countries.find((name) => name.ServiceName.toLowerCase() === CANADA);
                if(canData) this.province = this.getStateValues(canData, this.provincePlaceholder);
                // MEX provinces
                const mexData = countries.find((name) => name.ServiceName.toLowerCase() === MEXICO);
                if(mexData) {
                    this.suburbAfter = true;
                    const stateList = mexData?.provinces.sort((a, b) => a.ProvinceValue.localeCompare(b.ProvinceValue));
                    this.stateMx = stateList.map(state => state.ProvinceValue);
                    this.stateMx.unshift(this.statePlaceholder);
                    this.stateLongNames = stateList.map(state => state.ServiceName);
                    this.stateLongNames.unshift(this.statePlaceholder);
                }
                // AU states
                const auData = countries.find((name) => name.ServiceName.toLowerCase() === AUSTRALIA);
                if(auData) {
                    this.suburbBefore = true;
                    this.state = this.getStateValues(auData, this.statePlaceholder);
                }
                // MALAYSIA
                const myData = countries.find((name) => name.ServiceName.toLowerCase() === MALAYSIA);
                if(myData) {
                    const states = myData?.provinces.sort();
                    this.state = states.map(state => state.ProvinceValue);
                    this.state.unshift(this.statePlaceholder);
                    this.stateLongNames = states.map(state => state.ServiceName);
                    this.stateLongNames.unshift(this.statePlaceholder);
                }
                // PH provinces
                const phData = countries.find((name) => name.ServiceName.toLowerCase() === PHILIPPINES);

                if(phData) {
                    const provinces = phData?.provinces.sort();
                    this.province = provinces.map(province => province.ProvinceValue);
                    this.province.unshift(this.provincePlaceholder);
                    this.provinceLongNames = provinces.map(province => province.ServiceName);
                    this.provinceLongNames.unshift(this.provincePlaceholder);
                }
            }
            // Japan needs to be outside if statement since countries will be empty
            if(this.isJapan) {
                this.suburbAfter = true;
            }
        },

        async getProdSelectOptionData(searchTerm) {
            let requestHeaders = new Headers();
            requestHeaders.append('Authorization', 'Bearer ' + this.bearerToken);
            requestHeaders.append('Content-Type', 'application/json; charset=utf-8');

            const apiServicesUrl = searchTerm
                ? `${this.serviceEnv}/address/v1/search/addressselections?searchTerm=${searchTerm}&country=${this.chosenCountry}`
                : `${this.serviceEnv}/address/v1/search/addressselections?country=${this.chosenCountry}`;

            const requestConfig = { method: 'GET', headers: requestHeaders };

            try {
                const response = await fetch(apiServicesUrl, requestConfig);
                const result = await response.json();
                return result;
            } catch (error) {
                console.log('SELECT OPTION API DATA ERROR -> ', error);
            }
        },

        getStateValues(provinceData, placeholder) {
            const states = provinceData.provinces;
            if(states.length) {
                let statesRaw = [];
                statesRaw = states.map(state => state.ProvinceValue);
                statesRaw.sort().unshift(placeholder);
                return statesRaw;
            }
        },
        async handleAddressSelection(addressData) { // MX address entry enhancement
            this.addressSelectedFromModal = true;
            await this.$nextTick();
            await this.updateFields(addressData);

            // Bug 299867: Validate before submitting
            await this.$nextTick();
            this.$v.$touch();

            if(this.$v.$invalid) {
                this.addressSelectedFromModal = false;
                return;
            }

            this.submitAddress();
        },
        handleMexicoEnhancedAddressForm(evt) {
            // This step should happen only after the address-form-mx child-form is validated
            this.isFormValid = true;
            // Map the values from the child form to the parent component for final post
            Object.keys(evt).forEach((key) => {
                this[key] = evt[key];
            });
        },
        listApiErrors(response) {
            this.addressEntryEnhancementEnabled && (this.addressSelectedFromModal = false); // let user hit postal code search again after API error -checkout flow
            console.log('-error-> ', response?.data?.ErrorMessages);
            if(response?.data?.ErrorMessages) this.listError = response?.data?.ErrorMessages;
        },

        async nextOnBusinessAddressPost(addressApiRequest) {
            // reset isLoadingSubmitForm when subsequent call to update business address (Bug-111984)
            this.isLoadingSubmitForm = true;
            // subsequent call - update the same address as business address as well
            const addressApiRequestForBusAdd = {...addressApiRequest, 'IsDefault': false, 'AddressType': addressTypes.business};
            const response = await apiAdd.post(addressApiRequestForBusAdd);
            if(response.success && response.data.Success) {
                this.isLoadingSubmitForm = false;
                this.listError = [];
                // close this sequence
                this.$emit('completeThisStatus', {completed: true, index: 0, isActive: false, isEmpty: false});
                this.$emit('getCheckoutDataAgain', false);
            } else {
                this.isLoadingSubmitForm = false;
                this.listApiErrors(response);
            }
        },

        nextPage(id) {
            const backTo = new URLSearchParams(window.location.search).get('backTo');
            if(backTo) {
                const addressId = id || parseInt(this.addressEntered.id);
                window.location.href = `${backTo}?addressId=${addressId}`;
            } else {
                // Redirect to prev page
                history.go(-1);
            }
        },

        onAddressSearchConfirm(address) {
            this.$modal.hide();
            this.cityData = address.city;
            this.stateData = address.state;
            this.suburbData = address.suburb;
            this.zipCodeData = address.postalCode;
            this.postalCodeData = address.postalCode;
            // Japan specific mapping
            if(this.isJapan) {
                this.provinceData = address.state;
            }
            // Korean specific mapping
            // Sort Order should be cityName / routingLine / suburbName, not cityName / suburbName / routingLine
            if(this.isKorea) {
                this.address_1Data = `${address.city} ${address.routingLine} ${address.suburb}`;
            }
        },

        openCrossCountryAddress(oldAddress, newAddress) {
            const countryLabelsProp = this.getLocalizationProp('Data.ShippingSection.Regions');
            // Old country
            countryLabelsProp.find(val => {
                if(val.ServiceName.toLowerCase() === oldAddress) this.crossCountryAddress.oldAddressLabel = val.RegionName;
            });
            // New country
            countryLabelsProp.find(val => {
                if(val.ServiceName.toLowerCase() === newAddress) this.crossCountryAddress.newAddressLabel = val.RegionName;
            });
            // Opening modal
            this.$modal.show({ id: 'modal-cross-country-address' });
            // Set as redirect after
            this.isCrossCountry = true;

            this.$modal.$on.hidden(() => {
                this.isCrossCountry = false;
                this.isFormValid = false;
            });
        },

        populateFields(val) {
            this.closeSuggestionList();
            const objectValue = (val.result) ? val.result : val;
            // Fields
            let address1 = null;
            let address2 = null;
            let locality = null;
            let region = null;
            let postalCode = null;
            let suburb = null;
            let address = {};

            if(!val.result) {
                objectValue.address.forEach(el => {
                    address[Object.keys(el)] = Object.values(el)[0];
                });
            }
            // Results variables
            if(this.chosenCountry === UNITED_STATES || this.chosenCountry === CANADA) {
                // USA and CAN
                address1 = objectValue.address.address_line_1 || address.addressLine1;
                address2 = objectValue.address.address_line_2 || address.addressLine2;
                locality = objectValue.address.locality || address.locality; // city, suburb
                region = objectValue.address.region || address.province; // state/province
                postalCode = objectValue.address.postal_code || address.postalCode;
            } else if(this.chosenCountry !== MEXICO) {
                // ROW
                address1 = objectValue.address.address_line_1 || address.addressLine1;
                locality = objectValue.address.locality || address.locality; // city, suburb
                region = objectValue.address.region || address.province; // state/province
                postalCode = objectValue.address.postal_code || address.postalCode;
            } else {
                // MEX
                let mexAddress = {};
                objectValue.components.map(el => {
                    mexAddress[Object.keys(el)] = Object.values(el)[0];
                });
                if(this.mxAddressEntryEnhancementEnabled) {
                    // For Mexico address entry enhancement, only populate address1 field.
                    // Avoid overwriting fields that were populated by postalCodeSearch API response with values from Experian API
                    address1 = `${(mexAddress.street1) ? mexAddress.street1 : ''} ${(mexAddress.streetNumber1 ? mexAddress.streetNumber1 : '')}`;
                    this.address_1Data = address1;
                } else {
                    address1 = `${(mexAddress.street1) ? mexAddress.street1 : ''} ${(mexAddress.streetNumber1 ? mexAddress.streetNumber1 : '')}`;
                    locality = mexAddress.locality1; // city
                    region = (mexAddress.province1.toUpperCase() === 'MÉXICO') ? 'Estado de Mexico' : mexAddress.province1; // state/province
                    postalCode = mexAddress.postalCode1;
                    suburb = mexAddress.locality2;
                }
            }

            // Populating fields - USA
            let resultsAddressFields = [];
            if(this.chosenCountry === UNITED_STATES || this.chosenCountry === CANADA) {
                resultsAddressFields = [address1, address2, locality, postalCode, region];
            } else if(this.chosenCountry === AUSTRALIA || this.chosenCountry === NEW_ZEALAND) {
                resultsAddressFields = [address1, locality, region, postalCode];
            } else if((this.chosenCountry === MEXICO && !this.mxAddressEntryEnhancementEnabled)) {
                // Populating fields - Mexico
                const resultsMexico = [address1, locality, postalCode, region, suburb];
                this.addressFields.forEach((element, index) => {
                    let value = resultsMexico[index];
                    // State
                    if(this.addressFields[index] === 'stateMxData') {
                        // Removing accents
                        value = resultsMexico[index].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                        const mxIndex = this.stateLongNames.findIndex(state => {
                            const stateLowerCase = state.toLowerCase();
                            return stateLowerCase === value;
                        });
                        if(mxIndex) this.stateMxData = this.stateMx[mxIndex];
                    } else {
                        this[element] = value;
                    }
                });
            }

            if(resultsAddressFields.length > 0) {
                this.addressFields.forEach((element, index) => {
                    this[element] = resultsAddressFields[index];
                });
            }
            // Store results
            this.finalDataKeys();
            // Wait until all the input fields have been updated to change this variable.
            // If we don't have this section, suggestionPick will always be set to false since
            // this function updates the input fields to populate it with the suggested addresses.
            this.$nextTick(() => {
                this.suggestionPick = true;
            });
        },

        async postAsShipAddress(addressApiRequest) {
            // subsequent call - update the same address as shipping address as well
            const addressApiRequestForBusAdd = {...addressApiRequest, 'IsDefault': true, 'AddressType': addressTypes.shipping};
            const response = await apiAdd.post(addressApiRequestForBusAdd);
            if(response.success && response.data.Success) {
                this.isLoadingSubmitForm = false;
                this.listError = [];
            } else {
                this.isLoadingSubmitForm = false;
                this.listApiErrors(response);
            }
        },

        preventCopyPaste(fieldName, event) {
            let errorFieldName = fieldName + 'Error'; // Derive the error property name from the provided field name

            // Check if the field is one of the address fields
            if(['address_1Data', 'address_2Data', 'address_3Data'].includes(fieldName) && this.isMexico && this.preventCopyPasteFeature) {
                this.$set(this, errorFieldName, true); // Set the DataError for the field to true
                this.copyPasteError = this.getLocalizationProp('Labels.ShippingSection.CopyPasteError'); // Set the copyPasteError
                event.preventDefault(); // This prevents the paste action
            }
            // Mark the field as interacted with (i.e., dirty)
            this.$v[fieldName].$touch();
        },

        requestToSuggestionsApi(dataEntered, country, closeSuggestion, populateField, suggestionMaxCount) {
            // Add some debounce
            clearTimeout(this.intervalId);
            if(!this.neverShowSuggestions) {
                this.intervalId = setTimeout(() => {
                    this.getAddressApi(dataEntered, country, closeSuggestion, populateField, suggestionMaxCount);
                }, 300);
            }
        },

        // OLE business address scenario
        resetBusinessAddressField() {
            this.addressId = null;
            this.address_1Data = null;
            this.address_2Data = null;
            this.address_3Data = null;
            this.suburbData = null;
            this.cityData = null;
            this.stateData = null;
            this.stateMxData = null;
            this.postalCodeData = null;
            this.provinceData = null;
            this.zipCodeData = null;
        },

        // Reset all Mexico-specific fields and state
        resetMexicoAddressFields() {
            // Reset address fields
            if(this.address_1Data !== undefined) this.address_1Data = '';
            if(this.address_2Data !== undefined) this.address_2Data = '';
            if(this.address_3Data !== undefined) this.address_3Data = '';
            if(this.cityData !== undefined) this.cityData = '';
            if(this.suburbData !== undefined) this.suburbData = '';
            if(this.suburbList !== undefined) this.suburbList = [];
            if(this.deliveryInstructionsData !== undefined) this.deliveryInstructionsData = '';
            if(this.nameData !== undefined) this.nameData = '';
            if(this.phoneNumberData !== undefined) this.phoneNumberData = '';
            // Reset enable/disable flags
            if(this.enableSecondaryFields !== undefined) this.enableSecondaryFields = false;
            if(this.enableCityField !== undefined) this.enableCityField = false;
            if(this.enableStateField !== undefined) this.enableStateField = false;
            if(this.enableSuburbField !== undefined) this.enableSuburbField = false;
            // Reset validation state flags
            if(this.hasValidatedEditFlow !== undefined) this.hasValidatedEditFlow = false;
            if(this.addressSelectedFromModal !== undefined) this.addressSelectedFromModal = false;
            if(this.hasPostalCodeMatches !== undefined) this.hasPostalCodeMatches = false;
            // Reset error states
            if(this.postalCodeApiValidationError !== undefined) this.postalCodeApiValidationError = false;
            if(this.postalCodeAndCityMismatchError !== undefined) this.postalCodeAndCityMismatchError = false;
            if(this.postalCodeAndStateMismatchError !== undefined) this.postalCodeAndStateMismatchError = false;
            if(this.postalCodeAndSuburbMismatchError !== undefined) this.postalCodeAndSuburbMismatchError = false;
        },

        selectedCountry(payload) {
            this.chosenCountry = payload.value.toLowerCase();
            if(!this.init) {
                // Reset errors
                this.$v.$reset();
                // Reset address suggestion list
                this.addressList = [];
                // Reseting State/Province and zip/postal as asked in the US 12926
                if(this.chosenCountry === SINGAPORE) {
                    this.stateData = this.prefilledFormValues?.StateValue ?? 'SGP';
                    this.provinceData = this.prefilledFormValues?.StateValue ?? 'SGP';
                    this.cityData = this.prefilledFormValues?.CityValue ?? 'Singapore';
                } else {
                    this.stateData = '';
                    this.provinceData = '';
                }
                this.stateMxData = '';
                this.postalCodeData = '';
                this.zipCodeData = '';
                // Reset error if required on one field but optional on another.
                this.suburbDataError = false;
            }
            // Call API if there is data in address field and do not show the suggestion list
            if(this.address_1Data?.length > 3 && !this.neverShowSuggestions) {
                this.getAddressApi(
                    this.address_1Data,
                    this.chosenCountry,
                    this.init ?? false,
                    true,
                    this.addressSuggestionMaxCount
                );
                // Reset init
                this.init = false;
            }
        },

        setCountry() {
            const shippingSection = this.localization?.Data?.ShippingSection || {};
            const prefilledCountry = this.prefilledFormValues?.CountryValue
                ?.toLowerCase()
                .replaceAll(' ', '');
            const currentCountry = shippingSection?.CurrentCountry
                ?.toLowerCase()
                .replaceAll(' ', '');
            const defaultCountry = shippingSection?.Regions?.[0]?.ServiceName
                ?.replaceAll(' ', '')
                .toLowerCase();
            if(this.isRiverbendSubscription) {
                this.chosenCountry = this.$env?.Country
                    ?.replaceAll(' ', '')
                    .toLowerCase();
            } else this.chosenCountry = prefilledCountry || currentCountry || defaultCountry;
        },

        setInput(val) {
            if(this.settingInitialData) {
                return;
            }
            const id = val.target?.id;
            const model = val.model;

            if(id) this[`${id}Data`] = val.target?.value;
            if(model) {
                const chosenProp = model.replace('Data', '');
                (val.value === this[chosenProp][0]) ? this[model] = '' : this[model] = val.value;
            }

            let dataEntered = '';
            // Bug 27405 - Gets data from all of the fields (for that country) and if they aren't null, puts them in a string
            // to pass to Experian.
            // unless restrictSuggestionInputToAddress is true, then only pass the address
            if(!this.restrictSuggestionInputToAddress) {
                this.addressFields.forEach(field => {
                    if(this[field]) {
                        dataEntered += this[field] + ', ';
                    }
                });
            } else dataEntered = this.address_1Data;
            // Address 1 - Experian integration
            // close suggestion list if already open on tab or escape key
            if(id !== 'address_1' && this.showAddressList && (val.key === 'Escape' || val.key === 'Tab')) {
                this.showAddressList = false;
            }
            if(id === 'address_1' && this.address_1Data.length > 3) {
                if(val.key === 'Escape' || val.key === 'Tab') {
                    this.showAddressList = false;
                    return;
                }
                if(val.key === 'ArrowDown' && this.$refs['suggestion'][0]) {
                    val.preventDefault();
                    this.showAddressList = true;
                    this.$refs['suggestion'][0].focus();
                    this.addressFocusIndex = 0;
                } else if(val.key !== 'Tab' && !(this.mxAddressEntryEnhancementEnabled && this.isMexico)) {
                    this.requestToSuggestionsApi(
                        dataEntered,
                        this.chosenCountry,
                        false,
                        false,
                        this.addressSuggestionMaxCount
                    );
                }
            } else if(this.address_1Data?.length > 3 && !this.suggestionPick) {
                // call to suggestion API on State field - exception MX
                if(val?.model === 'stateData' || val?.model === 'provinceData') {
                    // Adding the State to refine the match in the search
                    if(val?.value && !this.settingInitialData) {
                        this.requestToSuggestionsApi(
                            dataEntered,
                            this.chosenCountry,
                            true,
                            true,
                            this.addressSuggestionMaxCount
                        );
                    }
                }
                // call to suggestion API on postalcode field - For MX
                if((val?.model === 'stateMxData' || id === 'postalCode') && this.chosenCountry === MEXICO && this.stateMxData && this.postalCodeData && this.postalCodeData?.length > 4 && !this.settingInitialData) {
                    // request suggestions only after having state and postalCode values are in -  For MX
                    this.requestToSuggestionsApi(
                        dataEntered,
                        this.chosenCountry,
                        true,
                        true,
                        this.addressSuggestionMaxCount
                    );
                }
            } else {
                this.showAddressList = false;
            }

            if(id !== 'name' && id !== 'deliveryInstructions' && id !== 'phoneNumber' && id !== 'companyName') {
                // Since the user changed an address input field, we need to reset suggestionPick as it wasn't picked from the address suggestions.
                // Do not reset for MX address entry enhancement since address is getting validated from internal API before getting saved
                if(!(this.mxAddressEntryEnhancementEnabled && this.isMexico)) {
                    this.suggestionPick = false;
                }
            }
        },

        // OLE checkout flow & a la carte riverbend flow
        async setOleAndRiverbendCheckoutFlow(addressApiRequest, newAddressId) {
            // only if user does not have either business or shipping address on file
            if(!this.showAddressEditView) {
                if(this.showShippingAddForm) {
                    if(!this.hasBusinessAddress && !this.hasImea && !this.hasShippingAddress) {
                        if(!this.getLocalizationProp('Data.NotCopyBusinessAddressFeatureFlag')) {
                            this.nextOnBusinessAddressPost(addressApiRequest);
                        } else {
                            // close the sequence
                            this.$emit('completeThisStatus', {completed: true, index: 0, isActive: false, isEmpty: false});
                            this.$emit('getCheckoutDataAgain', false);
                        }
                    }
                    if(!this.hasBusinessAddress && this.hasImea && !this.hasShippingAddress) {
                        if(this.checkboxChecked) {
                            if(!this.getLocalizationProp('Data.NotCopyBusinessAddressFeatureFlag')) {
                                this.nextOnBusinessAddressPost(addressApiRequest);
                            } else {
                                // close the sequence
                                this.$emit('completeThisStatus', {completed: true, index: 0, isActive: false, isEmpty: false});
                                this.$emit('getCheckoutDataAgain', false);
                            }
                        } else {
                            // to open separate business address form
                            this.$emit('setAddressForm', {shippingAddressForm: false, businessAddressForm: true});
                            // reset address fields on Business Address form
                            this.resetBusinessAddressField();
                            this.$emit('getCheckoutDataAgain', false, newAddressId);
                        }
                    }
                    if(this.hasBusinessAddress && !this.hasShippingAddress) {
                        this.$emit('setAddressForm', {shippingAddressForm: false, businessAddressForm: false});
                        this.$emit('getCheckoutDataAgain', false, newAddressId);
                    }
                } else if(this.showBusinessAddForm) {
                    // close the sequence
                    this.$emit('completeThisStatus', {completed: true, index: 0, isActive: false, isEmpty: false});
                    this.$emit('getCheckoutDataAgain', true);
                }
            } else {
                // close the sequence
                this.$emit('completeThisStatus', {completed: true, index: 0, isActive: false, isEmpty: false});
                if(this.isRiverbend) {
                    this.$emit('getCheckoutDataAgain', newAddressId || addressApiRequest?.AddressId);
                } else {
                    this.$emit('getCheckoutDataAgain', false, newAddressId || addressApiRequest?.AddressId);
                }
            }
        },

        async setPrefilledData() {
            if(this.isInCheckout) return;
            // Getting all values and pass to data
            let localizationProps = [
                'Name',
                'Address_1',
                'Address_2',
                'Address_3',
                'City',
                'Country',
                'County',
                'Island',
                'Suburb',
                'PostalCode',
                'Province',
                'StateMx',
                'State',
                'ZipCode',
                'PhoneNumber',
                'CompanyName',
                'DeliveryInstructions'
            ];

            if(this.isSingapore) {
                localizationProps = [
                    'Name',
                    'Address_1',
                    'Address_2',
                    'Address_3',
                    'Country',
                    'Island',
                    'Suburb',
                    'PostalCode',
                    'Province',
                    'StateMx',
                    'ZipCode',
                    'PhoneNumber',
                    'CompanyName',
                    'DeliveryInstructions'
                ];
            }

            this.init = true;
            // Set prefilled values
            localizationProps.forEach((prop) => {
                // Logic for Localization
                const localData = `${prop[0].toLowerCase()}${prop.slice(1)}Data` || `${prop.toLowerCase()}${prop.slice(1)}Data`;
                // Logic for Prop
                if(this.showFields.find(field => field + 'Data' === localData)) {
                    // suburb will be passed as the city for Australia
                    this[localData] = this.prefilledFormValues[`${prop}Value`] || '';
                }
            });
            // handle full state names
            if(this.localization.Data.ShowFullStateName) {
                this.chosenCountry === MEXICO
                    ? this.stateMxData = this.prefilledFormValues?.StateFullName
                    : this.stateData = this.prefilledFormValues?.StateFullName;
            }
            // handle property name exceptions
            if(this.chosenCountry === AUSTRALIA) {
                // Australia will pass suburb as CityValue
                this.suburbData = this.prefilledFormValues.CityValue;
            }
            // handle hidden fields that still need to be passed to api
            if(this.chosenCountry === KOREA) {
                this.cityData = this.prefilledFormValues.CityValue;
                this.stateData = this.prefilledFormValues.StateValue;
                this.suburbData = this.prefilledFormValues.SuburbValue;
            }

            this.defaultShip = this.prefilledFormValues.IsDefault || !this.doesDefaultAddressExist;
        },

        async submitAddress() {
            this.isLoadingSubmitForm = true;

            const validationResponse = await this.validateWithApi();
            if(this.isDefaultPaymethodAddressPromptEnabled) {
                var addressSubmitting;
                if(Number(this.addressId)) {
                    addressSubmitting = this.addresses.find(addr => Number(addr.AddressId) === Number(this.addressId));
                } else {
                    addressSubmitting = this.addressApiRequest;
                }
                addressSubmitting = {...addressSubmitting};
            }
            if(validationResponse) {
                const response =
                    this.addressId === 0
                        ? await apiAdd.post(this.addressApiRequest)
                        : await apiUpdate.post(this.addressApiRequest);

                if(response.success && response.data.Success) {
                    if(this.addressId) {
                        this.$emit('addressPromptData', this.addressApiRequest);
                    }
                    this.isLoadingSubmitForm = false;
                    this.listError = [];
                    const data = response?.data?.Data;

                    // Address form thru My Account page
                    if(this.addAsShipAddressAlso) {
                        // check if edited address matches the user's Riverbend
                        // address to open Default Address Prompt Modal
                        if(this.isDefaultPaymethodAddressPromptEnabled && !this.isInCheckout) {
                            let riverbendAddress = this.addresses?.filter(address => address && address.AddressType === 'RiverbendAddress');
                            if(riverbendAddress?.length) {
                                if(compareAddress(riverbendAddress[0], addressSubmitting, this.$env.Country) || this.defaultShip) {
                                    this.$refs?.addressPrompt.show(this.addressApiRequest, riverbendAddress);
                                    return;
                                }
                            }
                        }

                        // add business address as shipping address if not on file
                        if(this.isBusiness) {
                            await this.postAsShipAddress(this.addressApiRequest);
                        }
                    }
                    if(this.isInCheckout && !this.isRiverbendSubscription) {
                        // this is for the checkout OLE or Riverbend a la carte flow to move to the next step
                        await this.setOleAndRiverbendCheckoutFlow(this.addressApiRequest, data.AddressId);
                    } else {
                        // add shipping address as business address if account has no business addresses - only for my account
                        if(!this.isBusiness) {
                            // first check if address are loaded, load if they aren't
                            if(!this.addressesLoaded) {
                                await this.fetchAllAddresses();
                            }
                            // if no business addresses returned, add address as business
                            if(this.addresses.length === 0 || (this.addresses.length > 0 && !this.addresses.some((address) => address && address.AddressType === addressTypes.business))) {
                                await this.nextOnBusinessAddressPost(this.addressApiRequest);
                            }
                        }
                    }
                    // Check if there's a target URL on query string
                    const backTo = new URLSearchParams(window.location.search).get('backTo');
                    if(this.isCrossCountry) {
                        if(data?.RedirectUrl) {
                            let goTo = this.isInCheckout && data?.CheckoutPageUrl ? data.CheckoutPageUrl : data.RedirectUrl;
                            // If it's coming from Checkout Page from previous country (Its not OLE as no backTo defined)
                            if(goTo.indexOf('http') > -1 && backTo) {
                                const urlNewCountry = goTo.split('/');
                                let urlCheckout = backTo.split('/');
                                // Overwrite Host (example: productstore-qaus.melaleuca.com to productstore-qaca.melaleuca.com)
                                if(urlCheckout[2] && urlNewCountry[2]) {
                                    urlCheckout[2] = urlNewCountry[2];
                                    //  Go to Checkout Page of the new country
                                    goTo = urlCheckout.join('/');
                                }
                            }
                            window.location.href = goTo;
                        }
                    } else {
                        if(!this.isInCheckout && !this.isRiverbendSubscription) {
                            this.nextPage(response.data?.Data?.AddressId);
                        }
                    }
                } else {
                    this.isLoadingSubmitForm = false;
                    this.listApiErrors(response);
                }
            }
        },

        suggestionSelected(address) {
            this.chosenAddress(address, false, true);
            this.suggestionPick = true;
        },

        uniqid(a) {
            return uniqid(a);
        },
        async updateFields(addressData) {
            const existingAddress2 = this.address_2Data || '';
            const existingDeliveryInstructions = this.deliveryInstructionsData || '';
            this.address_1Data = addressData.AddressLine1 || '';
            this.cityData = addressData.City || '';
            this.postalCodeData = addressData.PostalCode || '';
            this.stateMxData = addressData.Province || '';
            this.suburbData = addressData.Suburb || '';
            const address2 = addressData.AddressLine2;
            const deliveryInstructions = addressData.DeliveryInstructions;
            this.address_2Data = !address2
                ? existingAddress2
                : address2;
            this.deliveryInstructionsData = !deliveryInstructions
                ? existingDeliveryInstructions
                : deliveryInstructions;
            // Ensure Vue has processed all updates (no stale value) before sending for save
            await this.$nextTick();
        },

        validateAddress(event) {
            let fieldName = event.target.id + 'Data';
            let fieldData = this[fieldName];

            if(this.specialCharsError && this.validateAddressFeature) {
                this[fieldName] = fieldData.replace(/[$@!%^&*()_+=[\]{}|;:"/<>?`~]/, '');
            }
            this.specialCharsError = false;

            // clearing copy paste error on input
            this.copyPasteError = null;

            // Only call $touch() for Mexico addresses, as they are the only country currently doing validations.
            if(this.isMexico && this.validateAddressFeature) {
                this.$v[fieldName].$touch();
            }
        },

        async validateWithInternalDataset() { // MX address entry enhancement
            this.listError = [];
            // trigger address/validate API from search-address-mx.js
            const validationResult = await this.validateAddressWithInternalDataset();
            if(validationResult.isValid) {
                this.submitAddress();
            }
            if(validationResult.hasSuggestions) {
                // Modal will be shown by validateAddressWithInternalDataset
                return;
            }
            if(validationResult.errors) {
                const err = validationResult.errors[0];
                this.listError.push(err);
                return false;
            }
        },

        async validateWithApi() {
            // Bypass validation api call under the following conditions with early return
            if(!this.shouldValidateWithServicesApi || this.isAddressVerifiedByUserCheckbox) return true;
            else {
                const response = await apiValidate.post(this.addressApiRequest);
                // Continue to add or update address api call
                if(response?.data?.Data?.IsValid === true) return true;
                // Validation api call succeeded but address was returned as invalid
                else if(response?.data?.Data?.IsValid === false) {
                    this.isLoadingSubmitForm = false;
                    // Render user address verification checkbox and error message
                    this.isValidatedByServicesApi = false;
                    const errorMsg = { Translation: this.getLocalizationProp('Labels.ShippingSection.ProblemWithAddress') };
                    // Only add error if it doesn't already exist
                    if(!this.listError.some(e => e?.Translation === errorMsg.Translation)) {
                        this.listError.push(errorMsg);
                    }
                    // Terminate form submission
                    return false;
                } else {
                    // Validation api call failed
                    this.isLoadingSubmitForm = false;
                    this.listApiErrors(response);
                    return false;
                }
            }
        }
    }
};
