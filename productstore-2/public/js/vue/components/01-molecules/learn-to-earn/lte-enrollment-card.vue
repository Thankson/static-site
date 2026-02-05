<template>
    <article class="m-lteEnrollmentCard">
        <div class="m-lteEnrollmentCard__text" v-html="getLocalizationProp('Data.PanelContent')"></div>
        <a
            v-if="getLocalizationProp('Data.ButtonLink')"
            class="a-button -full py-15 text-base font-medium leading-tight md:py-10 text-center"
            :href="getLocalizationProp('Data.ButtonLink.Url')"
        >
            {{ getLocalizationProp('Data.ButtonLink.Text') }}
        </a>
        <button
            v-else
            class="a-button -full py-15 text-base font-medium leading-tight md:py-10"
            :aria-label="getLocalizationProp('Data.ButtonAriaLabel')"
            @click="submit"
        >
            {{ getLocalizationProp('Data.ButtonText') }}
        </button>
    </article>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import preComponentLoader from '@common/source/js/vue/mixins/pre-component-loader';
    import api from '@api/routes/learntoearn/transition';

    export default {
        name: 'MLteEnrollmentCard',
        mixins: [ localizationMixin, preComponentLoader ],
        mounted() {
            this.unsetPreComponentLoader();
        },
        methods: {
            submit: async function() {
                const headers = {'Content-Type': 'application/json; charset=utf-8'};
                const response = await api.post({CurrentProgram: this.getLocalizationProp('Data.CurrentProgram') || 'GrandFather'}, {headers: headers});
                if(response.success) {
                    window.location.href = response?.data?.Data?.RedirectPath;
                }
            }
        }
    };
</script>
