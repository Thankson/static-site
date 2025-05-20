<template>
    <ul class="m-checkboxList">
        <li
            v-for="(checkbox, checkIndex) in checkboxState"
            :key="`${safeId()}_${checkIndex}`"
            :class="listItemMods">

            <m-checkbox
                v-model="checkboxState[checkIndex].checked"
                :label="checkbox.label"
                :label-mods="getCheckboxLabelMods(checkIndex)"
                :name="checkbox.name"
                :aria-required="checkbox.required"
                :aria-invalid="showErrors && checkboxErrors[checkIndex]"
                @input="gtmTrackAction({id: 251, text: getGAText(checkbox.label)}, $event)"
            />
        </li>
    </ul>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import stripHtmlTags from '@common/source/js/vue/utils/strip-html-tags';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    /**
     * @typedef {Object} Checkbox
     * @property {boolean} checked
     * @property {string} label
     * @property {string} name
     * @property {boolean} required
     */

    export default {
        name: 'MCheckboxList',
        mixins: [ safeId, localizationMixin ],
        props: {
            /** @type {Array<Checkbox>} */
            checkboxes: {
                type: Array,
                required: true
            },
            checkboxErrorMods: {
                type: String,
                default: ''
            },
            checkboxMods: {
                type: String,
                default: ''
            },
            listItemMods: {
                type: String,
                default: ''
            },
            showErrors: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                checkboxState: []
            };
        },
        computed: {
            checkboxErrors() {
                return this.checkboxState.map((checkbox) => checkbox.required && !checkbox.checked);
            },
            isAllRequiredChecked() {
                const required = this.checkboxState.filter(({ required }) => required);
                const checkedCount = required.filter(({ checked }) => checked).length;

                return checkedCount >= required.length;
            }
        },
        watch: {
            checkboxes() {
                this.checkboxState = this.checkboxes;
            },
            checkboxState: {
                deep: true,
                handler() {
                    this.$emit('change', {
                        checkboxes: this.checkboxState,
                        isAllRequiredChecked: this.isAllRequiredChecked
                    });
                }
            }
        },
        mounted() {
            this.checkboxState = this.checkboxes;
        },
        methods: {
            getCheckboxLabelMods(index) {
                return [
                    this.checkboxMods,
                    this.showErrors && this.checkboxErrors[index] ? this.checkboxErrorMods : ''
                ].join(' ');
            },
            getGAText(text) {
                return stripHtmlTags(text);
            }
        }
    };
</script>
