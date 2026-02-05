<template>
    <div class="m-errorCard" :class="mods">
        <span class="m-errorCard__text" v-html="text"></span>
        <button class="m-errorCard__button" type="button" @click="reloadPage">{{ reloadText }}</button>
    </div>
</template>
<script>
    export default {
        name: 'MErrorCard',
        props: {
            mods: {
                type: String,
                default: ''
            },
            reloadText: {
                type: String,
                required: true
            },
            text: {
                type: String,
                required: true
            }
        },
        methods: {
            reloadPage: function() {
                window.location.reload();
            }
        }
    };
</script>
