<template>
    <div class="m-couponSave" :class="{ '-secondary': !hasReminderDate }">
        <h3 class="m-couponSave__heading">{{ replaceToken(bottomTileTitle, currentMonth ? currentMonth : '') }}</h3>
        <p class="m-couponSave__amount">{{ formattedAvailableSavings }}</p>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MCouponPageSavings',
        props: {
            bottomTileTitle: {
                type: String,
                default: ''
            }
        },
        computed: {
            ...mapState('coupon', ['hasReminderDate', 'formattedAvailableSavings', 'currentMonth'])
        },
        methods: {
            replaceToken
        }
    };
</script>
