<template>
    <div class="m-couponReminder" :class="{ '-isActivated': hasReminderDate}">
        <h3 class="m-couponReminder__heading">
            <span class="m-couponReminder__splitHeading" role="text">
                <span class="m-couponReminder__title">{{ hasReminderDate ? topTileTitleActivated : topTileTitle }}</span>
                {{ hasReminderDate ? `${reminderDay} ${nextMonthAbbr}`: topTileSubtitle }}
            </span>
        </h3>
        <div class="m-couponReminder__media">
            <div class="m-couponReminder__action  -button">
                <button v-show="!hasReminderDate" class="a-button mx-auto block -white font-medium px-24 hover:border-white focus:border-white" type="button" @click="[changeReminderDate(), gtmTrackAction({ id: 179, text: selectDate}, $event)]">
                    {{ selectDate }}
                </button>
                <button v-show="hasReminderDate" class="a-button mx-auto block -white font-medium px-20" type="button" @click="[clearReminderDate(), gtmTrackAction({ id: 179, text: changeDate}, $event)]">
                    {{ changeDate }}
                </button>
            </div>
            <o-coupon-modal
                :labels="labels"
                :open-modal="openModal"
                :reminder-days="days"
                @closeModal="closeModal"
            ></o-coupon-modal>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        name: 'MCouponReminder',
        props: {
            changeDate: {
                type: String,
                default: ''
            },
            days: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            modalDescription: {
                type: String,
                default: ''
            },
            modalTitle: {
                type: String,
                default: ''
            },
            setDateText: {
                type: String,
                default: ''
            },
            selectDate: {
                type: String,
                default: ''
            },
            topTileTitle: {
                type: String,
                default: ''
            },
            topTileTitleActivated: {
                type: String,
                default: ''
            },
            topTileSubtitle: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                openModal: false,
                labels: {}
            };
        },
        computed: {
            ...mapState('coupon', ['hasReminderDate', 'reminderDay', 'nextMonthAbbr'])
        },
        mounted() {
            this.$nextTick(() => {
                this.labels = {
                    ModalTitle: this.modalTitle,
                    ModalText: this.modalDescription,
                    CtaText: this.setDateText,
                    SelectDate: this.selectDate
                };
            });
        },
        methods: {
            ...mapActions('coupon', ['setDate', 'getData', 'getReminderData', 'clearDate']),

            changeReminderDate() {
                this.openModal = true;
            },
            clearReminderDate() {
                this.clearDate();
                this.openModal = true;
            },
            closeModal() {
                this.openModal = false;
            }
        }
    };
</script>
