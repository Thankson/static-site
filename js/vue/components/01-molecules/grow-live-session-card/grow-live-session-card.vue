<template>
    <li class="m-growLiveSessionCard mb-20">
        <ALoadingSpinner
            v-if="!liveSessionData"
            :visible="true"
            size="lg"
            mods="center"
        />
        <div v-else class="m-growLiveSessionCard__wrapper border py-24 pl-18 pr-24 flex flex-col items-center justify-center text-center bg-white md:flex-row md:justify-between md:text-left" :style="componentStyle">
            <div class="flex flex-col mb-18 md:flex-row md:mb-0">
                <p
                    class="text-sm text-gray-120 font-bold leading-relaxed md:mr-32 md:pr-2"
                    :style="{ color: activeButtonState.EventTimeColor }">
                    {{ eventTime }}
                </p>
                <div class="m-growLiveSessionCard__session mt-2 md:mt-0">
                    <h3
                        class="m-growLiveSessionCard__sessionTitle text-lg font-bold uppercase"
                        :style="{ color: activeButtonState.TextColor }">
                        {{ activeButtonState.Title }}
                    </h3>
                    <p
                        class="text-sm text-gray-120 italic md:mt-2"
                        :style="{ color: activeButtonState.SubTextColor }">
                        {{ activeButtonState.Description }}
                    </p>
                </div>
            </div>
            <v-button
                class="m-growLiveSessionCard__cta py-12 h-40 text-white px-16 border"
                :class="[`-${activeButtonType}`,{ [`hover:bg-${buttonData.HoverColor}`]: !!buttonData.HoverColor }]"
                v-bind="activeButtonState.Link ? { href: activeButtonState.Link } : {}"
                :is-anchor="!!activeButtonState.Link"
                :style="buttonStyle"
                @mouseenter="isHovered = true"
                @mouseleave="isHovered = false">
                <span class="flex space-x-8 items-center" v-html="buttonData.ButtonText" />
            </v-button>
        </div>
    </li>

</template>

<script>
    import ALoadingSpinner from '@common/source/js/vue/components/00-atoms/loading-spinner/loading-spinner.vue';
    import liveSessionMixin from '../../../mixins/live-session';

    export default {
        name: 'MGrowLiveSessionCard',
        components: { ALoadingSpinner },
        mixins: [liveSessionMixin],
        data() {
            return {
                isHovered: false
            };
        },
        computed: {
            buttonStyle() {
                const style = {
                    color: this.buttonData.TextColor,
                    borderColor: this.buttonData.BorderColor
                };

                if(!this.isHovered && this.buttonData.BackgroundColor) {
                    style.backgroundColor = this.buttonData.BackgroundColor;
                }

                return style;
            },
            componentStyle() {
                return {
                    borderColor: this.activeButtonState?.BorderColor,
                    backgroundColor: this.activeButtonState?.BackgroundColor
                };
            }
        }
    };
</script>
