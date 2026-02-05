<template>
    <div class="m-growMonthFilter md:w-1_2">
        <v-select
            id="monthFilter"
            ref="monthFilter"
            class="m-growMonthFilter__select"
            select-mod="-sm-md -padding-md"
            :options="monthOptions"
            :initial="initialMonth"
            :arrow-other-mods="'absolute -filled right-15 top-16 pointer-events-none'"
            data-testid="growMonthFilter"
            @change="onMonthChange"
        >
        </v-select>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import IS_PAGE_EDITOR from '@common/source/js/utils/check-ee';

    export default {
        name: 'MGrowMonthFilter',
        mixins: [localizationMixin],
        data() {
            return {
                selectedMonth: ''
            };
        },
        computed: {
            months() {
                return this.getLocalizationProp('Data.Months', []).filter(month => !!month.Link);
            },
            monthOptions() {
                return this.months.map(month => month.Title);
            },
            isEditorMode() {
                return IS_PAGE_EDITOR() || window.location.host.includes('localhost');
            },
            initialMonth() {
                if(!this.months.length > 0) return '';

                const initMonthDetails = this.months.find(month => month.Selected === true);
                return initMonthDetails ? initMonthDetails.Title : this.months[0].Title;
            }
        },
        methods: {
            /**
             * Checks if the provided link is valid and focus to the jump link element
             */
            focusToJumpLink(link) {
                const elementId = link.slice(1);
                const element = document.getElementById(elementId);

                if(!element) return;

                element.scrollIntoView({ behavior: 'smooth' });
                window.location.hash = link;
            },
            /**
             * Changes the current route and programmatically navigate to a different route within the application
             */
            navigateToLink(link) {
                if(!link) return;
                window.location.href = link;
            },
            /**
             * Listens to the change event in the months dropdown and handles navigation or scrolling based on the selected month's link
             */
            onMonthChange(selected) {
                if(this.isEditorMode) {
                    return;
                }

                this.selectedMonth = selected?.value ?? '';
                if(this.selectedMonth === this.initialMonth) {
                    return;
                }
                const selectedMonthDetails = this.months.find(month => month.Title === this.selectedMonth);

                // If the selected month link is the same as the current page, do nothing
                if(selectedMonthDetails?.Link === window.location.pathname) {
                    return;
                }

                if(selectedMonthDetails?.Link) {
                    if(selectedMonthDetails?.Link.startsWith('#')) {
                        this.focusToJumpLink(selectedMonthDetails.Link);
                    } else {
                        this.navigateToLink(selectedMonthDetails.Link);
                    }
                }
            }
        }
    };
</script>
