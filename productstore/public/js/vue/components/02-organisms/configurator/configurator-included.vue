<template>
    <div class="o-configuratorAcc -noScroll">
        <div class="o-accordion -config">
            <div class="o-accordion__title">
                <div class="o-accordion__toggler -vue block cursor-default">
                    <p :id="titleId">{{ includedLabel }}</p>

                    <ul
                        class="mt-5"
                        :aria-labelledby="titleId">

                        <li
                            v-for="(includedConf, i) in includedConfigurations"
                            :key="i"
                            class="text-sm font-normal leading-tight"
                            :class="[{ 'sr-only': !isExpanded && i >= maxShown }, isCn ? 'not-italic' : 'italic']">

                            {{ includedConf.Title }}
                        </li>
                    </ul>

                    <button
                        v-if="hasShowMore"
                        class="text-sm text-green underline mt-10"
                        type="button"
                        aria-hidden="true"
                        @click="isExpanded = !isExpanded">

                        {{ isExpanded ? showLess : showMore }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'OConfiguratorIncluded',
        mixins: [ safeIdMixin ],
        safeIds: [
            'titleId'
        ],
        props: {
            includedConfigurations: {
                type: Array,
                default: () => []
            },
            includedLabel: {
                type: String,
                default: 'Includes: '
            },
            maxShown: {
                type: Number,
                default: 6
            },
            showLessLabel: {
                type: String,
                default: 'Show Less'
            },
            showMoreLabel: {
                type: String,
                default: 'Show More'
            }
        },
        data() {
            return {
                isExpanded: false,
                titleId: ''
            };
        },
        computed: {
            hasShowMore() {
                return this.includedConfigurations.length > this.maxShown;
            },
            showLess() {
                return this.showLessLabel || 'Show Less';
            },
            showMore() {
                return this.showMoreLabel || 'Show More';
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        }
    };
</script>
