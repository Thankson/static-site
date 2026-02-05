<template>
    <div class="o-signOutLia">
        <div class="o-signOutLia__wrapper -border m-rte" @click="confirmLogout">
            {{ getLocalizationProp('Data.SignOutText') }}
        </div>

        <!-- confirm logout -->
        <modal id="confirm-logout" width="535px">
            <div class="o-signOutLia -modal">
                <h2 class="o-signOutLia__modalTitle" v-html="getLocalizationProp('Data.ModalContent')">
                </h2>
                <div class="o-signOutLia__modalActions">
                    <v-button class="o-signOutLia__modalAction -primary" @click="handleCancel">
                        {{ getLocalizationProp('Labels.Cancel') }}
                    </v-button>
                    <v-button class="o-signOutLia__modalAction -gray" @click="handleConfirm">
                        {{ getLocalizationProp('Labels.Confirm') }}
                    </v-button>
                </div>
            </div>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'OSignOutLia',
        mixins: [localizationMixin],
        methods: {
            confirmLogout() {
                this.$modal.show({ id: 'confirm-logout' });
            },
            handleCancel() {
                this.$modal.hide({ id: 'confirm-logout' });
            },
            handleConfirm() {
                window.location.href = this.getLocalizationProp('Data.SignOutLink', '#');
            }
        }
    };
</script>
