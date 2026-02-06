<template>
    <button
        class="a-button text-center justify-center px-40 -calendar"
        :style="{
            color: ctaTextColor,
            border: ctaBorderColor,
            backgroundColor: ctaBackgroundColor
        }"
        @click="onClickHandler"
    >
        <span class="pr-10">{{ calendarButtonLabel }}</span>
        <img class="m-fwBanner__img" :src="calendarImgSrc" aria-hidden="true" />
    </button>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'ACalendarButton',
        mixins: [ localizationMixin ],
        computed: {
            calendarImgSrc() {
                return this.getLocalizationProp('Data.CalendarImgSrc', '');
            },
            calendarButtonLabel() {
                return this.getLocalizationProp('Data.CalendarButtonLabel', 'Add to Calendar');
            },
            ctaBackgroundColor() {
                return this.getLocalizationProp('Data.CtaBackgroundColor', '#30862D');
            },
            ctaBorderColor() {
                return `1px solid ${this.getLocalizationProp('Data.CtaBorderColor', '#ffffff')}`;
            },
            ctaTextColor() {
                return this.getLocalizationProp('Data.CtaTextColor', '#ffffff');
            },
            fileName() {
                return `${this.getLocalizationProp('Data.EventTitle', 'event')}.ics`;
            },
            url() {
                return this.getLocalizationProp('Data.Link.Url');
            }
        },
        methods: {
            downloadFile(content) {
                var element = document.createElement('a');

                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
                element.setAttribute('download', this.fileName);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            },
            async onClickHandler() {
                try {
                    if(!this.url) return;

                    const response = await fetch(this.url);
                    const icsContent = await response.text();

                    this.downloadFile(icsContent);
                } catch (error) {
                    console.error('Error fetching calendar file:', error);
                }
            }

        }
    };
</script>
