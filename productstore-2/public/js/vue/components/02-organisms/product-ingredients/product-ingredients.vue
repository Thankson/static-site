<template>
    <div v-if="isApiSuccess" class="o-productIngredients">
        <m-product-ingredient
            v-if="hasKeyIngredients"
            :heading="keyIngredientsLabel"
            :aria-label="ariaLabel"
            :show-records-text="isKeyIngredientsVisible ? seeAllIngredientsLabel : seeFewerIngredientsLabel"
            :hide-records-text="seeFewerIngredientsLabel"
            :ingredients="ingredients.KeyIngredients"
            :show-ingredients="true"
            :button-class="isKeyIngredientsVisible ? '-collapsed' : ''"
            @click="isKeyIngredientsVisible = !isKeyIngredientsVisible;"
        />

        <m-product-ingredient
            v-if="isAllIngredientsVisible"
            :heading="allIngredientsLabel"
            :aria-label="ariaLabel"
            :show-records-text="seeFewerIngredientsLabel"
            :hide-records-text="seeFewerIngredientsLabel"
            :ingredients="ingredients.AllIngredients"
            :show-ingredients="!isKeyIngredientsVisible || !hasKeyIngredients"
            :button-class="!hasKeyIngredients ? 'hidden': '-collapsed'"
            @click="isKeyIngredientsVisible = true;"
        />

        <p class="text-left w-full max-w-xl pt-40 px-8 mb-20" v-html="footerText" />
    </div>
</template>

<script>
    import MProductIngredient from '@productstore/source/js/vue/components/01-molecules/product-ingredient/product-ingredient.vue';
    import apiProductingredients from '@api/routes/productingredients';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OProductIngredients',
        components: {
            MProductIngredient
        },
        mixins: [localizationMixin],
        props: {
        },
        data() {
            return {
                ingredients: {},
                isApiSuccess: false,
                showAllIngredients: true,
                isKeyIngredientsVisible: true
            };
        },
        computed: {
            allIngredientsLabel() {
                return this.getLocalizationProp('Labels.AllIngredients');
            },
            ariaLabel() {
                return this.getLocalizationProp('Labels.AriaLabel');
            },
            footerText() {
                return this.getLocalizationProp('Labels.FooterText');
            },
            hasAllIngredients() {
                return this.ingredients?.AllIngredients && this.ingredients?.AllIngredients?.length > 0;
            },
            hasKeyIngredients() {
                return this.ingredients?.KeyIngredients && this.ingredients?.KeyIngredients?.length > 0;
            },
            isAllIngredientsVisible() {
                return this.hasAllIngredients && (!this.isKeyIngredientsVisible || !this.hasKeyIngredients);
            },
            keyIngredientsLabel() {
                return this.getLocalizationProp('Labels.KeyIngredients');
            },
            productSku() {
                return this.getLocalizationProp('Data.ProductSku');
            },
            seeAllIngredientsLabel() {
                return this.getLocalizationProp('Labels.SeeAllIngredients');
            },
            seeFewerIngredientsLabel() {
                return this.getLocalizationProp('Labels.SeeFewerIngredients');
            }
        },
        mounted() {
            this.fetchIngredients();
        },
        methods: {
            async fetchIngredients() {
                if(!this.productSku) return;

                const result = await apiProductingredients.get(`?productSku=${this.productSku}`);
                this.ingredients = result?.data?.Data ?? {};
                this.isApiSuccess = result?.data?.Success ?? false;
            }
        }
    };
</script>

<style></style>
