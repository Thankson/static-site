<template>
    <a
        class="m-cartIcon"
        :href="getLocalizationProp('Data.CartUrl')"
        data-testid="icon-CartIcon">

        <span class="material-icons m-cartIcon__icon">
            shopping_cart
        </span>

        <!-- Bug:72646 - Added a key as the cart item wasn't updating because of google translate -->
        <span :key="itemCount || 0" class="m-cartIcon__badge">
            {{ itemCount || 0 }}
        </span>
    </a>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'MCartIcon',
        mixins: [ localizationMixin ],
        computed: {
            ...mapState('cartSummary', ['itemCount'])
        },
        created() {
            if(this.itemCount === null) {
                this.getSummary();
            }
        },
        methods: {
            ...mapActions('cartSummary', ['getSummary'])
        }
    };
</script>
