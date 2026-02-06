<template>
    <div class="m-productIngredient">
        <h2 class="m-productIngredient__heading">
            {{ heading }}
        </h2>
        <ul v-if="showIngredients" id="ingredientsList" class="m-productIngredient__items">
            <template v-for="item in ingredients">
                <li :key="item.Name" class="m-productIngredient__item">
                    <!-- button wrapper makes chip clickable -->
                    <button
                        v-if="item.Description"
                        type="button"
                        class="m-productIngredient__buttonChip"
                        :aria-label="computeAriaLabel(item)"
                        @click="openModalFor(item)"
                    >
                        <a-chip
                            :label="item.Name"
                            :data-test-id="item.Name"
                            :show-icon="!!item.Description"
                            class="m-productIngredient__icon"
                        />
                    </button>

                    <!-- not clickable -->
                    <a-chip
                        v-else
                        :label="item.Name"
                        :show-icon="false"
                        :data-test-id="item.Name"
                        tabindex="0"
                        class="m-productIngredient__icon"
                        @click="openModalFor(item)"
                    />
                </li>
            </template>
        </ul>
        <a-modal-toggle v-if="selected" ref="ingredientModal" :heading-visible="true">
            <template #heading>
                {{ selected?.Name }}
            </template>

            <template #body>
                <p class="m-productIngredient__description" v-html="selected?.Description" />
            </template>

            <template v-if="selected?.LinkUrl" #footer>
                <a :href="selected?.LinkUrl" rel="noopener" class="m-productIngredient__link">
                    {{ selected?.LinkText || 'Learn More' }}
                </a>
            </template>
        </a-modal-toggle>

        <button
            type="button"
            :aria-expanded="showIngredients"
            aria-controls="ingredientsList"
            :class="`m-productIngredient__button ${buttonClass}`"
            @click="onClickHandler"
        >
            {{ buttonText }}
        </button>
    </div>
</template>

<script>
    import AChip from '@productstore/source/js/vue/components/00-atoms/chip/chip.vue';

    export default {
        name: 'MProductIngredient',
        components: {
            AChip
        },
        props: {
            showRecordsText: {
                type: String,
                required: true,
                default: ''
            },
            hideRecordsText: {
                type: String,
                required: true,
                default: ''
            },
            showIngredients: {
                type: Boolean,
                default: false
            },
            heading: {
                type: String,
                required: true,
                default: ''
            },
            ariaLabel: {
                type: String,
                default: ''
            },
            ingredients: {
                type: Array,
                required: true,
                default: () => []
            },
            buttonClass: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                selected: null
            };
        },
        computed: {
            buttonText() {
                return this.showIngredients ? this.showRecordsText : this.hideRecordsText;
            }
        },
        mounted() {
            this.addModalHideListener();
        },
        methods: {
            addModalHideListener() {
                /** Listens to modal hide event */
                this.$modal.$on.hidden(() => {
                    this.selected = null;
                });
            },
            pushIngredientsEvent(data) {
                if(window.dataLayer) {
                    const dataLayer = window.dataLayer || [];
                    const event = {
                        'event': 'userEvent',
                        'eC': 'Ingredients',
                        'eA': 'CTA',
                        'eL': data?.Name
                    };

                    dataLayer.push(event);
                    this.pushModalDataLayerEvent(dataLayer, data);
                }
            },
            pushModalDataLayerEvent(data) {
                if(!window.dataLayer) return;

                const dataLayer = window.dataLayer || [];
                const event = {
                    'event': 'userEvent',
                    'eC': 'Ingredients Modal',
                    'eA': 'View',
                    'eL': data?.Description
                };
                dataLayer.push(event);
            },
            openModalFor(item) {
                if(!item?.Description) {
                    this.pushIngredientsEvent(item);
                    return;
                }

                this.selected = item;
                this.pushIngredientsEvent(item);
                this.pushModalDataLayerEvent(item);

                this.$nextTick(() => {
                    if(this.$refs.ingredientModal && this.$refs.ingredientModal.show) {
                        this.$refs.ingredientModal.show();
                    } else {
                        console.warn('ingredientModal ref missing or no show() method');
                    }
                });
            },
            onClickHandler() {
                this.$emit('click');
            },
            computeAriaLabel(item) {
                const template = this.ariaLabel || '';
                const name = item?.Name || '';
                if(!template) return name;
                return template.includes('{0}') ? template.replace('{0}', name) : template || name;
            }
        }

    };
</script>
