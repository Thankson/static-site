import { mapState } from 'vuex';
import { isProductsDefault, isRiverbendDefault } from '../utils/payment-methods';

export default {
    computed: {
        ...mapState('paymentMethod', ['storedPayMethods']),

        defaultPayMethod() {
            return this.riverbendDefault ? this.riverbendDefault : this.melaleucaDefault;
        },
        melaleucaDefault() {
            return this.storedPayMethods.find(payMethod => isProductsDefault(payMethod.PayMethodDefaults)) || {};
        },
        riverbendDefault() {
            return this.storedPayMethods.find(payMethod => isRiverbendDefault(payMethod.PayMethodDefaults));
        }
    }
};
