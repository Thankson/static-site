<template>
    <li class="m-searchSuggest -bo">

        <!-- Suggestions CTAs | left column -->
        <div
            ref="suggestionCol"
            class="m-searchSuggest__actions"
            data-testid="container-searchSuggestions"
        >
            <button
                class="m-searchSuggest__btn"
                @click="searchBo"
                @keyup.esc="$emit('closeSuggestions')"
            >
                <span class="m-searchSuggest__term">
                    {{ termComp }}
                </span>
            </button>
        </div>
    </li>
</template>

<script>
    export default {
        name: 'MSearchSuggestBo',

        props: {
            item: {
                type: Object,
                default: () => {}
            }
        },

        computed: {
            termComp() {
                return this.item?.term;
            }
        },

        methods: {
            searchBo() {
                this.$emit('searchBo', this.termComp);
            }
        }
    };
</script>
