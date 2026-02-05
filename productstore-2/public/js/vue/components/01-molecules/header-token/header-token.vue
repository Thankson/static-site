<template>
    <div v-html="rteToken"></div>
</template>

<script>
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    export default {
        name: 'MHeaderToken',
        props: {
            rte: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            }
        },
        computed: {
            rteToken() {
                return replaceToken(this.rte, this.title);
            }
        }
    };
</script>
