<template>
    <div class="o-dsExtraInfo">
        <div class="o-dsExtraInfo__fields -allRadius">
            <p class=" ">{{ getLocalizationProp('Data.UploadMaterialsNotice') }}</p>
            <ul class="o-dsExtraInfo__options my-16 space-y-16">
                <li v-for="option in identityOptions" :key="option.OptionName" class="o-dsExtraInfo__option -active">
                    {{ option.Description }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsExtraInfo',
        mixins: [ localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        computed: {
            identityOptions() {
                return this.getLocalizationProp('Data.IdentityOptions', []);
            }
        }
    };
</script>
