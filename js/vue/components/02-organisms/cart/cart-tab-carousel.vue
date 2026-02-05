<template>
    <section>
        <o-tabs
            v-if="cartTabs.length > 0"
            ref="cartTab"
            :tabs="cartTabs"
            @set-active="setActive" />
        <div v-for="(tab, idx) in cartTabs" v-show="idx === activeTab" :id="'tab-'+idx" :key="idx">
            <slot :name="tab.SlotName" />
        </div>

    </section>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import eventBus from '@common/source/js/vue/mixins/event-bus';
    export default {
        name: 'OCartTabCarousel',
        mixins: [localizationMixin],
        data() {
            return {
                activeTab: 0,
                breakOut: false,
                tabs: null
            };
        },
        computed: {
            cartTabs() {
                return this.tabs || this.getLocalizationProp('Data.CartTabs', []);
            }
        },
        created() {
            let _this = this;
            eventBus.$on('loadedCarousel', (e) => {
                if(e.idx && e.prods.length <= 0) {
                    let idx = e.idx.split('-')[1];
                    let cartTabs = [..._this.cartTabs];
                    cartTabs[idx].hidden = true;
                    if(_this.activeTab === idx) {
                        _this.activeTab = cartTabs.findIndex(t => !t.hidden);
                    }
                    _this.tabs = cartTabs;
                }
            });
        },
        methods: {
            setActive: function(value) {
                this.activeTab = value;
                const tab = document.querySelectorAll(`.m-tabs__list button`)[value];
                if(tab) {
                    tab.focus();
                }
            },
            activeCurTab: function(val) {
                this.$refs.cartTab.selectTab(val);
            }
        }
    };
</script>
