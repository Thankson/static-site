<template>
    <div class="m-receiptCoupon">
        <div v-if="showCouponReminder" class="m-receiptCoupon__wrapper -notSet">
            <div class="m-receiptCoupon__rte m-rte" v-html="labels.RteText"></div>
            <div class="m-receiptCoupon__form">
                <v-select
                    id="reminderDate"
                    ref="reminderDateSelect"
                    :options="selectOptionsLabels"
                    aria-label="Select Date"
                    :hidden-first="true"
                    select-element-mod="uppercase"
                    select-mod="-coupon -center -rounded -padding-xl -hidden-first"
                    arrow-tailwind-color="black"
                    arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-18"
                    @change="updateModel"
                />
                <button
                    :class="['a-button -medium -center md:ml-16 to-md:my-16', {'-disabled': disableButton || isLoading}]"
                    :aria-disabled="String(disableButton)"
                    @click="setReminderDate"
                >
                    {{ labels.CtaText }}
                </button>
                <div class="m-receiptCoupon__loading">
                    <a-loading-spinner size="sm" :visible="isLoading" />
                </div>
            </div>
        </div>
        <div v-else-if="showResponse" class="m-receiptCoupon__wrapper -set" role="alert">
            <div class="m-receiptCoupon__text" role="text" v-html="reminderDayText()">
            </div>
            <button class="m-receiptCoupon__text -green" @click="clearReminderDate">
                {{ labels.ClearText }}
            </button>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MReceiptCouponReminder',
        mixins: [ localizationMixin ],
        data() {
            return {
                disableButton: true,
                reminderDate: '',
                showResponse: false,
                labels: {},
                reminderDays: []
            };
        },
        computed: {
            ...mapState('coupon', ['isLoading', 'hasReminderDate', 'reminderDay', 'reminderDaySuffix', 'userFlags']),
            reminderDates() {
                if(!this.reminderDays.length) {
                    return [];
                }
                const dates = [];
                dates.push({Label: this.labels.SelectLabelText, Value: null});
                this.reminderDays.forEach(day => {
                    dates.push({Label: day, Value: day});
                });
                return dates;
            },
            selectOptionsLabels: function() {
                if(!this.reminderDays.length) {
                    return '';
                }
                let labels = '';
                if(this.reminderDates) {
                    this.reminderDates.forEach(option => {
                        labels += option.Label + ',';
                    });
                }
                return labels;
            },
            showCouponReminder: function() {
                return this.hasReminderDate === false && this.reminderDays.length && !this.userFlags?.IsGuest;
            }
        },
        mounted() {
            this.labels = this.getLocalizationProp('Labels');
            this.reminderDays = this.getLocalizationProp('Data.ReminderDays');
            this.getData();
        },
        methods: {
            ...mapActions('coupon', ['getData', 'setDate', 'clearDate']),
            clearReminderDate: async function() {
                await this.clearDate();
                this.showResponse = false;
                document.querySelector('#reminderDate').focus();
            },
            replaceToken,
            reminderDayText() {
                return replaceToken(this.labels.ShoppingReminderTextPost, `${this.reminderDay}${this.reminderDaySuffix}`);
            },
            setReminderDate: async function() {
                if(this.disableButton || this.isLoading) {
                    return;
                }
                await this.setDate(this.reminderDate);
                this.showResponse = true;
            },
            updateModel: function() {
                this.reminderDate = this.$refs['reminderDateSelect']?.selectedVal;
                if(this.reminderDate > 0) {
                    this.disableButton = false;
                }
            }
        }
    };
</script>
