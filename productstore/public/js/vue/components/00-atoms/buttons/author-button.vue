<template>
    <component
        :is="!href ? 'button' : 'a'"
        ref="authorButton"
        class="a-authorBtn"
        :class="`${ classMods }`"
        :style="styleMods ? styleMods : ''"
        :href="href ? href : null"
        :aria-label="ariaLabel"
        :type="!href ? type : ''"
        @click="$emit('click', $event)"
    >
        {{ cta }}
        <slot />
    </component>
</template>

<script>
    export default {
        name: 'AuthorButton',
        props: {
            ariaLabel: {
                type: String,
                default: null
            },
            classMods: {
                type: String,
                default: ''
            },
            cta: {
                type: String,
                default: ''
            },
            href: {
                type: String,
                default: ''
            },
            styleMods: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'button'
            }
        }
    };
</script>
