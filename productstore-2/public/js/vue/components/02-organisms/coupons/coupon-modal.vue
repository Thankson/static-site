<template>
    <modal
        id="coupon-reminder"
        heading-class="text-4xl leading-tight px-30 md:px-0 md:leading-base md:text-2xl md:font-bold -mt-10"
        class="o-couponModal"
        :will-hide="hideModal">
        <template v-slot:heading>
            {{ labels.ModalTitle }}
        </template>

        <template v-slot:body>
            <div class="o-couponModal__description" v-html="labels.ModalText"></div>
        </template>

        <template v-slot:footer>
            <div class="o-couponModal__footer">
                <v-select
                    v-if="showDropdown"
                    id="reminderDate"
                    ref="reminderDateSelect"
                    :options="selectOptionsLabels(reminderDates)"
                    aria-label="Select Date"
                    :hidden-first="true"
                    select-element-mod="uppercase bg-white"
                    select-mod="-coupon -rounded -padding-xl -hidden-first"
                    arrow-tailwind-color="black"
                    arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-18"
                    @change="updateModel($event)"
                />
                <button
                    v-if="showDropdown"
                    :class="['o-couponModal__button a-button -medium -center md:ml-16', {
                        '-disabled': disableButton,
                        '-disabled-white': disableButton
                    }]"
                    @click="[setReminderDate(), gtmTrackAction({id: 178, text: labels.CtaText}, $event)]">
                    {{ labels.CtaText }}
                </button>
                <div class="o-couponModal__loading">
                    <a-loading-spinner :visible="loadingModal" size="sm" />
                </div>
            </div>
        </template>
    </modal>
</template>
<script>
    import api from '@api/routes/coupons/reminder';
    import { mapMutations } from 'vuex';

    export default {
        name: 'OCouponModal',
        props: {
            labels: {
                type: Object,
                default: () => ({})
            },
            openModal: {
                type: Boolean,
                default: false
            },
            reminderDays: {
                type: Array,
                default: () => ([])
            }
        },
        data() {
            return {
                disableButton: true,
                loadingModal: false,
                showDropdown: false
            };
        },
        computed: {
            reminderDates() {
                const dates = [];
                dates.push({Label: this.labels.SelectDate || 'Select Date', Value: null});

                this.reminderDays.forEach(day => {
                    dates.push({Label: day, Value: day});
                });

                return dates;
            }
        },
        watch: {
            openModal(val) {
                if(val) {
                    this.$modal.show({id: 'coupon-reminder'});
                    this.showDropdown = true;
                } else {
                    this.$modal.hide({id: 'coupon-reminder'});
                    this.showDropdown = false;
                }
            }
        },
        methods: {
            ...mapMutations('coupon', ['SET_REMINDER_DATE']),
            hideModal: function() {
                this.$emit('closeModal');
                this.disableButton = true;
                return true;
            },
            selectOptionsLabels: function(selectOptions) {
                let labels = '';

                if(selectOptions) {
                    selectOptions.map(option => {
                        labels += option.Label + ',';
                    });
                }

                return labels;
            },
            setReminderDate: async function() {
                if(this.disableButton || this.loadingModal) {
                    return;
                }
                this.loadingModal = true;
                const response = await api.post({ReminderDate: this.reminderDate});
                if(response.success) {
                    this.loadingModal = false;
                    this.SET_REMINDER_DATE(response.data?.Data);
                    this.$emit('setReminderDate', response?.data?.Data?.ReminderDay + response?.data?.Data?.ReminderDaySuffix);
                    this.$modal.hide({id: 'coupon-reminder'});
                    this.showDropdown = false;
                    this.disableButton = true;
                    this.reminderDate = null;
                }
            },
            updateModel: function(event) {
                this.reminderDate = this.$refs['reminderDateSelect']?.selectedVal;
                if(this.reminderDate > 0) {
                    this.disableButton = false;
                }

                const firstValue = this.selectOptionsLabels(this.reminderDates).split(',')[0];
                if(event.value !== firstValue) {
                    this.gtmTrackAction({id: 233, text: event.value}, event);
                }
            }
        }
    };
</script>
