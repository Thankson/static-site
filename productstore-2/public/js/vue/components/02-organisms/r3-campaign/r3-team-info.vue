<template>
    <div class="o-r3TeamInfo">
        <div class="o-r3TeamInfo__slogan">
            <div class="o-r3TeamInfo__sloganContent" v-html="getLocalizationProp('Data.SloganRichText')"></div>
        </div>

        <div class="o-r3TeamInfo__form">
            <div class="absolute left-10 -top-13">
                <a-icon-text-badge
                    class="o-r3TeamInfo__iconTextBadge"
                    :badge-text="getLocalizationProp('Data.MyTeamSectionLabel.Label')"
                    :badge-image="getLocalizationProp('Data.MyTeamSectionLabel.Image', {})"
                ></a-icon-text-badge>
            </div>

            <div>
                <label class="o-r3TeamInfo__formLabel" for="teamLeader">{{ getLocalizationProp('Labels.TeamLeader') }}</label>
                <input
                    id="teamLeader"
                    class="o-r3TeamInfo__formInput mb-5"
                    type="text"
                    :placeholder="getLocalizationProp('Labels.TeamLeaderPlaceholder')"
                />
            </div>

            <div>
                <label class="o-r3TeamInfo__formLabel" for="teamName">{{ getLocalizationProp('Labels.TeamName') }}</label>
                <input
                    id="teamName"
                    class="o-r3TeamInfo__formInput mb-5"
                    type="text"
                    :placeholder="getLocalizationProp('Labels.TeamNamePlaceholder')"
                />
            </div>

            <div class="mt-30">{{ getLocalizationProp('Labels.CreateTip') }}</div>
            <div class="-ml-5">
                <div v-for="(item) in terms" :key="item.Name">
                    <m-r3-term
                        :name="item.Name"
                        :checkbox-label="item.Content"
                        :checkbox-label-extend="item.Modals"
                    ></m-r3-term>
                </div>
            </div>

            <div class="mt-10">
                <v-button class="o-r3TeamInfo__submitButton">
                    {{ getLocalizationProp('Labels.ConfirmCreate') }}
                </v-button>
            </div>
        </div>

    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import r3TermInfoMixin from '../../../mixins/r3-term-info';

    export default {
        name: 'OR3TeamInfo',
        mixins: [localizationMixin, r3TermInfoMixin]
    };
</script>
