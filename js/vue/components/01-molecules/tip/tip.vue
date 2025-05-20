<template>
    <p class="m-tip" :class="`-${type}`">
        <span
            class="m-tip__icon font-material"
            aria-hidden="true"
        >
            error_outline
        </span>
        <span class="m-tip__text" role="text" v-html="text">
        </span>
    </p>
</template>

<script>
    export default {
        name: 'MTip',
        props: {
            text: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'info'
            }
        }
    };
</script>
