<template>
    <component :is="containerType" class="o-sequentialSection">
        <component :is="titleType" class="o-sequentialSection__title ml-2" :class="{'-onlyVisibleElement': titleIsOnlyVisibleElement}">
            <span v-if="showSequenceNumber" class="o-sequentialSection__number">{{ displayIndex || sequenceIndex + 1 }}</span>
            {{ titleCopy }}
            <span
                v-show="!isActive && !_sequenceInfo.selectedTitle"
                class="o-sequentialSection__titleExtraInfo pl-10 text-base"
                :class="highlightedExtraTitleInfoClassModifier"
            >
                {{ highlightedExtraTitleInfo }}
            </span>
        </component>

        <div v-show="_sequenceInfo.loading">
            <a-loading-spinner :visible="_sequenceInfo.loading" />
        </div>
        <div v-show="!isActive" class="o-sequentialSection__selectedTitle">
            <slot name="selctedTitle">
                <div class="" v-html="_sequenceInfo.selectedTitle"></div>
            </slot>
            <p
                v-if="_sequenceInfo.selectedTitle"
                class="o-sequentialSection__titleExtraInfo"
                :class="highlightedExtraTitleInfoClassModifier"
            >
                {{ highlightedExtraTitleInfo }}
            </p>
        </div>
        <transition
            :name="'o-sequentialSecion__' + sequenceIndex"
            @enter="[enter, $emit('show')]"
            @afterEnter="[afterEnter, $emit('shown')]"
            @leave="[leave, $emit('hide')]"
            @afterLeave="[afterLeave, $emit('hidden')]">

            <div
                v-show="isActive"
                ref="content"
                class="o-sequentialSection__contentEditable"
                :class="contentClasses"
                role="region"
            >
                <!-- content -->
                <slot></slot>
            </div>
        </transition>
        <button v-if="isChangeValid" class="o-sequentialSection__buttonLink" @click="[makeActive(), gtmTrackAction({id: 453, text: titleCopy}, $event)]">{{ changeLabel }}</button>
    </component>
</template>

<script>
    import { reflow } from '@common/source/js/utils/dom';
    import { mapState, mapGetters, mapActions } from 'vuex';

    export default {
        name: 'OSequentialSection',
        props: {
            changeLabel: {
                type: String,
                default: ''
            },
            containerType: {
                type: String,
                default: 'section'
            },
            contentMods: {
                type: String,
                default: ''
            },
            displayIndex: {
                type: Number,
                default: null
            },
            highlightedExtraTitleInfo: {
                type: String,
                default: null
            },
            highlightedExtraTitleInfoClassModifier: {
                type: String,
                default: null
            },
            titleCopy: {
                type: String,
                default: ''
            },
            titleType: {
                type: String,
                default: 'h2'
            },
            sequenceIndex: {
                type: Number,
                required: true
            },
            shippingAddressesSequenceIndex: {
                type: Number,
                default: 0
            },
            isOleCheckoutFlow: {
                type: Boolean,
                default: false
            },
            hideChangeButton: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapGetters('sequentialSections', ['sequenceInfo', 'showSequenceNumber']),
            ...mapState('sequentialSections', ['sequence']),
            _sequenceInfo() {
                return this.sequenceInfo(this.sequenceIndex) ?? {};
            },
            isActive() {
                return this._sequenceInfo?.isActive;
            },
            contentClasses() {
                return [
                    !this._sequenceInfo.isActive ? '-collapsed' : '',
                    this.contentMods
                ];
            },
            titleIsOnlyVisibleElement() {
                return !this.isActive && !this._sequenceInfo?.selectedTitle;
            },
            isChangeValid() {
                if(this.hideChangeButton) {
                    // hide change button if only one ship method on OLE checkout
                    return false;
                } else if(!this._sequenceInfo.isActive && !this._sequenceInfo.isEmpty) {
                    return true;
                } return false;
            }
        },
        methods: {
            ...mapActions('sequentialSections', ['setSpecificSequenceObjectActive']),
            enter(el) {
                el.style.height = `${el.scrollHeight}px`;
            },
            afterEnter() {
                this.resetHeight();
            },
            leave(el) {
                el.style.height = `${el.clientHeight}px`;
                reflow(el);
                el.style.height = '0px';
            },
            afterLeave() {
                this.resetHeight();
            },
            makeActive() {
                // shippingAddressesSequenceIndex maybe dynamic, default 0
                if(this.sequenceIndex === this.shippingAddressesSequenceIndex && this.isOleCheckoutFlow) {
                    // On OLE checkout - open address edit flow
                    this.$emit('openAddressEdit');
                } else {
                    this.$emit('validateCompletedSections');
                    this.setSpecificSequenceObjectActive(this.sequenceIndex);
                }
            },
            resetHeight() {
                const el = this.$refs['content'];
                if(el && el.style) {
                    el.style.height = null;
                }
            }
        }
    };
</script>
