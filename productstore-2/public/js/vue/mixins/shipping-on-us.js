export default {
    computed: {
        shippingOnUsEnabled() {
            return (
                this.summary.ShippingOnUsEnabled &&
                this.summary.ShippingOnUsRates !== null
            );
        },
        shippingOnUsCurrentOffer() {
            return this.summary.ShippingOnUsRates?.CurrentOffer ?? {};
        },
        shippingOnUsAvailableOffers() {
            return this.summary.ShippingOnUsRates?.AvailableOffers ?? [];
        },
        freeShippingEnabled() {
            return (
                this.summary.FreeShippingEnabled &&
                this.summary.FreeShipping !== null
            );
        },
        freeShippingCurrentOffer() {
            return this.summary.FreeShipping?.CurrentOffer ?? {};
        },
        freeShippingAvailableOffers() {
            return this.summary.FreeShipping?.AvailableOffers ?? [];
        }
    }
};
