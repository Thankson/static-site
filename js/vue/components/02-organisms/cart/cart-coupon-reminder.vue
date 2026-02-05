<template>
    <article class="o-cartCounponReminder">
        <div v-if="loadingReminder" class="o-cartCounponReminder__loading -reminder">
            <a-loading-spinner :visible="loadingReminder" size="sm" />
        </div>
        <span v-else-if="showResponse" class="o-cartCounponReminder__text">
            <span v-html="responseText"></span>
            <button class="o-cartCounponReminder__link" type="button" @click="clearReminder">{{ labels.ResetText }}</button>
        </span>
        <span v-else class="o-cartCounponReminder__text">
            {{ labels.ReminderText }}
            <button class="o-cartCounponReminder__link" type="button" @click="[openReminder(), gtmTrackAction({id: 214}, $event)]">{{ labels.ReminderButton }}</button>
        </span>
        <o-coupon-modal
            :labels="labels"
            :open-modal="openModal"
            :reminder-days="reminderDays"
            @setReminderDate="setReminderDate"
            @closeModal="closeModal"
        ></o-coupon-modal>
    </article>
</template>
<script>
    import resetApi from '@api/routes/coupons/clearreminder';
    import { mapActions, mapMutations } from 'vuex';

    export default {
        name: 'OCartCouponReminder',
        props: {
            labels: {
                type: Object,
                default: () => ({})
            },
            reminderDays: {
                type: Array,
                default: () => ([])
            }
        },
        data() {
            return {
                loadingReminder: false,
                openModal: false,
                reminderDate: '',
                responseText: '',
                showResponse: false
            };
        },
        methods: {
            ...mapActions('coupon', ['getData']),
            ...mapMutations('coupon', ['DELETE_REMINDER_DATE']),
            clearReminder: async function() {
                if(this.loadingReminder) {
                    return;
                }
                this.loadingReminder = true;
                const response = await resetApi.delete();
                if(response.success) {
                    this.showResponse = false;
                    this.loadingReminder = false;
                    this.$emit('update', true);
                    this.DELETE_REMINDER_DATE();
                }
            },
            closeModal() {
                this.openModal = false;
            },
            openReminder: function() {
                this.openModal = true;
            },
            setReminderDate: function(responseDay) {
                if(responseDay) {
                    this.responseText = this.labels.SuccessText.replace('{0}', responseDay);
                    this.showResponse = true;
                    this.getData();
                }
            }
        }
    };
</script>
