<template>
    <div
        class="m-navMenuUser"
        aria-live="polite">

        <a-loading-spinner
            v-if="loading"
            class="inline-block"
            size="sm"
            sr-text="Loading Profile Info"
            :visible="true" />

        <template v-else-if="isAuthenticated">
            <template v-if="!isCn">
                <div
                    v-if="firstName"
                    class="m-navMenuUser__greeting"
                    :class="{ 'mb-20' : !showInfo }">

                    {{ greeting }}
                </div>

                <div
                    v-if="showInfo"
                    class="m-navMenuUser__info">

                    <div v-if="showMarketingExecutiveTitle">
                        {{ formattedStatus }}
                    </div>
                    <template v-if="!IsGrowUser">
                        <div v-if="showVip" class="inline">
                            {{ formattedVIPStatus }}
                        </div>

                        <div v-if="showMemberStatus && formattedCustomerType" class="inline">
                            {{ formattedCustomerType }}
                        </div>

                        <div v-if="showLSD">
                            {{ labels.LoyaltyShoppingDollars }} {{ userBalances.FormattedLsdAvailableToSpend }}
                        </div>
                    </template>
                </div>

                <div
                    v-if="points && viewPoints && !IsGrowUser"
                    class="m-navMenuUser__content">

                    <span class="sr-only">
                        {{ points }} {{ labels.Points }}
                    </span>

                    <div class="m-navMenuUser__msg">
                        <span aria-hidden="true">

                            {{ labels.Points }}
                        </span>
                    </div>

                    <div
                        aria-hidden="true"
                        class="m-navMenuUser__wrapper">

                        <span class="m-navMenuUser__points">
                            {{ points }}
                        </span>
                    </div>
                </div>
            </template>

            <div v-if="isCn" class="m-navMenu__header-logged">
                <div class="m-navMenu__header-logged -cheers -mobile">
                    {{ greeting }}
                </div>
                <div class="m-navMenu__header-logged -productPoints">
                    {{ formattedStatus }}
                </div>
                <div class="m-navMenu__header-logged -lvip">
                    <span>{{ lvipStatus }}</span>
                    <span v-if="lvipIcon" class="m-navMenu__header-logged -lvipImg">
                        <img :src="lvipIcon" :alt="lvipStatus"></span>
                </div>
                <div class="m-navMenu__header-logged -lsd">
                    {{ lsdMobileLabels }}
                    <span class="text-black font-bold">{{ lsd }}</span>
                </div>
                <div v-if="hasExpiringThisMonth" class="m-navMenu__header-logged -lsd">
                    {{ expiringThisMonthLabel }}
                    <span class="text-black font-bold">{{ lsdExpiringInCurrentMonth }}</span>
                </div>

                <div
                    v-if="points && viewPoints"
                    class="m-navMenuUser__content mt-20">

                    <span class="sr-only">
                        {{ points }} {{ labels.Points }}
                    </span>

                    <div class="m-navMenuUser__msg">
                        <span aria-hidden="true">
                            {{ labels.Points }}
                        </span>
                    </div>

                    <div
                        aria-hidden="true"
                        class="m-navMenuUser__wrapper">
                        <span class="m-navMenuUser__points">
                            {{ points }}
                        </span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex';

    export default {
        name: 'MNavMenuUser',
        computed: {
            ...mapGetters('navigation', ['firstName', 'isAuthenticated', 'onNavMenuExpanded', 'userBalances']),
            ...mapState('cartSummary', ['points']),
            ...mapState('navigation', ['formattedName', 'formattedCustomerType', 'formattedStatus', 'formattedVIPStatus', 'lvipStatus', 'lvipIcon', 'lsd', 'lsdMobileLabels', 'expiringThisMonthLabel', 'hasExpiringThisMonth', 'lsdExpiringInCurrentMonth', 'isLoaded', 'loading', 'labels', 'greetingLabels']),
            ...mapState('userFlags', ['userFlags']),

            greeting() {
                if(this.isCn) {
                    return this.greetingLabels?.replace('{0}', this.formattedName) || '';
                } else if(this.isJp) {
                    return this.labels.Greeting?.replace('{0}', this.formattedName) || '';
                } else {
                    return this.labels.Greeting?.replace('{0}', this.firstName) || '';
                }
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            IsGrowUser() {
                return this.userFlags?.IsGrowUser;
            },
            isJp() {
                return this.$env?.Country === 'Japan';
            },
            showInfo() {
                return (this.userFlags?.ShowLoyaltyStatus || this.userFlags?.ShowLSDBalance || this.userFlags?.ShowMarketingExecutiveTitle) || this.IsGrowUser;
            },
            showLSD() {
                if(this.isJp) {
                    return this.userFlags?.ShowLSDBalance && this.userBalances?.FormattedLsdAvailableToSpend && this.userBalances?.LsdAvailableToSpend > 0;
                } else {
                    return this.userFlags?.ShowLSDBalance && this.userBalances?.FormattedLsdAvailableToSpend;
                }
            },
            showMarketingExecutiveTitle() {
                return (this.userFlags.ShowMarketingExecutiveTitle && this.formattedStatus) || this.IsGrowUser;
            },
            showMemberStatus() {
                return this.userFlags?.ShowMemberStatus;
            },
            showVip() {
                return this.userFlags.ShowLoyaltyStatus && this.formattedVIPStatus;
            },
            viewPoints() {
                return this.userFlags?.ViewPoints;
            }
        },
        created() {
            this.getUserFlags();

            this.onNavMenuExpanded(this.getData);
            this.$store.commit('navigation/SET_IS_CN', this.isCn);
        },
        methods: {
            ...mapActions('navigation', ['getNavigation']),
            ...mapActions('cartSummary', ['getSummary']),
            ...mapActions('userFlags', ['getUserFlags']),

            async getData() {
                if(this.points === null) {
                    this.getSummary();
                }

                if(!this.isLoaded) {
                    await this.getNavigation();
                }
            }
        }
    };
</script>
