<template>
    <!-- CTA -->
    <button
        ref="callFlowBtn"
        class="o-videoModalButton"
        :data-index="dataIndex"
        :tabindex="tabIndex"
        :aria-hidden="ariaHidden"
        v-on:click.prevent.stop="openModal($event, true); triggerDataLayer($event);"
    >
        <!-- Slot for custom button styles/icons/content -->
        <slot />

        <!-- Virtual modal -->
        <modal id="modal-video" :will-hide="willHideModal">
            <template v-slot:default>
                <!-- Learn to Earn Flow -->
                <o-lte-vid-flow
                    v-if="hasLTE"
                    :id="id"
                    ref="vidL2eFlow"
                    :amount-formatted="amountFormattedComp"
                    :amount-value="amountValueComp"
                    :has-reset="hasReset"
                    :is-new="isNew"
                    :is-watched="isWatched"
                    :lte="lte"
                    :localization="localization"
                    modal-target="modal-video"
                    :quiz="quizComp"
                    :video-data="videoData"
                    :prevent-seek="preventSeek"
                    :allow-seek="allowSeek"
                    v-on:changeModalSize="changeModalSize"
                    v-on:setShouldHideModal="setShouldHideModal"
                    v-on:setShouldNotHideModal="setShouldNotHideModal"
                >
                </o-lte-vid-flow>

                <!-- Regular Video Flow -->
                <o-video-reg-flow
                    v-else
                    :id="videoData.MediaId"
                    ref="vidRegFlow"
                    :has-reset="hasReset"
                    :is-watched="isWatched"
                    :localization="localization"
                    :video-data="videoData"
                    :video-item-id="id"
                    :is-regular-flow="true"
                    @videoWatched="handleVideoWatchedStatus"
                >
                </o-video-reg-flow>
            </template>
        </modal>
    </button>
</template>

<script>
    import videoModal from '../../../mixins/video-modal';

    export default {
        name: 'OVideoModalButton',

        mixins: [ videoModal ],
        methods: {
            handleVideoWatchedStatus(val) {
                this.$emit('videoWatched', val);
            },
            triggerDataLayer() {
                this.$emit('data-layer-push', 'CTA');
                this.$emit('cl-track');
            }
        }
    };
</script>
