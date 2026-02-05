import regexParser from 'regex-parser';

const PHONE_TYPES = ['BusinessPhone', 'HomePhone', 'MobilePhone'];

const TW_PHONE_TYPE_REGEX = {
    homeOrBusiness: '^0[1-8]\\d{7,8}$',
    mobile: '^09\\d{8}$'
};

// TW specific method currently used for validation in UpdatePhoneNumbers component
// rendered on the reactivation form and my account settings profile page
const isValidTwPhoneNumberType = (number, type) => {
    if(!type || !PHONE_TYPES.includes(type)) {
        console.log('Phone number type error -> ', type);
        return;
    }

    if(type === 'HomePhone' || type === 'BusinessPhone') {
        return regexParser(TW_PHONE_TYPE_REGEX.homeOrBusiness).test(number);
    }
    if(type === 'MobilePhone') {
        return regexParser(TW_PHONE_TYPE_REGEX.mobile).test(number);
    }
};

export default isValidTwPhoneNumberType;
