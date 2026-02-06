<template>
    <div class="m-tabs">
        <div role="tablist" class="m-tabs__list">
            <button
                v-for="(tab, index) in tabs"
                :key="tab.Title + index"
                :hidden="tab.hidden"
                class="m-tabs__tab"
                role="tab"
                :aria-controls="`${tab.Type || tab.Title}-tab`"
                :class="[{ '-isActive': index == selectedIndex , '-isCn' : isCn, '-simplifiedTabStyle': showSimplifiedTabs }, tabClasses]"
                @click="[selectTab(index), gtmTrackAction({id: 459, text: tab.Title}, $event)]"
            >
                <span class="m-tabs__link" :class="[{ '-isActive': index == selectedIndex, '-simplifiedTabStyle': showSimplifiedTabs }, tabClasses]">{{ tab.Title }}</span>
                <span v-if="!showSimplifiedTabs" class="m-tabs__arrow" aria-hidden="true"></span>
            </button>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'OTabs',
        props: {
            updateTitle: {
                type: String,
                default: ''
            },
            tabs: {
                type: Array,
                default: () => []
            },
            showSimplifiedTabs: {
                type: Boolean,
                default: false
            },
            tabClasses: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                selectedIndex: 0
            };
        },
        computed: {
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            updateTitle() {
            },
            tabs(newVal) {
                let idx = newVal.findIndex(t => t.hidden);
                if(idx === this.selectedIndex && this.isCn) {
                    this.selectedIndex = newVal.findIndex(t => !t.hidden);
                }
            }
        },
        mounted () {
            this.selectTab(0);
        },
        methods: {
            selectTab: function(index) {
                this.selectedIndex = index;
                this.$emit('set-active', this.selectedIndex);
            }
        }
    };
</script>
