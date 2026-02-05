<template>
    <div class="m-formField -checkbox" :class="[modClass, { '-disabled': disabled, '-isCn': isCn}]">
        <input
            :id="id ? id : inputId"
            ref="input"
            class="a-input -checkbox"
            :class="size ? `-${size}` : ''"
            :checked="checked"
            type="checkbox"
            :name="name"
            :value="inputValue"
            :readonly="disabled"
            :required="required"
            :aria-describedby="ariaDescribedby || null"
            :aria-required="ariaRequired"
            :aria-invalid="ariaInvalid"
            :aria-disabled="disabled"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
            v-on="!disabled ? {
                change: update,
                keydown: evt => {
                    const key = evt.which || evt.keyCode || 0;
                    if(key === 13 || key === 32) {
                        keyboardChange();
                        evt.preventDefault();
                    }
                }
            } : {
                click: evt => evt.preventDefault(),
                keydown: evt => {
                    const key = evt.which || evt.keyCode || 0;
                    if(key !== 9) {
                        evt.preventDefault();
                    }
                }
            }">

        <label
            :for="id ? id : inputId"
            class="m-formField__label -checkbox"
            :class="labelClasses">

            <span role="text">
                <span v-html="label"></span>
                <slot />
            </span>
        </label>
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'MCheckbox',
        mixins: [ safeId ],
        safeIds: [
            'inputId'
        ],
        props: {
            ariaDescribedby: {
                type: String,
                default: ''
            },
            ariaRequired: {
                type: Boolean,
                default: false
            },
            ariaInvalid: {
                type: Boolean,
                default: false
            },
            name: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            label: {
                type: String,
                required: true
            },
            labelMods: {
                type: String,
                default: ''
            },
            modClass: {
                type: String,
                default: ''
            },
            size: {
                type: String,
                default: ''
            },
            value: {
                type: [ Array, Boolean ],
                default: null
            },
            id: {
                type: String,
                default: null
            },
            inputValue: {
                type: String,
                default: ''
            },
            isCn: {
                type: Boolean,
                default: false
            },
            required: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                // dynamically generated Ids
                inputId: ''
            };
        },
        computed: {
            checked() {
                return this.modelIsArray ? this.value?.includes(this.inputValue) : !!this.value;
            },
            labelClasses() {
                return [
                    this.size ? `-${this.size}` : '',
                    this.disabled ? '-disabled' : '',
                    this.isCn ? '-isCn' : '',
                    this.labelMods
                ];
            },
            modelIsArray() {
                return Array.isArray(this.value) && this.inputValue;
            }
        },
        methods: {
            keyboardChange() {
                this.$refs['input'].checked = !this.$refs['input'].checked;
                this.update();
            },
            update() {
                let currentVal = this.modelIsArray ? [ ...this.value ] : this.$refs['input'].checked;

                if(this.modelIsArray) {
                    if(this.$refs['input'].checked) {
                        currentVal.push(this.inputValue);
                    } else {
                        currentVal = currentVal.filter(item => item !== this.inputValue);
                    }
                }

                this.$emit('input', currentVal, event);
            }
        }
    };
</script>
