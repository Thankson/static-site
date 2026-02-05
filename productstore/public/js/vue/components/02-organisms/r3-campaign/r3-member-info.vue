<template>
    <div class="o-r3MemberInfo">
        <div class="o-r3MemberInfo__header">
            <div class="absolute left-10 -top-13">
                <a-icon-text-badge
                    class="o-r3MemberInfo__iconTextBadge"
                    :badge-text="getLocalizationProp('Data.MyTeamSectionLabel.Label')"
                    :badge-image="getLocalizationProp('Data.MyTeamSectionLabel.Image', {})"
                ></a-icon-text-badge>
            </div>

            <div class="text-center">
                <div class="inline-block mb-10">
                    <m-r3-logo
                        :image="getLocalizationProp('Data.CampaignLogo', {})"
                        :is-mid-logo="true"
                    ></m-r3-logo>
                </div>

                <div v-html="getLocalizationProp('Labels.Title')"></div>
                <div>
                    <span>{{ getLocalizationProp('Labels.TeamId') }}: </span><span>{{ getLocalizationProp('Labels.TeamId') }}</span>
                </div>
            </div>
        </div>

        <div class="o-r3MemberInfo__form mt-15">
            <p class="mt-15 font-semibold">{{ getLocalizationProp('Labels.FillYourInformation') }}</p>

            <div>
                <label class="o-r3MemberInfo__formLabel" for="name">{{ getLocalizationProp('Labels.Name') }}</label>
                <input
                    id="name"
                    class="o-r3MemberInfo__formInput mb-5"
                    type="text"
                    :placeholder="getLocalizationProp('Labels.NamePlaceholder')"
                />
            </div>
            <div>
                <label class="o-r3MemberInfo__formLabel" for="phoneNumber">{{ getLocalizationProp('Labels.PhoneNumber') }}</label>
                <input
                    id="phoneNumber"
                    class="o-r3MemberInfo__formInput mb-5"
                    type="text"
                    :placeholder="getLocalizationProp('Labels.PhoneNumberPlaceholder')"
                />
            </div>

            <div class="-ml-5 mt-5">
                <div v-for="(item) in terms" :key="item.Name">
                    <m-r3-term
                        :name="item.Name"
                        :checkbox-label="item.Content"
                        :checkbox-label-extend="item.Modals"
                    ></m-r3-term>
                </div>
            </div>

            <div class="mt-10">
                <v-button class="o-r3MemberInfo__submitButton">
                    {{ getLocalizationProp('Labels.Submit') }}
                </v-button>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import r3TermInfoMixin from '../../../mixins/r3-term-info';

    export default {
        name: 'OR3MemberInfo',
        mixins: [localizationMixin, r3TermInfoMixin]
    };
</script>
