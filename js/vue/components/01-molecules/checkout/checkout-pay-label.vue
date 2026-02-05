<template>
    <!-- Used on KR -->
    <a-pay-label
        v-if="isKr && selectedPayMethod"
        class="flex"
        :account-number-preview="selectedPayMethod.LastFourDigitsOfAccount"
        :display-name="selectedPayMethod.PaymethodNameDisplay"
        :card-brand-name="selectedPayMethod.CreditCardDescription"
        :expiration-date="selectedPayMethod.ExpirationDisplay"
        :expires-label="expiresLabel"
        :expired-label="expiredLabel"
        :expires-soon="selectedPayMethod.ExpiresSoon"
        :is-expired="selectedPayMethod.Expired"
        :image="selectedPayMethod.PayMethodImage"
        :type="selectedPayMethod.PayMethodType"
        :card-masking="selectedPayMethod.MaskingCondensed"
        :is-kr="isKr"
        :is-cn="$env.IsCn"
        :show-expired-date="showExpiredDate"
    />

    <!-- Used on CN -->
    <a-pay-label
        v-else-if="$env.IsCn && selectedPayMethod"
        class="flex mt-5"
        :display-name="selectedPayMethod.Text"
        :image="selectedPayMethod.Image"
        :is-cn="$env.IsCn"
        :show-expired-date="showExpiredDate"
    />

    <!-- Used on US/MX/CA -->
    <a-pay-label
        v-else-if="selectedPayMethod"
        class="flex"
        :account-number-preview="selectedPayMethod.LastFourDigitsOfAccount"
        :display-name="selectedPayMethod.PaymethodNameDisplay"
        :expiration-date="selectedPayMethod.ExpirationDisplay"
        :expires-label="expiresLabel"
        :expired-label="expiredLabel"
        :expires-soon="selectedPayMethod.ExpiresSoon"
        :image="selectedPayMethod.PayMethodImage"
        :is-expired="selectedPayMethod.Expired"
        :is-cn="$env.IsCn"
        :name-on-account="selectedPayMethod.NameOnAccount"
        :type="selectedPayMethod.PayMethodType"
        :card-masking="selectedPayMethod.MaskingCondensed"
        :show-expired-date="showExpiredDate"
    />
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        name: 'MCheckoutPayLabel',
        props: {
            expiredLabel: {
                type: String,
                default: 'Expired'
            },
            expiresLabel: {
                type: String,
                default: 'Expires'
            },
            showExpiredDate: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapGetters('checkout', ['selectedPayMethod']),

            isKr() {
                return this.$env.Country === 'Korea';
            }
        }
    };
</script>
