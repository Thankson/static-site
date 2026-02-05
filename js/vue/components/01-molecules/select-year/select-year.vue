<template>
    <div class="m-selectYear" :class="isShow ? '-isOpen' :'' ">
        <div
            class="m-selectYear__field"
            @click="openValue"
        >
            {{ currentYear }}
            <span aria-hidden="true" class="a-arrow -sm -filled w-0 h-0 absolute right-15 top-18 pointer-events-none -selectYear" :class="arrowDirection">
                <span class="a-arrow__icon border-black"></span>
            </span>
        </div>
        <ul v-show="isShow" class="m-selectYear__option">
            <li v-for="year in years" :key="year" class="m-selectYear__item" :class="year == currentYear ? '-active' :'' " @click="setYear(year);">{{ year }}</li>
        </ul>
        <input type="hidden" :value="currentValue" />
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'MSelectYear',
        mixins: [ safeId ],
        safeIds: [
            'selectYearId'
        ],
        props: {
            years: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            currentYear: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                currentValue: this.currentYear ? this.currentYear : this.years[0],
                arrowDirection: '-down',
                isShow: false
            };
        },
        methods: {
            setYear(newVal) {
                this.currentValue = newVal;
                this.$emit('selectedYear', this.currentValue);
                this.isShow = false;
                this.arrowDirection = '-down';
            },
            openValue() {
                if(this.isShow) {
                    this.isShow = false;
                    this.arrowDirection = '-down';
                } else {
                    this.isShow = true;
                    this.arrowDirection = '-up';
                }
            }
        }
    };
</script>
