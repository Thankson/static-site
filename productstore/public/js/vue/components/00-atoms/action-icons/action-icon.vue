<template>
    <button
        v-if="sku === null"
        class="a-actionIcon"
        :class="modifier"
        :aria-label="buttonText"
        :data-js="buttonDataJs"
        :data-video="buttonDataVideo"
        :data-target="buttonDataTarget"
        :title="buttonText"
        @click.once="triggerDataLayer">
        <img class="a-actionIcon__img" :src="imgSrc" :alt="imgAlt" :aria-hidden="imgAriaHidden">
    </button>

    <o-shelf-configurator
        v-else
        :sku="sku"
        :family-id="familyId"
        :button-label="buttonText"
        :product-name="productName"
        class="a-actionIcon"
        @shelf-open="triggerDataLayer">
        <img class="a-actionIcon__img" :src="imgSrc" :alt="imgAlt" :aria-hidden="imgAriaHidden">
    </o-shelf-configurator>
</template>

<script>
    export default {
        name: 'ActionIcon',

        props: {
            buttonDataJs: {
                type: String,
                default: null
            },
            buttonDataTarget: {
                type: String,
                default: null
            },
            buttonDataVideo: {
                type: String,
                default: null
            },
            buttonText: {
                type: String,
                default: null
            },
            imgAlt: {
                type: String,
                default: null
            },
            imgAriaHidden: {
                type: Boolean,
                default: null
            },
            imgSrc: {
                type: String,
                default: null
            },
            familyId: {
                type: String,
                default: '123'
            },
            modifier: {
                type: String,
                default: null
            },
            sku: {
                type: String,
                default: '1243'
            },
            productName: {
                type: String,
                default: 'Name of Product'
            }
        },
        methods: {
            triggerDataLayer() {
                this.$emit('data-layer-push', 'CTA');
                // convertlab data track
                this.$emit('cl-track');
            }
        }
    };
</script>
