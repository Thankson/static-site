<template>
    <div class="m-searchWithoutResult">
        {{ displayText }}
    </div>
</template>

<script>
    export default {
        props: {
            keywords: {
                type: String,
                default: ''
            },
            labels: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            displayText() {
                return (this.labels.NoSearchResultLabel || '').replace('{0}', this.keywords || '');
            }
        }
    };
</script>
