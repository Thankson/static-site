<template>
    <component
        :is="rootEl"
        class="m-refinerSwatch"
        :class="rootClasses"
        @click="rootEl === 'button' ? onClick() : null"
        @focus="$emit('focus')"
        @blur="$emit('blur')">

        <div class="m-refinerSwatch__border">
            <div class="m-refinerSwatch__media">
                <img
                    v-if="imageAlt && title"
                    :src="imageUrl"
                    class="m-refinerSwatch__fill">
                <img
                    v-else
                    :src="imageUrl"
                    :alt="imageAlt || title"
                    class="m-refinerSwatch__fill">
            </div>
        </div>

        <component
            :is="titleEl"
            class="m-refinerSwatch__title">

            <slot>
                {{ title }}
            </slot>
        </component>
    </component>
</template>

<script>
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'MRefinerSwatch',
        props: {
            sku: {
                type: String,
                default: ''
            },
            rootEl: {
                type: String,
                default: 'button'
            },
            swatchStyle: {
                type: String,
                default: ''
            },
            titleEl: {
                type: String,
                default: 'p'
            },
            imageUrl: {
                type: String,
                required: true
            },
            imageAlt: {
                type: String,
                default: null
            },
            isTryOnTool: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            selected: {
                type: Boolean,
                default: false
            },
            tryOnToolType: {
                type: String,
                default: ''
            },
            isCn: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                swatchColor: '',
                colorData: {}
            };
        },
        computed: {
            ...mapState('tryOnTool', ['colorLookUp', 'colorChoice', 'colorProfile']),
            rootClasses() {
                return [
                    this.selected ? '-selected' : ''
                ];
            }
        },
        methods: {
            ...mapActions('tryOnTool', [ 'updateColor', 'updateEyeShadow', 'updateBlush']),

            onClick() {
                this.$emit('click');
                if(this.isTryOnTool) {
                    if(this.isCn) {
                        switch (this.tryOnToolType) {
                            case 'EyeShadow': this.updateEyeShadow({ sku: this.sku}); break;
                            case 'Blush': this.updateBlush({ sku: this.sku}); break;
                            case 'LipLiner': this.updateColor({ sku: this.sku, type: this.swatchStyle}); break;
                        }
                    } else {
                        this.updateColor({ sku: this.sku, type: this.swatchStyle});
                    }
                }
            }
        }
    };
</script>
