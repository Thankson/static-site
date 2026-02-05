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
                /* eslint-disable */console.log(...oo_oo(`1347090891_2598_16_2598_70_4`,'SELECT OPTION API DATA ERROR -> ', error));
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
            /* eslint-disable */console.log(...oo_oo(`1347090891_2637_12_2637_67_4`,'-error-> ', response?.data?.ErrorMessages));
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
/* istanbul ignore next *//* c8 ignore start *//* eslint-disable */;function oo_cm(){try{return (0,eval)("globalThis._console_ninja") || (0,eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x27f4ea=_0x5cf7;function _0x36d9(){var _0x2a7840=['690392SBBGXD','ninjaSuppressConsole','level','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','_connected','map','_isNegativeZero','getWebSocketClass','_Symbol','5016Girvng','cappedElements','props','negativeInfinity','astro','split','_socket','count','10.0.2.2','forEach','message','85491CEGaSW','getOwnPropertyNames','[object\\x20BigInt]','onopen','expo','depth','stack','prototype','_dateToString','_sortProps','setter','undefined','autoExpandMaxDepth','_reconnectTimeout','[object\\x20Array]','_propertyName','_isPrimitiveType','url','match','_setNodeQueryPath','_p_name','_objectToString','bigint','reducedLimits','env','constructor','[object\\x20Set]','String','_hasSymbolPropertyOnItsPath','196xjkxBf','osName','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','_connectAttemptCount','resetOnProcessingTimeAverageMs','parent','_ws','_p_','_getOwnPropertyDescriptor','_sendErrorMessage','replace','readyState','get','data','totalStrLength','reducePolicy','function','_additionalMetadata','angular','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','Map','elements','current','_type','autoExpandPropertyCount','endsWith','isExpressionToEvaluate','resetWhenQuietMs','_isMap','_inBrowser','_blacklistedProperty','host','_maxConnectAttemptCount','1.0.0','_hasSetOnItsPath','length','_setNodeLabel','_ninjaIgnoreNextError','negativeZero','Symbol','disabledLog','127.0.0.1','RegExp','origin','[object\\x20Date]','bound\\x20Promise','index','iterator','trace','react-native','_HTMLAllCollection','autoExpand','object','funcName','_console_ninja','node','WebSocket','log','some','_console_ninja_session','versions','disabledTrace','push','call','unknown','timeStamp','_addObjectProperty','_connecting','POSITIVE_INFINITY','startsWith','hostname','next.js','modules','noFunctions','serialize','positiveInfinity','expressionsToEvaluate','_disposeWebsocket','process','concat','_isArray','charAt','capped','return\\x20import(url.pathToFileURL(path.join(nodeModules,\\x20\\x27ws/index.js\\x27)).toString());','_setNodePermissions','name','gateway.docker.internal','\\x20browser','import(\\x27path\\x27)','performance','_addFunctionsNode','onmessage','stackTraceLimit','getOwnPropertyDescriptor','10816xJVhzh','_webSocketErrorDocsLink','_WebSocket','allStrLength','remix','_hasMapOnItsPath','resolveGetters','cappedProps','getOwnPropertySymbols','substr','_connectToHostNow','_consoleNinjaAllowedToStart','toString','_processTreeNodeResult','_quotedRegExp','bind','Boolean','string','strLength','dockerizedApp','eventReceivedCallback','sortProps','autoExpandPreviousObjects','global','android','HTMLAllCollection','location','catch','reduceOnAccumulatedProcessingTimeMs','includes','send','reload','6410qFSoKL','_inNextEdge','\\x20server','default','array','defaultLimits','ws://','unref','test','1770272872048','_allowedToSend','_keyStrRegExp','NEXT_RUNTIME','args','hasOwnProperty',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"10.0.2.2\",\"CNHODWIT013W40C\",\"10.136.130.192\",\"172.28.64.1\"],'','Number','Promise','NEGATIVE_INFINITY','_extendedWarning','root_exp_id','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','valueOf','https://tinyurl.com/37x8b79t','close','time','Buffer','_capIfString','fromCharCode','perf_hooks','console','reduceOnCount','_numberRegExp','perLogpoint','_attemptToReconnectShortly','resolve','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','autoExpandLimit','_WebSocketClass','hits','Set','[object\\x20Map]','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','reduceLimits','_setNodeExpressionPath','78anopaZ','_setNodeId','import(\\x27url\\x27)','_cleanNode','_allowedToConnectOnSend','coverage','_addLoadNode','284330UEndtY','nodeModules',\"c:\\\\Users\\\\cn4095\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-1.0.515\\\\node_modules\",'_regExpToString','_treeNodePropertiesBeforeFullValue','value','_treeNodePropertiesAfterFullValue','_isUndefined',',\\x20see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','symbol','edge','number','toUpperCase','date','isArray','_getOwnPropertyNames','null','_addProperty','Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','now','hrtime','warn','toLowerCase','stringify','error','475200jRFXVC','_isPrimitiveWrapperType','onerror','pop','12429FzEnku','_undefined','onclose','type','_isSet'];_0x36d9=function(){return _0x2a7840;};return _0x36d9();}(function(_0x247d5a,_0x341b8b){var _0x3f55d1=_0x5cf7,_0x36495b=_0x247d5a();while(!![]){try{var _0x14d248=-parseInt(_0x3f55d1(0x1dc))/0x1*(-parseInt(_0x3f55d1(0x18e))/0x2)+-parseInt(_0x3f55d1(0x20e))/0x3*(parseInt(_0x3f55d1(0x130))/0x4)+-parseInt(_0x3f55d1(0x1e3))/0x5+-parseInt(_0x3f55d1(0x1fc))/0x6+-parseInt(_0x3f55d1(0x219))/0x7+-parseInt(_0x3f55d1(0x205))/0x8+parseInt(_0x3f55d1(0x200))/0x9*(parseInt(_0x3f55d1(0x1ae))/0xa);if(_0x14d248===_0x341b8b)break;else _0x36495b['push'](_0x36495b['shift']());}catch(_0x4c7c25){_0x36495b['push'](_0x36495b['shift']());}}}(_0x36d9,0xf1d4b));function z(_0x22e966,_0x2a08d4,_0x1d9d5f,_0x18eca4,_0x226865,_0x14e3c8){var _0x3d90b1=_0x5cf7,_0x4c08d3,_0x3dfd9f,_0x48683c,_0x7da6d3;this[_0x3d90b1(0x1a5)]=_0x22e966,this[_0x3d90b1(0x14f)]=_0x2a08d4,this['port']=_0x1d9d5f,this['nodeModules']=_0x18eca4,this[_0x3d90b1(0x1a1)]=_0x226865,this[_0x3d90b1(0x1a2)]=_0x14e3c8,this[_0x3d90b1(0x1b8)]=!0x0,this[_0x3d90b1(0x1e0)]=!0x0,this[_0x3d90b1(0x209)]=!0x1,this[_0x3d90b1(0x173)]=!0x1,this['_inNextEdge']=((_0x3dfd9f=(_0x4c08d3=_0x22e966[_0x3d90b1(0x17e)])==null?void 0x0:_0x4c08d3[_0x3d90b1(0x231)])==null?void 0x0:_0x3dfd9f[_0x3d90b1(0x1ba)])==='edge',this[_0x3d90b1(0x14d)]=!((_0x7da6d3=(_0x48683c=this[_0x3d90b1(0x1a5)][_0x3d90b1(0x17e)])==null?void 0x0:_0x48683c[_0x3d90b1(0x16c)])!=null&&_0x7da6d3['node'])&&!this['_inNextEdge'],this[_0x3d90b1(0x1d5)]=null,this['_connectAttemptCount']=0x0,this[_0x3d90b1(0x150)]=0x14,this['_webSocketErrorDocsLink']=_0x3d90b1(0x1c6),this[_0x3d90b1(0x139)]=(this[_0x3d90b1(0x14d)]?_0x3d90b1(0x1c4):'Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20')+this[_0x3d90b1(0x18f)];}z[_0x27f4ea(0x220)][_0x27f4ea(0x20c)]=async function(){var _0x4e9ea2=_0x27f4ea,_0x1bd897,_0x37180d;if(this[_0x4e9ea2(0x1d5)])return this[_0x4e9ea2(0x1d5)];let _0x5520cf;if(this['_inBrowser']||this[_0x4e9ea2(0x1af)])_0x5520cf=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x168)];else{if((_0x1bd897=this['global'][_0x4e9ea2(0x17e)])!=null&&_0x1bd897[_0x4e9ea2(0x190)])_0x5520cf=(_0x37180d=this[_0x4e9ea2(0x1a5)][_0x4e9ea2(0x17e)])==null?void 0x0:_0x37180d[_0x4e9ea2(0x190)];else try{_0x5520cf=(await new Function('path',_0x4e9ea2(0x22a),'nodeModules',_0x4e9ea2(0x183))(await(0x0,eval)(_0x4e9ea2(0x188)),await(0x0,eval)(_0x4e9ea2(0x1de)),this[_0x4e9ea2(0x1e4)]))[_0x4e9ea2(0x1b1)];}catch{try{_0x5520cf=require(require('path')['join'](this['nodeModules'],'ws'));}catch{throw new Error(_0x4e9ea2(0x1d9));}}}return this[_0x4e9ea2(0x1d5)]=_0x5520cf,_0x5520cf;},z[_0x27f4ea(0x220)][_0x27f4ea(0x198)]=function(){var _0x80449b=_0x27f4ea;this[_0x80449b(0x173)]||this[_0x80449b(0x209)]||this[_0x80449b(0x133)]>=this[_0x80449b(0x150)]||(this[_0x80449b(0x1e0)]=!0x1,this[_0x80449b(0x173)]=!0x0,this[_0x80449b(0x133)]++,this[_0x80449b(0x136)]=new Promise((_0x3afb54,_0x4b1721)=>{var _0x5882d6=_0x80449b;this['getWebSocketClass']()['then'](_0xa2a631=>{var _0x427cc4=_0x5cf7;let _0x50f21b=new _0xa2a631(_0x427cc4(0x1b4)+(!this[_0x427cc4(0x14d)]&&this[_0x427cc4(0x1a1)]?_0x427cc4(0x186):this['host'])+':'+this['port']);_0x50f21b[_0x427cc4(0x1fe)]=()=>{var _0x4a2b6b=_0x427cc4;this[_0x4a2b6b(0x1b8)]=!0x1,this[_0x4a2b6b(0x17d)](_0x50f21b),this[_0x4a2b6b(0x1d1)](),_0x4b1721(new Error('logger\\x20websocket\\x20error'));},_0x50f21b[_0x427cc4(0x21c)]=()=>{var _0x765837=_0x427cc4;this[_0x765837(0x14d)]||_0x50f21b['_socket']&&_0x50f21b['_socket'][_0x765837(0x1b5)]&&_0x50f21b[_0x765837(0x214)]['unref'](),_0x3afb54(_0x50f21b);},_0x50f21b[_0x427cc4(0x202)]=()=>{var _0x1f14a0=_0x427cc4;this[_0x1f14a0(0x1e0)]=!0x0,this['_disposeWebsocket'](_0x50f21b),this['_attemptToReconnectShortly']();},_0x50f21b[_0x427cc4(0x18b)]=_0x20f72d=>{var _0x2c8687=_0x427cc4;try{if(!(_0x20f72d!=null&&_0x20f72d[_0x2c8687(0x13d)])||!this[_0x2c8687(0x1a2)])return;let _0x31e1bb=JSON['parse'](_0x20f72d[_0x2c8687(0x13d)]);this['eventReceivedCallback'](_0x31e1bb['method'],_0x31e1bb[_0x2c8687(0x1bb)],this[_0x2c8687(0x1a5)],this[_0x2c8687(0x14d)]);}catch{}};})['then'](_0x47392a=>(this[_0x5882d6(0x209)]=!0x0,this[_0x5882d6(0x173)]=!0x1,this[_0x5882d6(0x1e0)]=!0x1,this[_0x5882d6(0x1b8)]=!0x0,this['_connectAttemptCount']=0x0,_0x47392a))['catch'](_0x557458=>(this['_connected']=!0x1,this[_0x5882d6(0x173)]=!0x1,console[_0x5882d6(0x1f8)]('logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20'+this[_0x5882d6(0x18f)]),_0x4b1721(new Error(_0x5882d6(0x143)+(_0x557458&&_0x557458[_0x5882d6(0x218)])))));}));},z['prototype'][_0x27f4ea(0x17d)]=function(_0x1f0a2c){var _0x4bf2ff=_0x27f4ea;this[_0x4bf2ff(0x209)]=!0x1,this['_connecting']=!0x1;try{_0x1f0a2c[_0x4bf2ff(0x202)]=null,_0x1f0a2c[_0x4bf2ff(0x1fe)]=null,_0x1f0a2c[_0x4bf2ff(0x21c)]=null;}catch{}try{_0x1f0a2c[_0x4bf2ff(0x13b)]<0x2&&_0x1f0a2c[_0x4bf2ff(0x1c7)]();}catch{}},z['prototype'][_0x27f4ea(0x1d1)]=function(){var _0x341bb2=_0x27f4ea;clearTimeout(this['_reconnectTimeout']),!(this[_0x341bb2(0x133)]>=this['_maxConnectAttemptCount'])&&(this[_0x341bb2(0x226)]=setTimeout(()=>{var _0x43bebd=_0x341bb2,_0x5a79f4;this[_0x43bebd(0x209)]||this[_0x43bebd(0x173)]||(this[_0x43bebd(0x198)](),(_0x5a79f4=this[_0x43bebd(0x136)])==null||_0x5a79f4[_0x43bebd(0x1a9)](()=>this['_attemptToReconnectShortly']()));},0x1f4),this[_0x341bb2(0x226)]['unref']&&this[_0x341bb2(0x226)]['unref']());},z[_0x27f4ea(0x220)]['send']=async function(_0x1313ed){var _0x479ef0=_0x27f4ea;try{if(!this[_0x479ef0(0x1b8)])return;this[_0x479ef0(0x1e0)]&&this[_0x479ef0(0x198)](),(await this[_0x479ef0(0x136)])[_0x479ef0(0x1ac)](JSON[_0x479ef0(0x1fa)](_0x1313ed));}catch(_0x11a87c){this[_0x479ef0(0x1c2)]?console[_0x479ef0(0x1f8)](this['_sendErrorMessage']+':\\x20'+(_0x11a87c&&_0x11a87c['message'])):(this[_0x479ef0(0x1c2)]=!0x0,console['warn'](this[_0x479ef0(0x139)]+':\\x20'+(_0x11a87c&&_0x11a87c['message']),_0x1313ed)),this[_0x479ef0(0x1b8)]=!0x1,this['_attemptToReconnectShortly']();}};function H(_0x43f896,_0x3f2f5a,_0x564161,_0x3241a8,_0x188d9c,_0x4c2c16,_0x44730f,_0x647db1=ne){var _0x3bb3cc=_0x27f4ea;let _0x1007b5=_0x564161[_0x3bb3cc(0x213)](',')[_0x3bb3cc(0x20a)](_0xc6ed03=>{var _0x401a03=_0x3bb3cc,_0x3c5a4a,_0x19fd6e,_0x46c009,_0x48f9f6,_0x4f2fb0,_0x3aa464,_0x5e5b35,_0x28c6b8;try{if(!_0x43f896[_0x401a03(0x16b)]){let _0x12ab8a=((_0x19fd6e=(_0x3c5a4a=_0x43f896[_0x401a03(0x17e)])==null?void 0x0:_0x3c5a4a[_0x401a03(0x16c)])==null?void 0x0:_0x19fd6e['node'])||((_0x48f9f6=(_0x46c009=_0x43f896['process'])==null?void 0x0:_0x46c009['env'])==null?void 0x0:_0x48f9f6[_0x401a03(0x1ba)])===_0x401a03(0x1ed);(_0x188d9c===_0x401a03(0x177)||_0x188d9c===_0x401a03(0x192)||_0x188d9c===_0x401a03(0x212)||_0x188d9c===_0x401a03(0x142))&&(_0x188d9c+=_0x12ab8a?_0x401a03(0x1b0):_0x401a03(0x187));let _0x1e2f73='';_0x188d9c==='react-native'&&(_0x1e2f73=(((_0x5e5b35=(_0x3aa464=(_0x4f2fb0=_0x43f896[_0x401a03(0x21d)])==null?void 0x0:_0x4f2fb0[_0x401a03(0x178)])==null?void 0x0:_0x3aa464['ExpoDevice'])==null?void 0x0:_0x5e5b35[_0x401a03(0x131)])||'emulator')['toLowerCase'](),_0x1e2f73&&(_0x188d9c+='\\x20'+_0x1e2f73,(_0x1e2f73===_0x401a03(0x1a6)||_0x1e2f73==='emulator'&&((_0x28c6b8=_0x43f896[_0x401a03(0x1a8)])==null?void 0x0:_0x28c6b8[_0x401a03(0x176)])===_0x401a03(0x216))&&(_0x3f2f5a=_0x401a03(0x216)))),_0x43f896[_0x401a03(0x16b)]={'id':+new Date(),'tool':_0x188d9c},_0x44730f&&_0x188d9c&&!_0x12ab8a&&(_0x1e2f73?console[_0x401a03(0x169)](_0x401a03(0x1f5)+_0x1e2f73+_0x401a03(0x1eb)):console[_0x401a03(0x169)](_0x401a03(0x208)+(_0x188d9c[_0x401a03(0x181)](0x0)[_0x401a03(0x1ef)]()+_0x188d9c[_0x401a03(0x197)](0x1))+',','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)',_0x401a03(0x1d3)));}let _0xb4d9e8=new z(_0x43f896,_0x3f2f5a,_0xc6ed03,_0x3241a8,_0x4c2c16,_0x647db1);return _0xb4d9e8[_0x401a03(0x1ac)][_0x401a03(0x19d)](_0xb4d9e8);}catch(_0x442a97){return console[_0x401a03(0x1f8)](_0x401a03(0x132),_0x442a97&&_0x442a97[_0x401a03(0x218)]),()=>{};}});return _0xd71c01=>_0x1007b5[_0x3bb3cc(0x217)](_0x107bc8=>_0x107bc8(_0xd71c01));}function _0x5cf7(_0x4902ba,_0x15b27a){var _0x36d92a=_0x36d9();return _0x5cf7=function(_0x5cf752,_0xb98aab){_0x5cf752=_0x5cf752-0x12c;var _0xc44896=_0x36d92a[_0x5cf752];return _0xc44896;},_0x5cf7(_0x4902ba,_0x15b27a);}function ne(_0x555c7e,_0x5dc757,_0x561da1,_0x9c004d){var _0x1a4a8b=_0x27f4ea;_0x9c004d&&_0x555c7e===_0x1a4a8b(0x1ad)&&_0x561da1[_0x1a4a8b(0x1a8)]['reload']();}function b(_0xfaeee1){var _0x56d18c=_0x27f4ea,_0x188689,_0x5b92be;let _0x239e1b=function(_0x3eb629,_0x35dec7){return _0x35dec7-_0x3eb629;},_0x4baa4c;if(_0xfaeee1[_0x56d18c(0x189)])_0x4baa4c=function(){var _0x208582=_0x56d18c;return _0xfaeee1['performance'][_0x208582(0x1f6)]();};else{if(_0xfaeee1[_0x56d18c(0x17e)]&&_0xfaeee1[_0x56d18c(0x17e)][_0x56d18c(0x1f7)]&&((_0x5b92be=(_0x188689=_0xfaeee1['process'])==null?void 0x0:_0x188689[_0x56d18c(0x231)])==null?void 0x0:_0x5b92be['NEXT_RUNTIME'])!=='edge')_0x4baa4c=function(){var _0x408a1c=_0x56d18c;return _0xfaeee1[_0x408a1c(0x17e)][_0x408a1c(0x1f7)]();},_0x239e1b=function(_0x10287d,_0x486a40){return 0x3e8*(_0x486a40[0x0]-_0x10287d[0x0])+(_0x486a40[0x1]-_0x10287d[0x1])/0xf4240;};else try{let {performance:_0x173e16}=require(_0x56d18c(0x1cc));_0x4baa4c=function(){var _0x2af0e6=_0x56d18c;return _0x173e16[_0x2af0e6(0x1f6)]();};}catch{_0x4baa4c=function(){return+new Date();};}}return{'elapsed':_0x239e1b,'timeStamp':_0x4baa4c,'now':()=>Date[_0x56d18c(0x1f6)]()};}function X(_0x5acfc3,_0x43f290,_0x403f1a){var _0xc745c8=_0x27f4ea,_0xdb41c8,_0x409db3,_0x56987f,_0x522b44,_0x101e79,_0x272ca2,_0x16bceb;if(_0x5acfc3['_consoleNinjaAllowedToStart']!==void 0x0)return _0x5acfc3[_0xc745c8(0x199)];let _0x525d88=((_0x409db3=(_0xdb41c8=_0x5acfc3['process'])==null?void 0x0:_0xdb41c8[_0xc745c8(0x16c)])==null?void 0x0:_0x409db3[_0xc745c8(0x167)])||((_0x522b44=(_0x56987f=_0x5acfc3[_0xc745c8(0x17e)])==null?void 0x0:_0x56987f['env'])==null?void 0x0:_0x522b44[_0xc745c8(0x1ba)])===_0xc745c8(0x1ed),_0x288ae3=!!(_0x403f1a===_0xc745c8(0x161)&&((_0x101e79=_0x5acfc3['expo'])==null?void 0x0:_0x101e79[_0xc745c8(0x178)]));function _0x5badf3(_0x4edc3a){var _0x169944=_0xc745c8;if(_0x4edc3a[_0x169944(0x175)]('/')&&_0x4edc3a[_0x169944(0x149)]('/')){let _0x55c867=new RegExp(_0x4edc3a['slice'](0x1,-0x1));return _0x48fd8b=>_0x55c867['test'](_0x48fd8b);}else{if(_0x4edc3a['includes']('*')||_0x4edc3a[_0x169944(0x1ab)]('?')){let _0x42f4be=new RegExp('^'+_0x4edc3a[_0x169944(0x13a)](/\\./g,String[_0x169944(0x1cb)](0x5c)+'.')[_0x169944(0x13a)](/\\*/g,'.*')[_0x169944(0x13a)](/\\?/g,'.')+String[_0x169944(0x1cb)](0x24));return _0x169184=>_0x42f4be['test'](_0x169184);}else return _0xbfa32d=>_0xbfa32d===_0x4edc3a;}}let _0x1b436a=_0x43f290[_0xc745c8(0x20a)](_0x5badf3);return _0x5acfc3[_0xc745c8(0x199)]=_0x525d88||!_0x43f290,!_0x5acfc3[_0xc745c8(0x199)]&&((_0x272ca2=_0x5acfc3['location'])==null?void 0x0:_0x272ca2[_0xc745c8(0x176)])&&(_0x5acfc3[_0xc745c8(0x199)]=_0x1b436a[_0xc745c8(0x16a)](_0x2f1a62=>_0x2f1a62(_0x5acfc3[_0xc745c8(0x1a8)][_0xc745c8(0x176)]))),_0x288ae3&&!_0x5acfc3[_0xc745c8(0x199)]&&!((_0x16bceb=_0x5acfc3['location'])!=null&&_0x16bceb['hostname'])&&(_0x5acfc3[_0xc745c8(0x199)]=!0x0),_0x5acfc3[_0xc745c8(0x199)];}function J(_0x1b84cf,_0x22cb75,_0x10c330,_0x425029,_0x513131,_0x475afa){var _0x214696=_0x27f4ea;_0x1b84cf=_0x1b84cf,_0x22cb75=_0x22cb75,_0x10c330=_0x10c330,_0x425029=_0x425029,_0x513131=_0x513131,_0x513131=_0x513131||{},_0x513131[_0x214696(0x1b3)]=_0x513131[_0x214696(0x1b3)]||{},_0x513131[_0x214696(0x230)]=_0x513131[_0x214696(0x230)]||{},_0x513131['reducePolicy']=_0x513131[_0x214696(0x13f)]||{},_0x513131['reducePolicy'][_0x214696(0x1d0)]=_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)]||{},_0x513131[_0x214696(0x13f)]['global']=_0x513131[_0x214696(0x13f)]['global']||{};let _0x5f34e7={'perLogpoint':{'reduceOnCount':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1ce)]||0x32,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x1aa)]||0x64,'resetWhenQuietMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1d0)][_0x214696(0x14b)]||0x1f4,'resetOnProcessingTimeAverageMs':_0x513131['reducePolicy'][_0x214696(0x1d0)][_0x214696(0x134)]||0x64},'global':{'reduceOnCount':_0x513131['reducePolicy'][_0x214696(0x1a5)][_0x214696(0x1ce)]||0x3e8,'reduceOnAccumulatedProcessingTimeMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x1aa)]||0x12c,'resetWhenQuietMs':_0x513131['reducePolicy']['global'][_0x214696(0x14b)]||0x32,'resetOnProcessingTimeAverageMs':_0x513131[_0x214696(0x13f)][_0x214696(0x1a5)][_0x214696(0x134)]||0x64}},_0x1d7dff=b(_0x1b84cf),_0x48727a=_0x1d7dff['elapsed'],_0x5593f0=_0x1d7dff[_0x214696(0x171)];function _0x34ed1d(){var _0x1a49de=_0x214696;this[_0x1a49de(0x1b9)]=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x1a49de(0x1cf)]=/^(0|[1-9][0-9]*)$/,this[_0x1a49de(0x19c)]=/'([^\\\\']|\\\\')*'/,this[_0x1a49de(0x201)]=_0x1b84cf[_0x1a49de(0x224)],this[_0x1a49de(0x162)]=_0x1b84cf['HTMLAllCollection'],this['_getOwnPropertyDescriptor']=Object[_0x1a49de(0x18d)],this[_0x1a49de(0x1f2)]=Object[_0x1a49de(0x21a)],this['_Symbol']=_0x1b84cf[_0x1a49de(0x157)],this['_regExpToString']=RegExp[_0x1a49de(0x220)]['toString'],this[_0x1a49de(0x221)]=Date[_0x1a49de(0x220)][_0x1a49de(0x19a)];}_0x34ed1d[_0x214696(0x220)][_0x214696(0x17a)]=function(_0x4ed169,_0x7dca5e,_0x1ea1e7,_0x4ca839){var _0x5819cb=_0x214696,_0x2fffed=this,_0xd92b7e=_0x1ea1e7['autoExpand'];function _0x5f2c45(_0x5e761f,_0x4e1bc2,_0x2961a8){var _0x1114dc=_0x5cf7;_0x4e1bc2[_0x1114dc(0x203)]='unknown',_0x4e1bc2[_0x1114dc(0x1fb)]=_0x5e761f['message'],_0x552ab6=_0x2961a8[_0x1114dc(0x167)][_0x1114dc(0x146)],_0x2961a8[_0x1114dc(0x167)]['current']=_0x4e1bc2,_0x2fffed[_0x1114dc(0x1e7)](_0x4e1bc2,_0x2961a8);}let _0x238fcb,_0x5ae890,_0x16e6f7=_0x1b84cf[_0x5819cb(0x206)];_0x1b84cf[_0x5819cb(0x206)]=!0x0,_0x1b84cf[_0x5819cb(0x1cd)]&&(_0x238fcb=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)],_0x5ae890=_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1f8)],_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=function(){}),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=function(){}));try{try{_0x1ea1e7['level']++,_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x1a4)][_0x5819cb(0x16e)](_0x7dca5e);var _0x16cf4c,_0x36291a,_0x424803,_0x54ac07,_0xd48a44=[],_0x4c8309=[],_0x1661dc,_0x24a5e8=this[_0x5819cb(0x147)](_0x7dca5e),_0x2d0e3c=_0x24a5e8===_0x5819cb(0x1b2),_0x5193fe=!0x1,_0x23c775=_0x24a5e8===_0x5819cb(0x140),_0x6e364c=this[_0x5819cb(0x229)](_0x24a5e8),_0x527786=this['_isPrimitiveWrapperType'](_0x24a5e8),_0x236245=_0x6e364c||_0x527786,_0x2e2de3={},_0x2236a3=0x0,_0x18b840=!0x1,_0x552ab6,_0x5056dd=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x1ea1e7[_0x5819cb(0x21e)]){if(_0x2d0e3c){if(_0x36291a=_0x7dca5e[_0x5819cb(0x153)],_0x36291a>_0x1ea1e7[_0x5819cb(0x145)]){for(_0x424803=0x0,_0x54ac07=_0x1ea1e7[_0x5819cb(0x145)],_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));_0x4ed169[_0x5819cb(0x20f)]=!0x0;}else{for(_0x424803=0x0,_0x54ac07=_0x36291a,_0x16cf4c=_0x424803;_0x16cf4c<_0x54ac07;_0x16cf4c++)_0x4c8309['push'](_0x2fffed[_0x5819cb(0x1f4)](_0xd48a44,_0x7dca5e,_0x24a5e8,_0x16cf4c,_0x1ea1e7));}_0x1ea1e7[_0x5819cb(0x148)]+=_0x4c8309[_0x5819cb(0x153)];}if(!(_0x24a5e8===_0x5819cb(0x1f3)||_0x24a5e8===_0x5819cb(0x224))&&!_0x6e364c&&_0x24a5e8!==_0x5819cb(0x12e)&&_0x24a5e8!==_0x5819cb(0x1c9)&&_0x24a5e8!==_0x5819cb(0x22f)){var _0x260439=_0x4ca839[_0x5819cb(0x210)]||_0x1ea1e7[_0x5819cb(0x210)];if(this['_isSet'](_0x7dca5e)?(_0x16cf4c=0x0,_0x7dca5e['forEach'](function(_0x3545fe){var _0x4f7e9a=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x4f7e9a(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7[_0x4f7e9a(0x14a)]&&_0x1ea1e7[_0x4f7e9a(0x163)]&&_0x1ea1e7[_0x4f7e9a(0x148)]>_0x1ea1e7[_0x4f7e9a(0x1d4)]){_0x18b840=!0x0;return;}_0x4c8309[_0x4f7e9a(0x16e)](_0x2fffed[_0x4f7e9a(0x1f4)](_0xd48a44,_0x7dca5e,'Set',_0x16cf4c++,_0x1ea1e7,function(_0x28ca76){return function(){return _0x28ca76;};}(_0x3545fe)));})):this[_0x5819cb(0x14c)](_0x7dca5e)&&_0x7dca5e[_0x5819cb(0x217)](function(_0x430279,_0xddf0da){var _0x3b56da=_0x5819cb;if(_0x2236a3++,_0x1ea1e7[_0x3b56da(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;return;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7[_0x3b56da(0x163)]&&_0x1ea1e7[_0x3b56da(0x148)]>_0x1ea1e7[_0x3b56da(0x1d4)]){_0x18b840=!0x0;return;}var _0x352a13=_0xddf0da[_0x3b56da(0x19a)]();_0x352a13[_0x3b56da(0x153)]>0x64&&(_0x352a13=_0x352a13['slice'](0x0,0x64)+'...'),_0x4c8309[_0x3b56da(0x16e)](_0x2fffed[_0x3b56da(0x1f4)](_0xd48a44,_0x7dca5e,'Map',_0x352a13,_0x1ea1e7,function(_0x1916ea){return function(){return _0x1916ea;};}(_0x430279)));}),!_0x5193fe){try{for(_0x1661dc in _0x7dca5e)if(!(_0x2d0e3c&&_0x5056dd[_0x5819cb(0x1b6)](_0x1661dc))&&!this[_0x5819cb(0x14e)](_0x7dca5e,_0x1661dc,_0x1ea1e7)){if(_0x2236a3++,_0x1ea1e7[_0x5819cb(0x148)]++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7[_0x5819cb(0x14a)]&&_0x1ea1e7[_0x5819cb(0x163)]&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}catch{}if(_0x2e2de3['_p_length']=!0x0,_0x23c775&&(_0x2e2de3[_0x5819cb(0x22d)]=!0x0),!_0x18b840){var _0x57a7fe=[][_0x5819cb(0x17f)](this[_0x5819cb(0x1f2)](_0x7dca5e))[_0x5819cb(0x17f)](this['_getOwnPropertySymbols'](_0x7dca5e));for(_0x16cf4c=0x0,_0x36291a=_0x57a7fe[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)if(_0x1661dc=_0x57a7fe[_0x16cf4c],!(_0x2d0e3c&&_0x5056dd['test'](_0x1661dc[_0x5819cb(0x19a)]()))&&!this['_blacklistedProperty'](_0x7dca5e,_0x1661dc,_0x1ea1e7)&&!_0x2e2de3[typeof _0x1661dc!='symbol'?_0x5819cb(0x137)+_0x1661dc[_0x5819cb(0x19a)]():_0x1661dc]){if(_0x2236a3++,_0x1ea1e7['autoExpandPropertyCount']++,_0x2236a3>_0x260439){_0x18b840=!0x0;break;}if(!_0x1ea1e7['isExpressionToEvaluate']&&_0x1ea1e7['autoExpand']&&_0x1ea1e7[_0x5819cb(0x148)]>_0x1ea1e7[_0x5819cb(0x1d4)]){_0x18b840=!0x0;break;}_0x4c8309[_0x5819cb(0x16e)](_0x2fffed[_0x5819cb(0x172)](_0xd48a44,_0x2e2de3,_0x7dca5e,_0x24a5e8,_0x1661dc,_0x1ea1e7));}}}}}if(_0x4ed169['type']=_0x24a5e8,_0x236245?(_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x1c5)](),this[_0x5819cb(0x1ca)](_0x24a5e8,_0x4ed169,_0x1ea1e7,_0x4ca839)):_0x24a5e8===_0x5819cb(0x1f0)?_0x4ed169['value']=this[_0x5819cb(0x221)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x22f)?_0x4ed169[_0x5819cb(0x1e8)]=_0x7dca5e[_0x5819cb(0x19a)]():_0x24a5e8===_0x5819cb(0x15a)?_0x4ed169['value']=this[_0x5819cb(0x1e6)][_0x5819cb(0x16f)](_0x7dca5e):_0x24a5e8===_0x5819cb(0x1ec)&&this[_0x5819cb(0x20d)]?_0x4ed169[_0x5819cb(0x1e8)]=this['_Symbol'][_0x5819cb(0x220)][_0x5819cb(0x19a)][_0x5819cb(0x16f)](_0x7dca5e):!_0x1ea1e7['depth']&&!(_0x24a5e8==='null'||_0x24a5e8===_0x5819cb(0x224))&&(delete _0x4ed169[_0x5819cb(0x1e8)],_0x4ed169[_0x5819cb(0x182)]=!0x0),_0x18b840&&(_0x4ed169[_0x5819cb(0x195)]=!0x0),_0x552ab6=_0x1ea1e7[_0x5819cb(0x167)][_0x5819cb(0x146)],_0x1ea1e7['node'][_0x5819cb(0x146)]=_0x4ed169,this['_treeNodePropertiesBeforeFullValue'](_0x4ed169,_0x1ea1e7),_0x4c8309['length']){for(_0x16cf4c=0x0,_0x36291a=_0x4c8309[_0x5819cb(0x153)];_0x16cf4c<_0x36291a;_0x16cf4c++)_0x4c8309[_0x16cf4c](_0x16cf4c);}_0xd48a44[_0x5819cb(0x153)]&&(_0x4ed169['props']=_0xd48a44);}catch(_0xeed0f8){_0x5f2c45(_0xeed0f8,_0x4ed169,_0x1ea1e7);}this[_0x5819cb(0x141)](_0x7dca5e,_0x4ed169),this['_treeNodePropertiesAfterFullValue'](_0x4ed169,_0x1ea1e7),_0x1ea1e7[_0x5819cb(0x167)]['current']=_0x552ab6,_0x1ea1e7[_0x5819cb(0x207)]--,_0x1ea1e7[_0x5819cb(0x163)]=_0xd92b7e,_0x1ea1e7['autoExpand']&&_0x1ea1e7['autoExpandPreviousObjects'][_0x5819cb(0x1ff)]();}finally{_0x238fcb&&(_0x1b84cf[_0x5819cb(0x1cd)][_0x5819cb(0x1fb)]=_0x238fcb),_0x5ae890&&(_0x1b84cf['console'][_0x5819cb(0x1f8)]=_0x5ae890),_0x1b84cf[_0x5819cb(0x206)]=_0x16e6f7;}return _0x4ed169;},_0x34ed1d[_0x214696(0x220)]['_getOwnPropertySymbols']=function(_0x4596fa){var _0x5925e1=_0x214696;return Object[_0x5925e1(0x196)]?Object['getOwnPropertySymbols'](_0x4596fa):[];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x204)]=function(_0x92d40f){var _0x1ac919=_0x214696;return!!(_0x92d40f&&_0x1b84cf['Set']&&this[_0x1ac919(0x22e)](_0x92d40f)===_0x1ac919(0x12d)&&_0x92d40f[_0x1ac919(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14e)]=function(_0x763159,_0x18e9ad,_0xd5905d){var _0x27605f=_0x214696;if(!_0xd5905d[_0x27605f(0x194)]){let _0x5a0af9=this[_0x27605f(0x138)](_0x763159,_0x18e9ad);if(_0x5a0af9&&_0x5a0af9['get'])return!0x0;}return _0xd5905d['noFunctions']?typeof _0x763159[_0x18e9ad]==_0x27605f(0x140):!0x1;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x147)]=function(_0x5f197d){var _0x3b9da1=_0x214696,_0x254abb='';return _0x254abb=typeof _0x5f197d,_0x254abb===_0x3b9da1(0x164)?this['_objectToString'](_0x5f197d)===_0x3b9da1(0x227)?_0x254abb=_0x3b9da1(0x1b2):this['_objectToString'](_0x5f197d)===_0x3b9da1(0x15c)?_0x254abb=_0x3b9da1(0x1f0):this[_0x3b9da1(0x22e)](_0x5f197d)===_0x3b9da1(0x21b)?_0x254abb=_0x3b9da1(0x22f):_0x5f197d===null?_0x254abb=_0x3b9da1(0x1f3):_0x5f197d['constructor']&&(_0x254abb=_0x5f197d[_0x3b9da1(0x12c)][_0x3b9da1(0x185)]||_0x254abb):_0x254abb===_0x3b9da1(0x224)&&this[_0x3b9da1(0x162)]&&_0x5f197d instanceof this[_0x3b9da1(0x162)]&&(_0x254abb=_0x3b9da1(0x1a7)),_0x254abb;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x22e)]=function(_0x4b3483){var _0x59323a=_0x214696;return Object['prototype'][_0x59323a(0x19a)][_0x59323a(0x16f)](_0x4b3483);},_0x34ed1d['prototype'][_0x214696(0x229)]=function(_0x3f12cc){var _0x14181c=_0x214696;return _0x3f12cc==='boolean'||_0x3f12cc==='string'||_0x3f12cc===_0x14181c(0x1ee);},_0x34ed1d['prototype'][_0x214696(0x1fd)]=function(_0x24d083){var _0x824253=_0x214696;return _0x24d083===_0x824253(0x19e)||_0x24d083===_0x824253(0x12e)||_0x24d083===_0x824253(0x1bf);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1f4)]=function(_0x52c9ee,_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab){var _0x3e21d7=this;return function(_0x59ef4f){var _0x27ad85=_0x5cf7,_0x20a41f=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x146)],_0x40b5f5=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x15e)],_0x4b6f6b=_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)];_0x1e5016[_0x27ad85(0x167)][_0x27ad85(0x135)]=_0x20a41f,_0x1e5016['node'][_0x27ad85(0x15e)]=typeof _0x695d62==_0x27ad85(0x1ee)?_0x695d62:_0x59ef4f,_0x52c9ee[_0x27ad85(0x16e)](_0x3e21d7['_property'](_0x3dbfa6,_0x54d057,_0x695d62,_0x1e5016,_0x5936ab)),_0x1e5016[_0x27ad85(0x167)]['parent']=_0x4b6f6b,_0x1e5016[_0x27ad85(0x167)]['index']=_0x40b5f5;};},_0x34ed1d[_0x214696(0x220)][_0x214696(0x172)]=function(_0xff3dff,_0x328e71,_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd){var _0x33a8a3=_0x214696,_0x5283e9=this;return _0x328e71[typeof _0x5bbcff!=_0x33a8a3(0x1ec)?_0x33a8a3(0x137)+_0x5bbcff[_0x33a8a3(0x19a)]():_0x5bbcff]=!0x0,function(_0x811f2b){var _0x1ebac6=_0x33a8a3,_0x5659b7=_0xedb075['node'][_0x1ebac6(0x146)],_0x5b64e5=_0xedb075['node'][_0x1ebac6(0x15e)],_0x4ebd6c=_0xedb075['node'][_0x1ebac6(0x135)];_0xedb075[_0x1ebac6(0x167)]['parent']=_0x5659b7,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x811f2b,_0xff3dff[_0x1ebac6(0x16e)](_0x5283e9['_property'](_0x95c09a,_0x4ef89f,_0x5bbcff,_0xedb075,_0x2f75dd)),_0xedb075[_0x1ebac6(0x167)]['parent']=_0x4ebd6c,_0xedb075[_0x1ebac6(0x167)][_0x1ebac6(0x15e)]=_0x5b64e5;};},_0x34ed1d[_0x214696(0x220)]['_property']=function(_0x18b315,_0x3918ec,_0x5dfa18,_0x5319c6,_0x2d8fa5){var _0x53ed2c=_0x214696,_0x379c68=this;_0x2d8fa5||(_0x2d8fa5=function(_0x3ca008,_0x4b4854){return _0x3ca008[_0x4b4854];});var _0x3d7ff1=_0x5dfa18[_0x53ed2c(0x19a)](),_0x30d254=_0x5319c6['expressionsToEvaluate']||{},_0x155442=_0x5319c6[_0x53ed2c(0x21e)],_0x554fd1=_0x5319c6[_0x53ed2c(0x14a)];try{var _0x3237a0=this[_0x53ed2c(0x14c)](_0x18b315),_0x4e6244=_0x3d7ff1;_0x3237a0&&_0x4e6244[0x0]==='\\x27'&&(_0x4e6244=_0x4e6244[_0x53ed2c(0x197)](0x1,_0x4e6244[_0x53ed2c(0x153)]-0x2));var _0x30807e=_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254[_0x53ed2c(0x137)+_0x4e6244];_0x30807e&&(_0x5319c6[_0x53ed2c(0x21e)]=_0x5319c6[_0x53ed2c(0x21e)]+0x1),_0x5319c6[_0x53ed2c(0x14a)]=!!_0x30807e;var _0x5e0092=typeof _0x5dfa18==_0x53ed2c(0x1ec),_0x4ca784={'name':_0x5e0092||_0x3237a0?_0x3d7ff1:this[_0x53ed2c(0x228)](_0x3d7ff1)};if(_0x5e0092&&(_0x4ca784['symbol']=!0x0),!(_0x3918ec===_0x53ed2c(0x1b2)||_0x3918ec==='Error')){var _0x509ba0=this['_getOwnPropertyDescriptor'](_0x18b315,_0x5dfa18);if(_0x509ba0&&(_0x509ba0['set']&&(_0x4ca784[_0x53ed2c(0x223)]=!0x0),_0x509ba0[_0x53ed2c(0x13c)]&&!_0x30807e&&!_0x5319c6[_0x53ed2c(0x194)]))return _0x4ca784['getter']=!0x0,this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x14805b;try{_0x14805b=_0x2d8fa5(_0x18b315,_0x5dfa18);}catch(_0x485eec){return _0x4ca784={'name':_0x3d7ff1,'type':_0x53ed2c(0x170),'error':_0x485eec[_0x53ed2c(0x218)]},this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6),_0x4ca784;}var _0x2cab07=this[_0x53ed2c(0x147)](_0x14805b),_0x5f522f=this[_0x53ed2c(0x229)](_0x2cab07);if(_0x4ca784[_0x53ed2c(0x203)]=_0x2cab07,_0x5f522f)this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x2cdcf4=_0x53ed2c;_0x4ca784[_0x2cdcf4(0x1e8)]=_0x14805b['valueOf'](),!_0x30807e&&_0x379c68['_capIfString'](_0x2cab07,_0x4ca784,_0x5319c6,{});});else{var _0x18c4f5=_0x5319c6[_0x53ed2c(0x163)]&&_0x5319c6[_0x53ed2c(0x207)]<_0x5319c6[_0x53ed2c(0x225)]&&_0x5319c6[_0x53ed2c(0x1a4)]['indexOf'](_0x14805b)<0x0&&_0x2cab07!==_0x53ed2c(0x140)&&_0x5319c6[_0x53ed2c(0x148)]<_0x5319c6[_0x53ed2c(0x1d4)];_0x18c4f5||_0x5319c6[_0x53ed2c(0x207)]<_0x155442||_0x30807e?this[_0x53ed2c(0x17a)](_0x4ca784,_0x14805b,_0x5319c6,_0x30807e||{}):this[_0x53ed2c(0x19b)](_0x4ca784,_0x5319c6,_0x14805b,function(){var _0x9606df=_0x53ed2c;_0x2cab07==='null'||_0x2cab07===_0x9606df(0x224)||(delete _0x4ca784[_0x9606df(0x1e8)],_0x4ca784[_0x9606df(0x182)]=!0x0);});}return _0x4ca784;}finally{_0x5319c6[_0x53ed2c(0x17c)]=_0x30d254,_0x5319c6['depth']=_0x155442,_0x5319c6[_0x53ed2c(0x14a)]=_0x554fd1;}},_0x34ed1d['prototype'][_0x214696(0x1ca)]=function(_0x26ccea,_0x6e0d21,_0x5a73cf,_0x21a5ae){var _0x38dead=_0x214696,_0x3514b6=_0x21a5ae['strLength']||_0x5a73cf[_0x38dead(0x1a0)];if((_0x26ccea===_0x38dead(0x19f)||_0x26ccea===_0x38dead(0x12e))&&_0x6e0d21['value']){let _0x4b9a3f=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x153)];_0x5a73cf[_0x38dead(0x191)]+=_0x4b9a3f,_0x5a73cf['allStrLength']>_0x5a73cf[_0x38dead(0x13e)]?(_0x6e0d21[_0x38dead(0x182)]='',delete _0x6e0d21[_0x38dead(0x1e8)]):_0x4b9a3f>_0x3514b6&&(_0x6e0d21[_0x38dead(0x182)]=_0x6e0d21[_0x38dead(0x1e8)][_0x38dead(0x197)](0x0,_0x3514b6),delete _0x6e0d21['value']);}},_0x34ed1d[_0x214696(0x220)][_0x214696(0x14c)]=function(_0x4c3992){var _0x2533b1=_0x214696;return!!(_0x4c3992&&_0x1b84cf[_0x2533b1(0x144)]&&this['_objectToString'](_0x4c3992)===_0x2533b1(0x1d8)&&_0x4c3992[_0x2533b1(0x217)]);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x228)]=function(_0x3eeb2c){var _0x20c0cd=_0x214696;if(_0x3eeb2c[_0x20c0cd(0x22b)](/^\\d+$/))return _0x3eeb2c;var _0x387e31;try{_0x387e31=JSON['stringify'](''+_0x3eeb2c);}catch{_0x387e31='\\x22'+this['_objectToString'](_0x3eeb2c)+'\\x22';}return _0x387e31[_0x20c0cd(0x22b)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x387e31=_0x387e31['substr'](0x1,_0x387e31[_0x20c0cd(0x153)]-0x2):_0x387e31=_0x387e31['replace'](/'/g,'\\x5c\\x27')[_0x20c0cd(0x13a)](/\\\\\"/g,'\\x22')[_0x20c0cd(0x13a)](/(^\"|\"$)/g,'\\x27'),_0x387e31;},_0x34ed1d[_0x214696(0x220)][_0x214696(0x19b)]=function(_0x30b649,_0x4ffe49,_0x5f6329,_0x38e972){var _0x4d8b4d=_0x214696;this['_treeNodePropertiesBeforeFullValue'](_0x30b649,_0x4ffe49),_0x38e972&&_0x38e972(),this[_0x4d8b4d(0x141)](_0x5f6329,_0x30b649),this[_0x4d8b4d(0x1e9)](_0x30b649,_0x4ffe49);},_0x34ed1d[_0x214696(0x220)]['_treeNodePropertiesBeforeFullValue']=function(_0x5576c4,_0x3ebbfb){var _0x4c4b0a=_0x214696;this[_0x4c4b0a(0x1dd)](_0x5576c4,_0x3ebbfb),this['_setNodeQueryPath'](_0x5576c4,_0x3ebbfb),this['_setNodeExpressionPath'](_0x5576c4,_0x3ebbfb),this['_setNodePermissions'](_0x5576c4,_0x3ebbfb);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1dd)]=function(_0x20825e,_0x33577b){},_0x34ed1d['prototype'][_0x214696(0x22c)]=function(_0x25683b,_0x4784b5){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x154)]=function(_0x33bded,_0x1ca65a){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1ea)]=function(_0x5224eb){var _0x1075ea=_0x214696;return _0x5224eb===this[_0x1075ea(0x201)];},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1e9)]=function(_0x3bf243,_0x46d534){var _0x3c71e5=_0x214696;this[_0x3c71e5(0x154)](_0x3bf243,_0x46d534),this['_setNodeExpandableState'](_0x3bf243),_0x46d534[_0x3c71e5(0x1a3)]&&this['_sortProps'](_0x3bf243),this[_0x3c71e5(0x18a)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1e2)](_0x3bf243,_0x46d534),this[_0x3c71e5(0x1df)](_0x3bf243);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x141)]=function(_0x49892b,_0x2c9fcb){var _0x367b88=_0x214696;try{_0x49892b&&typeof _0x49892b['length']==_0x367b88(0x1ee)&&(_0x2c9fcb[_0x367b88(0x153)]=_0x49892b[_0x367b88(0x153)]);}catch{}if(_0x2c9fcb[_0x367b88(0x203)]==='number'||_0x2c9fcb['type']===_0x367b88(0x1bf)){if(isNaN(_0x2c9fcb[_0x367b88(0x1e8)]))_0x2c9fcb['nan']=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];else switch(_0x2c9fcb[_0x367b88(0x1e8)]){case Number[_0x367b88(0x174)]:_0x2c9fcb[_0x367b88(0x17b)]=!0x0,delete _0x2c9fcb[_0x367b88(0x1e8)];break;case Number[_0x367b88(0x1c1)]:_0x2c9fcb[_0x367b88(0x211)]=!0x0,delete _0x2c9fcb['value'];break;case 0x0:this[_0x367b88(0x20b)](_0x2c9fcb[_0x367b88(0x1e8)])&&(_0x2c9fcb[_0x367b88(0x156)]=!0x0);break;}}else _0x2c9fcb[_0x367b88(0x203)]===_0x367b88(0x140)&&typeof _0x49892b['name']==_0x367b88(0x19f)&&_0x49892b[_0x367b88(0x185)]&&_0x2c9fcb[_0x367b88(0x185)]&&_0x49892b[_0x367b88(0x185)]!==_0x2c9fcb[_0x367b88(0x185)]&&(_0x2c9fcb[_0x367b88(0x165)]=_0x49892b[_0x367b88(0x185)]);},_0x34ed1d['prototype'][_0x214696(0x20b)]=function(_0x227af0){return 0x1/_0x227af0===Number['NEGATIVE_INFINITY'];},_0x34ed1d['prototype'][_0x214696(0x222)]=function(_0x27dce3){var _0x331cd8=_0x214696;!_0x27dce3[_0x331cd8(0x210)]||!_0x27dce3[_0x331cd8(0x210)][_0x331cd8(0x153)]||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1b2)||_0x27dce3['type']===_0x331cd8(0x144)||_0x27dce3[_0x331cd8(0x203)]===_0x331cd8(0x1d7)||_0x27dce3[_0x331cd8(0x210)]['sort'](function(_0x1994d2,_0x317377){var _0x4191d5=_0x331cd8,_0x35525d=_0x1994d2[_0x4191d5(0x185)][_0x4191d5(0x1f9)](),_0x18ffb7=_0x317377[_0x4191d5(0x185)][_0x4191d5(0x1f9)]();return _0x35525d<_0x18ffb7?-0x1:_0x35525d>_0x18ffb7?0x1:0x0;});},_0x34ed1d[_0x214696(0x220)][_0x214696(0x18a)]=function(_0x5a52d9,_0x252462){var _0x1838f0=_0x214696;if(!(_0x252462[_0x1838f0(0x179)]||!_0x5a52d9['props']||!_0x5a52d9[_0x1838f0(0x210)]['length'])){for(var _0x25c031=[],_0x4fa983=[],_0x345970=0x0,_0x29561b=_0x5a52d9[_0x1838f0(0x210)][_0x1838f0(0x153)];_0x345970<_0x29561b;_0x345970++){var _0x18ce7d=_0x5a52d9[_0x1838f0(0x210)][_0x345970];_0x18ce7d[_0x1838f0(0x203)]==='function'?_0x25c031['push'](_0x18ce7d):_0x4fa983[_0x1838f0(0x16e)](_0x18ce7d);}if(!(!_0x4fa983[_0x1838f0(0x153)]||_0x25c031['length']<=0x1)){_0x5a52d9[_0x1838f0(0x210)]=_0x4fa983;var _0x1e2b92={'functionsNode':!0x0,'props':_0x25c031};this['_setNodeId'](_0x1e2b92,_0x252462),this[_0x1838f0(0x154)](_0x1e2b92,_0x252462),this['_setNodeExpandableState'](_0x1e2b92),this[_0x1838f0(0x184)](_0x1e2b92,_0x252462),_0x1e2b92['id']+='\\x20f',_0x5a52d9[_0x1838f0(0x210)]['unshift'](_0x1e2b92);}}},_0x34ed1d['prototype'][_0x214696(0x1e2)]=function(_0x34b99c,_0x45eb99){},_0x34ed1d[_0x214696(0x220)]['_setNodeExpandableState']=function(_0x5b55c3){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x180)]=function(_0x58cc5e){var _0xf4ba55=_0x214696;return Array[_0xf4ba55(0x1f1)](_0x58cc5e)||typeof _0x58cc5e==_0xf4ba55(0x164)&&this[_0xf4ba55(0x22e)](_0x58cc5e)===_0xf4ba55(0x227);},_0x34ed1d[_0x214696(0x220)][_0x214696(0x184)]=function(_0x29d75c,_0xe2d021){},_0x34ed1d[_0x214696(0x220)][_0x214696(0x1df)]=function(_0xa023c9){var _0x589591=_0x214696;delete _0xa023c9[_0x589591(0x12f)],delete _0xa023c9[_0x589591(0x152)],delete _0xa023c9[_0x589591(0x193)];},_0x34ed1d['prototype'][_0x214696(0x1db)]=function(_0x2562a9,_0x2d27a2){};let _0x28f581=new _0x34ed1d(),_0x502a66={'props':_0x513131[_0x214696(0x1b3)][_0x214696(0x210)]||0x64,'elements':_0x513131[_0x214696(0x1b3)][_0x214696(0x145)]||0x64,'strLength':_0x513131[_0x214696(0x1b3)]['strLength']||0x400*0x32,'totalStrLength':_0x513131[_0x214696(0x1b3)][_0x214696(0x13e)]||0x400*0x32,'autoExpandLimit':_0x513131[_0x214696(0x1b3)]['autoExpandLimit']||0x1388,'autoExpandMaxDepth':_0x513131[_0x214696(0x1b3)][_0x214696(0x225)]||0xa},_0x13ef23={'props':_0x513131[_0x214696(0x230)][_0x214696(0x210)]||0x5,'elements':_0x513131['reducedLimits'][_0x214696(0x145)]||0x5,'strLength':_0x513131['reducedLimits'][_0x214696(0x1a0)]||0x100,'totalStrLength':_0x513131[_0x214696(0x230)]['totalStrLength']||0x100*0x3,'autoExpandLimit':_0x513131[_0x214696(0x230)][_0x214696(0x1d4)]||0x1e,'autoExpandMaxDepth':_0x513131['reducedLimits']['autoExpandMaxDepth']||0x2};if(_0x475afa){let _0x29800f=_0x28f581[_0x214696(0x17a)][_0x214696(0x19d)](_0x28f581);_0x28f581[_0x214696(0x17a)]=function(_0x10fd5b,_0x3e4059,_0x54184b,_0x152e04){return _0x29800f(_0x10fd5b,_0x475afa(_0x3e4059),_0x54184b,_0x152e04);};}function _0x2b3bff(_0x12d8f0,_0x4cf31e,_0x573668,_0x6b9276,_0x430332,_0x9e1f91){var _0x317b69=_0x214696;let _0x120eeb,_0x5a07b2;try{_0x5a07b2=_0x5593f0(),_0x120eeb=_0x10c330[_0x4cf31e],!_0x120eeb||_0x5a07b2-_0x120eeb['ts']>_0x5f34e7['perLogpoint'][_0x317b69(0x14b)]&&_0x120eeb[_0x317b69(0x215)]&&_0x120eeb[_0x317b69(0x1c8)]/_0x120eeb[_0x317b69(0x215)]<_0x5f34e7[_0x317b69(0x1d0)][_0x317b69(0x134)]?(_0x10c330[_0x4cf31e]=_0x120eeb={'count':0x0,'time':0x0,'ts':_0x5a07b2},_0x10c330[_0x317b69(0x1d6)]={}):_0x5a07b2-_0x10c330['hits']['ts']>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x14b)]&&_0x10c330[_0x317b69(0x1d6)]['count']&&_0x10c330[_0x317b69(0x1d6)]['time']/_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x215)]<_0x5f34e7['global'][_0x317b69(0x134)]&&(_0x10c330['hits']={});let _0x371293=[],_0x57f51c=_0x120eeb[_0x317b69(0x1da)]||_0x10c330[_0x317b69(0x1d6)]['reduceLimits']?_0x13ef23:_0x502a66,_0x1bcf5c=_0x91ed01=>{var _0x1aa6af=_0x317b69;let _0xc556ae={};return _0xc556ae[_0x1aa6af(0x210)]=_0x91ed01['props'],_0xc556ae[_0x1aa6af(0x145)]=_0x91ed01[_0x1aa6af(0x145)],_0xc556ae['strLength']=_0x91ed01[_0x1aa6af(0x1a0)],_0xc556ae[_0x1aa6af(0x13e)]=_0x91ed01[_0x1aa6af(0x13e)],_0xc556ae['autoExpandLimit']=_0x91ed01[_0x1aa6af(0x1d4)],_0xc556ae[_0x1aa6af(0x225)]=_0x91ed01[_0x1aa6af(0x225)],_0xc556ae['sortProps']=!0x1,_0xc556ae['noFunctions']=!_0x22cb75,_0xc556ae[_0x1aa6af(0x21e)]=0x1,_0xc556ae[_0x1aa6af(0x207)]=0x0,_0xc556ae['expId']=_0x1aa6af(0x1c3),_0xc556ae['rootExpression']='root_exp',_0xc556ae[_0x1aa6af(0x163)]=!0x0,_0xc556ae['autoExpandPreviousObjects']=[],_0xc556ae[_0x1aa6af(0x148)]=0x0,_0xc556ae[_0x1aa6af(0x194)]=_0x513131['resolveGetters'],_0xc556ae[_0x1aa6af(0x191)]=0x0,_0xc556ae[_0x1aa6af(0x167)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0xc556ae;};for(var _0x1b0099=0x0;_0x1b0099<_0x430332[_0x317b69(0x153)];_0x1b0099++)_0x371293['push'](_0x28f581[_0x317b69(0x17a)]({'timeNode':_0x12d8f0===_0x317b69(0x1c8)||void 0x0},_0x430332[_0x1b0099],_0x1bcf5c(_0x57f51c),{}));if(_0x12d8f0===_0x317b69(0x160)||_0x12d8f0===_0x317b69(0x1fb)){let _0x2d5716=Error[_0x317b69(0x18c)];try{Error[_0x317b69(0x18c)]=0x1/0x0,_0x371293[_0x317b69(0x16e)](_0x28f581['serialize']({'stackNode':!0x0},new Error()[_0x317b69(0x21f)],_0x1bcf5c(_0x57f51c),{'strLength':0x1/0x0}));}finally{Error[_0x317b69(0x18c)]=_0x2d5716;}}return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':_0x371293,'id':_0x4cf31e,'context':_0x9e1f91}]};}catch(_0x40679d){return{'method':_0x317b69(0x169),'version':_0x425029,'args':[{'ts':_0x573668,'session':_0x6b9276,'args':[{'type':_0x317b69(0x170),'error':_0x40679d&&_0x40679d[_0x317b69(0x218)]}],'id':_0x4cf31e,'context':_0x9e1f91}]};}finally{try{if(_0x120eeb&&_0x5a07b2){let _0x27a114=_0x5593f0();_0x120eeb['count']++,_0x120eeb[_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x120eeb['ts']=_0x27a114,_0x10c330['hits'][_0x317b69(0x215)]++,_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1c8)]+=_0x48727a(_0x5a07b2,_0x27a114),_0x10c330[_0x317b69(0x1d6)]['ts']=_0x27a114,(_0x120eeb['count']>_0x5f34e7['perLogpoint'][_0x317b69(0x1ce)]||_0x120eeb['time']>_0x5f34e7['perLogpoint']['reduceOnAccumulatedProcessingTimeMs'])&&(_0x120eeb[_0x317b69(0x1da)]=!0x0),(_0x10c330['hits']['count']>_0x5f34e7['global'][_0x317b69(0x1ce)]||_0x10c330['hits'][_0x317b69(0x1c8)]>_0x5f34e7[_0x317b69(0x1a5)][_0x317b69(0x1aa)])&&(_0x10c330[_0x317b69(0x1d6)][_0x317b69(0x1da)]=!0x0);}}catch{}}}return _0x2b3bff;}function G(_0x434b91){var _0x257403=_0x27f4ea;if(_0x434b91&&typeof _0x434b91=='object'&&_0x434b91[_0x257403(0x12c)])switch(_0x434b91['constructor']['name']){case _0x257403(0x1c0):return _0x434b91[_0x257403(0x1bc)](Symbol[_0x257403(0x15f)])?Promise[_0x257403(0x1d2)]():_0x434b91;case _0x257403(0x15d):return Promise[_0x257403(0x1d2)]();}return _0x434b91;}((_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x39ddf7,_0x2e212d,_0x35551d,_0x1eb46e,_0x4e3e05,_0x219815,_0x40c102)=>{var _0x47ee38=_0x27f4ea;if(_0xb12d58[_0x47ee38(0x166)])return _0xb12d58[_0x47ee38(0x166)];let _0x41d96a={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}};if(!X(_0xb12d58,_0x35551d,_0x3edf33))return _0xb12d58[_0x47ee38(0x166)]=_0x41d96a,_0xb12d58[_0x47ee38(0x166)];let _0x5cf254=b(_0xb12d58),_0x211417=_0x5cf254['elapsed'],_0x120ed8=_0x5cf254[_0x47ee38(0x171)],_0x4d12ad=_0x5cf254[_0x47ee38(0x1f6)],_0x40a67f={'hits':{},'ts':{}},_0xbddbd0=J(_0xb12d58,_0x1eb46e,_0x40a67f,_0x39ddf7,_0x40c102,_0x3edf33===_0x47ee38(0x177)?G:void 0x0),_0x391c84=(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e)=>{var _0x5a78e6=_0x47ee38;let _0x2a987d=_0xb12d58[_0x5a78e6(0x166)];try{return _0xb12d58[_0x5a78e6(0x166)]=_0x41d96a,_0xbddbd0(_0x3a42bb,_0x4e5be3,_0x29339e,_0x59a5b4,_0x4e05b6,_0xeaaf9e);}finally{_0xb12d58[_0x5a78e6(0x166)]=_0x2a987d;}},_0x486373=_0x41f49c=>{_0x40a67f['ts'][_0x41f49c]=_0x120ed8();},_0x375f8a=(_0x586b6b,_0x281c49)=>{var _0x42f9bc=_0x47ee38;let _0x1de228=_0x40a67f['ts'][_0x281c49];if(delete _0x40a67f['ts'][_0x281c49],_0x1de228){let _0x3d4aab=_0x211417(_0x1de228,_0x120ed8());_0x3b4188(_0x391c84(_0x42f9bc(0x1c8),_0x586b6b,_0x4d12ad(),_0x39ea0c,[_0x3d4aab],_0x281c49));}},_0x36a5c5=_0x538015=>{var _0x2867b1=_0x47ee38,_0x3d1b72;return _0x3edf33===_0x2867b1(0x177)&&_0xb12d58[_0x2867b1(0x15b)]&&((_0x3d1b72=_0x538015==null?void 0x0:_0x538015[_0x2867b1(0x1bb)])==null?void 0x0:_0x3d1b72['length'])&&(_0x538015[_0x2867b1(0x1bb)][0x0]['origin']=_0xb12d58[_0x2867b1(0x15b)]),_0x538015;};_0xb12d58[_0x47ee38(0x166)]={'consoleLog':(_0x51ed74,_0xe11fc)=>{var _0x38ecd1=_0x47ee38;_0xb12d58[_0x38ecd1(0x1cd)]['log'][_0x38ecd1(0x185)]!==_0x38ecd1(0x158)&&_0x3b4188(_0x391c84(_0x38ecd1(0x169),_0x51ed74,_0x4d12ad(),_0x39ea0c,_0xe11fc));},'consoleTrace':(_0x137d17,_0x1d312d)=>{var _0x51cf82=_0x47ee38,_0x5b8a58,_0x41a828;_0xb12d58[_0x51cf82(0x1cd)][_0x51cf82(0x169)][_0x51cf82(0x185)]!==_0x51cf82(0x16d)&&((_0x41a828=(_0x5b8a58=_0xb12d58['process'])==null?void 0x0:_0x5b8a58[_0x51cf82(0x16c)])!=null&&_0x41a828['node']&&(_0xb12d58[_0x51cf82(0x155)]=!0x0),_0x3b4188(_0x36a5c5(_0x391c84(_0x51cf82(0x160),_0x137d17,_0x4d12ad(),_0x39ea0c,_0x1d312d))));},'consoleError':(_0x1f78e4,_0x2b1ba8)=>{var _0x13a967=_0x47ee38;_0xb12d58[_0x13a967(0x155)]=!0x0,_0x3b4188(_0x36a5c5(_0x391c84(_0x13a967(0x1fb),_0x1f78e4,_0x4d12ad(),_0x39ea0c,_0x2b1ba8)));},'consoleTime':_0x1a9247=>{_0x486373(_0x1a9247);},'consoleTimeEnd':(_0x5d368a,_0x200ddf)=>{_0x375f8a(_0x200ddf,_0x5d368a);},'autoLog':(_0x5d21fe,_0x1d28a4)=>{var _0x262f79=_0x47ee38;_0x3b4188(_0x391c84(_0x262f79(0x169),_0x1d28a4,_0x4d12ad(),_0x39ea0c,[_0x5d21fe]));},'autoLogMany':(_0x3c9460,_0x1c3a81)=>{_0x3b4188(_0x391c84('log',_0x3c9460,_0x4d12ad(),_0x39ea0c,_0x1c3a81));},'autoTrace':(_0x1e8e77,_0x45393a)=>{var _0x10935e=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0x10935e(0x160),_0x45393a,_0x4d12ad(),_0x39ea0c,[_0x1e8e77])));},'autoTraceMany':(_0x5e24f4,_0x2f9fe6)=>{var _0xfcca09=_0x47ee38;_0x3b4188(_0x36a5c5(_0x391c84(_0xfcca09(0x160),_0x5e24f4,_0x4d12ad(),_0x39ea0c,_0x2f9fe6)));},'autoTime':(_0x5efb2d,_0x485584,_0x2bb811)=>{_0x486373(_0x2bb811);},'autoTimeEnd':(_0x43da21,_0x51b33a,_0x2ed8c7)=>{_0x375f8a(_0x51b33a,_0x2ed8c7);},'coverage':_0x188923=>{var _0x35709e=_0x47ee38;_0x3b4188({'method':_0x35709e(0x1e1),'version':_0x39ddf7,'args':[{'id':_0x188923}]});}};let _0x3b4188=H(_0xb12d58,_0x1c1888,_0x4be2b0,_0x6defa5,_0x3edf33,_0x4e3e05,_0x219815),_0x39ea0c=_0xb12d58[_0x47ee38(0x16b)];return _0xb12d58[_0x47ee38(0x166)];})(globalThis,_0x27f4ea(0x159),'61485',_0x27f4ea(0x1e5),'webpack',_0x27f4ea(0x151),_0x27f4ea(0x1b7),_0x27f4ea(0x1bd),_0x27f4ea(0x1be),'','1',{\"resolveGetters\":false,\"defaultLimits\":{\"props\":100,\"elements\":100,\"strLength\":51200,\"totalStrLength\":51200,\"autoExpandLimit\":5000,\"autoExpandMaxDepth\":10},\"reducedLimits\":{\"props\":5,\"elements\":5,\"strLength\":256,\"totalStrLength\":768,\"autoExpandLimit\":30,\"autoExpandMaxDepth\":2},\"reducePolicy\":{\"perLogpoint\":{\"reduceOnCount\":50,\"reduceOnAccumulatedProcessingTimeMs\":100,\"resetWhenQuietMs\":500,\"resetOnProcessingTimeAverageMs\":100},\"global\":{\"reduceOnCount\":1000,\"reduceOnAccumulatedProcessingTimeMs\":300,\"resetWhenQuietMs\":50,\"resetOnProcessingTimeAverageMs\":100}}});");}catch(e){console.error(e);}};/* istanbul ignore next */function oo_oo(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleLog(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tr(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleTrace(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tx(/**@type{any}**/i,/**@type{any}**/...v){try{oo_cm().consoleError(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_ts(/**@type{any}**/v){try{oo_cm().consoleTime(v);}catch(e){} return v;};/* istanbul ignore next */function oo_te(/**@type{any}**/v, /**@type{any}**/i){try{oo_cm().consoleTimeEnd(v, i);}catch(e){} return v;};/*eslint unicorn/no-abusive-eslint-disable:,eslint-comments/disable-enable-pair:,eslint-comments/no-unlimited-disable:,eslint-comments/no-aggregating-enable:,eslint-comments/no-duplicate-disable:,eslint-comments/no-unused-disable:,eslint-comments/no-unused-enable:,*/