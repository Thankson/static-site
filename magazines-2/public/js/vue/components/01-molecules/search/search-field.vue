<template>
    <div class="m-searchField">
        {{ displayText }}
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'MSearchField',
        props: {
            labels: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            ...mapState('searchList', ['searchParams']),
            keywords() {
                return this.searchParams?.keywords || '';
            },
            displayText() {
                return (this.labels.SearchResultLabel || '').replace('{0}', this.keywords);
            }
        }
    };
</script>
