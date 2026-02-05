<template>
    <accordion
        arrow-color="white"
        arrow-size="-md"
        :content-id="accordionId"
        mod-content="-container"
        mod-title="-moreInfo"
        mod-toggler="-moreInfo"
        :title="getLocalizationProp('Labels.MoreInformation', 'More Information')"
        title-el="h2"
        :toggle-id="toggleId">

        <div class="pt-10 md:pt-25">
            <IngredientAccordion
                v-for="(product, productIndex) in products"
                :key="safeId(`ingredientAccordion_${productIndex}`)"
                class="mb-10"
                :title="product.Title">

                <template #default="{ itemElementClass, listElementClass }">
                    <ul
                        v-if="product.Ingredients && product.Ingredients.length"
                        :class="listElementClass">

                        <li
                            v-for="(ingredient, ingredientIndex) in product.Ingredients"
                            :key="ingredientIndex"
                            :class="itemElementClass">

                            <IngredientCard
                                :rte="ingredient.RTE"
                                :title="ingredient.Title"
                            />
                        </li>
                    </ul>

                    <a
                        v-if="product.SafetyDataSheetLinkVisible && product.SafetyDataSheetLink && product.SafetyDataSheetLink.Url"
                        class="block text-green underline mb-15"
                        :target="product.SafetyDataSheetLink.Target"
                        :href="product.SafetyDataSheetLink.Url">

                        {{ product.SafetyDataSheetLink.Text || 'View Safety Data Sheet' }}
                    </a>

                    <a
                        v-if="product.AdditionalProductInformationLink && product.AdditionalProductInformationLink.Url"
                        class="block text-green underline mb-30"
                        :target="product.AdditionalProductInformationLink.Target"
                        :href="product.AdditionalProductInformationLink.Url">

                        {{ product.AdditionalProductInformationLink.Text || 'Additional Product Information' }}
                    </a>
                </template>
            </IngredientAccordion>
        </div>

    </accordion>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';
    import IngredientAccordion from './ingredient-accordion.vue';
    import IngredientCard from '../../01-molecules/ingredients/ingredient-card.vue';

    export default {
        name: 'OIngredientPhilosophyAccordion',
        components: {
            IngredientAccordion,
            IngredientCard
        },
        mixins: [ localizationMixin, safeIdMixin ],
        safeIds: [
            'accordionId',
            'toggleId'
        ],
        data() {
            return {
                accordionId: '',
                toggleId: ''
            };
        },
        computed: {
            products() {
                return this.getLocalizationProp('Data.Tabs', []);
            }
        },
        methods: {
            serializeLists(lists) {
                if(!lists || !lists.length) return [];

                return lists.map((list) => ({
                    target: list.Target,
                    text: list.Text,
                    url: list.Url
                }));
            }
        }
    };
</script>
