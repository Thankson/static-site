<template>
    <div>
        <component
            :is="{ template: html }"
            v-if="hasHtml" />

        <slot v-else />
    </div>
</template>
<script>
    import { mapGetters, mapMutations } from 'vuex';

    export default {
        name: 'ProductDynamicSection',
        props: {
            sectionName: {
                type: String,
                default: 'about'
            }
        },
        data() {
            return {
                html: null
            };
        },
        computed: {
            ...mapGetters('productDetailPage', ['pdpHtml']),

            hasHtml() {
                return this.html !== null;
            },
            query() {
                return `product-dynamic-section[section-name=${this.sectionName}]`;
            }
        },
        watch: {
            pdpHtml() {
                this.setHtml();
            }
        },
        methods: {
            ...mapMutations('jumpLinks', ['SET_HAS_INGREDIENTS']),

            setHtml() {
                let html = '';
                console.log('query:', this.query, '\n', 'pdpHtml:', this.pdpHtml);
                // fragment not rendered by vue yet. grab by vue name and prop
                let fragment = this.pdpHtml?.querySelector(this.query);

                if(this.sectionName === 'ingredients') {
                    if(fragment) {
                        const hasContent = fragment.innerText?.trim() || fragment.querySelector('img');
                        this.SET_HAS_INGREDIENTS(!!hasContent);
                    }
                }

                html = fragment && fragment.innerHTML;

                this.html = html ? `<div>${html}</div>` : null;

                // not sure why this is needed, but it fixes an issue preventing certain sections from rendering on page load
                this.$nextTick(this.$forceUpdate());
            }
        }
    };
</script>
