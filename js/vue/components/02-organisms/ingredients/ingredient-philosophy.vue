<template>
    <div class="o-ingredPhilosophy" :style="{ backgroundColor: bgColor }">
        <div class="o-ingredPhilosophy__wrapper">
            <!-- Title -->
            <h2 class="o-ingredPhilosophy__title -main" v-html="getLocalizationProp('Data.Title')"></h2>

            <!-- List of items -->
            <ul v-if="columns && columns.length" ref="ingrPhilList" class="o-ingredPhilosophy__list">
                <li
                    v-for="(column, index) in columns"
                    :key="index"
                    class="o-ingredPhilosophy__item"
                    :class="{'-active': index === activeAccordion}">
                    <div :ref="'ingrPhilInfoRef' + index" class="o-ingredPhilosophy__info">
                        <!-- Image -->
                        <img
                            v-if="column.Image && column.Image.Url"
                            class="o-ingredPhilosophy__img"
                            :src="column.Image.Url"
                            :alt="column.Image.Alt" />

                        <!-- Title -->
                        <h3 class="o-ingredPhilosophy__title" v-html="column.Heading"></h3>

                        <!-- Subtitle -->
                        <p class="o-ingredPhilosophy__subtitle" :class="{'-isCn' : isCn}" v-html="column.SubHeading"></p>
                    </div>

                    <!-- RTE Accordion (optional) -->
                    <accordion
                        v-if="column.RTE"
                        :ref="'ingrPhilRef' + index"
                        class="-ingredPhilosophy"
                        :title="column.isOpen ? column.CollapseAction : column.ExpandAction"
                        title-el="p"
                        :content-id="'ingrPhilContent' + index"
                        :toggle-id="'ingrPhilToggle' + index"
                        :aria-label="column.ButtonAriaLabel ? buttonAriaLabel(column) : null"
                        @show="[onShow(index), gtmTrackAction({id: 456, text: textGtmMoreAction(column)}, $event)]"
                        @hide="onHide(index)">

                        <template v-slot:icon></template>

                        <div class="o-ingredPhilosophy__content">
                            <!-- Close Icon -->
                            <a-close-x class="o-ingredPhilosophy__icon" @click="closeAccordion(true)" />

                            <!-- RTE -->
                            <div class="m-rte" v-html="column.RTE"></div>
                        </div>
                    </accordion>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OIngredPhilosophy',
        mixins: [ localizationMixin ],
        data() {
            return {
                activeAccordion: null,
                accordionWidth: null,
                viewportWidth: 0
            };
        },
        computed: {
            bgColor() {
                return this.localization?.Data?.BgColor || '#002E1C';
            },
            columns() {
                let columns = [];

                if(this.localization?.Data?.Columns) {
                    columns = this.localization.Data.Columns.slice(0, 4);
                }

                return columns;
            },
            isCn: function () {
                return this.$env?.IsCn || false;
            },
            isMobile() {
                return this.viewportWidth < 768;
            }
        },
        watch: {
            accordionWidth(newValue, oldValue) {
                // Necessary to fix accordion width when the window creates a scrollbar
                setTimeout(() => {
                    const container = this.$refs['ingrPhilList'];

                    if(container && container.offsetWidth !== newValue) {
                        this.resetAccordion();
                    }
                }, 100);
            }
        },
        created() {
            this.setViewport();

            window.addEventListener('resize', this.resize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },
        methods: {
            replaceTokenArray,
            buttonAriaLabel(column) {
                if(column.isOpen) {
                    return this.replaceTokenArray(column.ButtonAriaLabel, [column.CollapseAction, column.Heading]);
                }
                return this.replaceTokenArray(column.ButtonAriaLabel, [column.ExpandAction, column.Heading]);
            },
            closeAccordion(closeActive) {
                let col = null;

                if(closeActive) {
                    col = `ingrPhilRef${this.activeAccordion}`;

                    if(this.$refs[col] && this.$refs[col][0] && this.$refs[col][0].isOpened) {
                        this.triggerCloseAccordion(this.$refs[col][0]);
                    }
                } else {
                    for (let i = 0; i < this.columns.length; i++) {
                        col = `ingrPhilRef${i}`;

                        if(i !== this.activeAccordion && this.$refs[col] && this.$refs[col][0] && this.$refs[col][0].isOpened) {
                            this.triggerCloseAccordion(this.$refs[col][0]);
                        }
                    }
                }
            },

            onHide(index) {
                this.$set(this.localization.Data.Columns[index], 'isOpen', false);
            },
            onShow(index) {
                this.activeAccordion = index;

                this.$set(this.localization.Data.Columns[index], 'isOpen', true);

                this.closeAccordion();

                this.resetAccordion();

                this.accordionWidth = 0;

                if(this.isCn) {
                    this.$nextTick(() => document.getElementsByClassName('-open')[0].scrollIntoView());
                }
            },
            resetAccordionTop(start, end) {
                const infoCurrent = this.$refs[`ingrPhilInfoRef${this.activeAccordion}`];
                let top = 0;
                let col = null;
                let biggest = 0;
                let info = null;
                let infoDiff = null;

                for (let i = start; i <= end; i++) {
                    col = this.$refs[`ingrPhilRef${i}`];
                    info = this.$refs[`ingrPhilInfoRef${i}`];

                    if(col && col[0] && info && info[0] && col[0].$el.offsetTop > biggest) {
                        biggest = col[0].$el.offsetTop;
                        infoDiff = info[0].offsetHeight - infoCurrent[0].offsetHeight;
                        if(infoDiff) top = infoDiff; else top = 10;
                    }
                }

                return top;
            },
            resetAccordionDesktop(colWidth, gap) {
                let top = 0;
                let left = 0;

                // Set top position for accordion content
                top = this.resetAccordionTop(0, this.columns.length - 1);

                // Set left position for accordion content
                if(this.activeAccordion > 0) left = -Math.abs((colWidth * this.activeAccordion) + (gap * this.activeAccordion));

                return { top: top, left: left };
            },
            resetAccordionTablet(colWidth, gap) {
                let top = 0;
                let left = 0;
                let start = 0;
                let end = 1;

                if(this.activeAccordion > 1) {
                    start = 2;
                    end = 3;
                }

                // Set top position for accordion content
                top = this.resetAccordionTop(start, end);

                // Set left position for accordion content
                if(this.activeAccordion % 2 === 0) left = 0; else left = -Math.abs(colWidth + gap);

                return { top: top, left: left};
            },
            resetAccordion() {
                try {
                    const accordion = this.$refs[`ingrPhilRef${this.activeAccordion}`];

                    if(this.activeAccordion > -1 && accordion && accordion[0] && accordion[0]?.$refs['content']) {
                        // If Tablet or Desktop
                        if(!this.isMobile) {
                            const container = this.$refs['ingrPhilList'];
                            const gap = this.viewportWidth <= 991 ? 15 : 30;
                            let offset = {
                                top: 0,
                                left: 0,
                                arrow: 0
                            };

                            if(container) {
                                // Set accordion width
                                this.accordionWidth = container.offsetWidth;

                                // Set column width
                                const colWidth = accordion[0].$el.parentElement.offsetWidth;

                                // Tablet (2 columns)
                                if(this.viewportWidth <= 991) {
                                    offset = this.resetAccordionTablet(colWidth, gap);

                                // Desktop (4 columns)
                                } else {
                                    offset = this.resetAccordionDesktop(colWidth, gap);
                                }

                                // Apply style on accordion content
                                accordion[0].$refs['content'].style.width = this.accordionWidth + 'px';
                                accordion[0].$refs['content'].style.left = offset.left + 'px';
                                accordion[0].$refs['content'].style.marginTop = offset.top + (offset.top > 0 ? 'px' : '');

                                // Set arrow left position
                                offset.arrow = offset.left < 0 ? offset.left * -1 : 0;
                                accordion[0].$refs['content'].style.setProperty('--ingredPhilArrowLeft', offset.arrow + 'px');
                            }
                        // If Mobile
                        } else {
                            // Apply style on accordion content
                            accordion[0].$refs['content'].style.width = 'initial';
                            accordion[0].$refs['content'].style.left = '0px';
                            accordion[0].$refs['content'].style.marginTop = '60px';

                            // Set arrow left position
                            accordion[0].$refs['content'].style.setProperty('--ingredPhilArrowLeft', '0px');
                        }
                    }
                } catch (e) {
                    console.log('[IngredientPhilosophy] ResetAccordion - Exception:');
                    console.log(e);
                }
            },
            resize() {
                this.setViewport();

                this.resetAccordion();
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            },
            textGtmMoreAction(column) {
                if(column.ButtonAriaLabel && column.isOpen) {
                    return this.replaceTokenArray(column.ButtonAriaLabel, [column.ExpandAction, column.Heading]);
                }
                return '';
            },
            triggerCloseAccordion(accordion) {
                if(accordion.$refs['accordionButton']) {
                    accordion.$refs['accordionButton'].click();
                }
            }
        }
    };
</script>
