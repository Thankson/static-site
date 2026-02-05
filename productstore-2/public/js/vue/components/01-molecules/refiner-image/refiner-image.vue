<template>
    <component
        :is="rootEl"
        class="m-refinerImage"
        :class="rootClasses"
        :aria-disabled="disabled"
        @click="rootEl === 'button' ? $emit('click') : null">

        <div class="m-refinerImage__media">
            <p
                v-if="offsaleMessage"
                class="m-refinerImage__offsale">
                {{ offsaleMessage }}
            </p>

            <img
                v-if="imageUrl"
                :src="imageUrl"
                :alt="imageAlt || title"
                class="m-refinerImage__img"
                :class="offsaleMessage ? '-offsale' : ''">
        </div>

        <component
            :is="titleEl"
            class="m-refinerImage__title">

            <slot>
                {{ title }}
            </slot>
        </component>
    </component>
</template>

<script>
    export default {
        name: 'MRefinerImage',
        props: {
            rootEl: {
                type: String,
                default: 'button'
            },
            titleEl: {
                type: String,
                default: 'div'
            },
            offsaleMessage: {
                type: String,
                default: null
            },
            imageUrl: {
                type: String,
                required: true
            },
            imageAlt: {
                type: String,
                default: null
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
            }
        },
        computed: {
            rootClasses() {
                return [
                    this.disabled ? '-disabled' : '',
                    this.selected ? '-selected' : ''
                ];
            }
        }
    };
</script>
