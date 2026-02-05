<template>
    <div class="m-signInReminder">
        <div class="m-signInReminder__wrapper">
            <img class="m-signInReminder__icon" :src="getLocalizationProp('Data.Icon')" alt="">
            <span v-html="loginText">
            </span>
        </div>
    </div>

</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MSignInReminder',
        mixins: [localizationMixin],
        computed: {
            loginText() {
                const {ReminderContent = '', SignInLink = '#', SignInText = ''} = this.getLocalizationProp('Data', {});
                return ReminderContent.replace('{0}', `<a href="${SignInLink}" class="text-sky underline">${SignInText}</a>`);
            }
        }
    };
</script>
