<template>
    <div :class="['o-tryOn flex', {'hidden': !isActive }]">
        <div class="o-tryOn__models" :class="useAsianModels ? '-isCn' : ''">
            <transition name="fade">
                <div v-show="toolState === 'showIntro'" class="o-tryOn__intro">
                    <div class="o-tryOn__controls" :class="useAsianModels ? '-isCn-intro-controls' : ''">
                        <a-close-x
                            ref="close"
                            class="o-tryOn__close a-icon material-icons -white"
                            @click="[activateTool(false), gtmTrackAction({id:216}, $event)]">
                            <slot name="close-sr-label" />
                        </a-close-x>
                        <button ref="selectModel" class="o-tryOn__select a-button -darkMode" @click="[removeIntro(), gtmTrackAction({id:216}, $event)]">{{ labels.SelectAModel }}</button>
                    </div>
                    <div class="o-tryOn__intro -overlay" :class="useAsianModels ? '-isCn' : ''">
                    </div>
                </div>
            </transition>
            <focus-trap>
                <div class="o-tryOn__choose" :class="middleAlignImages ? 'md:flex md:h-full': ''" :aria-hidden="toolState !== 'chooseModel'">
                    <div v-show="toolState === 'chooseModel'" class="o-tryOn__controls" :class="useAsianModels ? '-isCn' : ''">
                        <button :tabindex="toolState !== 'chooseModel' ? '-1' : '0'" class="o-tryOn__icon material-icons" @click="[activateTool(false), gtmTrackAction({id:216}, $event)]"><span class="sr-only">{{ labels.BackButtonAriaLbl }}</span>close</button>
                    </div>
                    <div v-if="useAsianModels" class="o-tryOn__model-content text-xl pb-18 md:pb-24 pl-9 pr-7 md:pr-15">{{ labels.ChooseTheModel }}</div>
                    <ul class="o-tryOn__grid" :class="{'md:m-auto': middleAlignImages, 'py-1_6 md:py-0': isPh}">
                        <li v-for="(model, mindex) in models" :key="mindex">
                            <button :tabindex="toolState !== 'chooseModel' ? '-1' : '0'" @click="[pickAModel(mindex), gtmTrackAction({id:217, text:mindex + 1}, {target: {nodeName: 'SELECT' }})]">
                                <img class="o-tryOn__image" :src="model.thumb" :alt="model.alt" />
                                <div v-if="useAsianModels" class="pt-8 text-base o-tryOn__label">{{ model.label }}</div>
                            </button>
                        </li>
                    </ul>
                </div>
            </focus-trap>
            <transition name="fade">
                <div v-show="toolState === 'modelChosen'" class="o-tryOn__model">
                    <div class="o-tryOn__controls">
                        <button ref="returnModels" class="o-tryOn__icon material-icons" @click="[resetTool(), gtmTrackAction({id:216}, $event)]"><span class="sr-only">{{ labels.BackButtonAriaLbl }}</span><span aria-hidden="true">arrow_back</span></button>
                        <button ref="closeModels" class="o-tryOn__icon material-icons" @click="[activateTool(false), gtmTrackAction({id:216}, $event)]"><span class="sr-only">close</span><span aria-hidden="true">close</span></button>
                    </div>
                    <img v-if="isGloss && colorChoice" class="o-tryOn__image -large -gloss" :src="imageUrl.gloss" alt="null" />
                    <img v-if="isGlitter && colorChoice" class="o-tryOn__image -large -glitter" :src="imageUrl.glitter" alt="null" />
                    <img v-if="isOverlayImageUrl" class="o-tryOn__image -large -eyeshadow" :src="overlayImageUrl" alt="null" />
                    <canvas v-show="colorChoice" id="lips" ref="lips" width="1000" height="1000"></canvas>
                    <img ref="model" class="o-tryOn__image -large noLazy" :src="imageUrl.face" :alt="imageUrl.alt" />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';

    export default {
        name: 'OTryOnTool',
        props: {
            labels: {
                type: Object,
                default: () => {}
            },
            scriptId: {
                type: String,
                default: ''
            },
            options: {
                type: Array,
                default: () => [
                    {
                        'Title': 'Mens',
                        'FacetRefinerId': 'type-men',
                        'ShelfImage': 'https://picsum.photos/70/70',
                        'PdpImage': 'https://picsum.photos/70/70',
                        'Filters': []
                    },
                    {
                        'Title': 'Womens',
                        'FacetRefinerId': 'type-women',
                        'ShelfImage': 'https://picsum.photos/70/70',
                        'PdpImage': 'https://picsum.photos/70/70',
                        'Filters': []
                    },
                    {
                        'Title': 'Longevity 50+',
                        'FacetRefinerId': 'type-longevity',
                        'ShelfImage': 'https://picsum.photos/70/70',
                        'PdpImage': 'https://picsum.photos/70/70',
                        'Filters': []
                    }
                ]
            },
            isAsianModelsForTryOnTool: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            tryOnToolType: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                isGloss: true,
                isGlitter: false,
                isCream: false,
                lipCanvas2: null,
                ctx: null,
                colors: {},
                eyeShadows: [],
                blushArray: [],
                models: []
            };
        },
        computed: {
            ...mapState('tryOnTool', ['colorLookUp', 'colorChoice', 'colorProfile', 'isActive', 'isError', 'toolState', 'coordinates', 'selectedModel', 'overlayImageUrl', 'selectedSku']),
            useAsianModels() {
                return this.isAsianModelsForTryOnTool;
            },
            imageUrl() {
                if(this.selectedModel === -1) return { face: '', alt: '', gloss: '', glitter: '' };
                return {
                    face: this.models[this.selectedModel].face,
                    alt: this.models[this.selectedModel].alt,
                    gloss: this.models[this.selectedModel].gloss,
                    glitter: this.models[this.selectedModel].glitter
                };
            },
            isOverlayImageUrl() {
                return this.overlayImageUrl !== '';
            },
            middleAlignImages() {
                return this.isPh;
            },
            isPh() {
                return this.$env.Country === 'Philippines';
            }

        },
        watch: {
            isError() {
                this.clearCanvas();
            },
            colorChoice() {
                if(this.selectedModel < 0 && this.isActive) return;
                if(this.toolState === 'modelChosen') {
                    this.applyColor();
                }
            },
            isActive(newVal, oldVal) {
                if(newVal) {
                    this.$nextTick(() => this.setFocus(this.$refs.selectModel));
                }
            }
        },
        created() {
            this.getTryOnToolData();
        },
        mounted() {
            this.getModels();
            if(this.useAsianModels) {
                if(this.isCn) {
                    switch (this.tryOnToolType) {
                        case 'EyeShadow':
                            this.setEyeShadow();
                            break;
                        case 'Blush':
                            this.setBlush();
                            break;
                        case 'LipLiner':
                            this.setColorData();
                            break;
                    }
                } else {
                    this.setColorData();
                }

                // Fits the look of Chinese models
                this.UPDATE_COORDINATES();
                this.models = this.models.map(item => ({
                    ...item,
                    face: item.face.replace('try-on-tool', 'try-on-tool/1'),
                    thumb: item.thumb.replace('try-on-tool', 'try-on-tool/1')
                }));
            } else {
                this.setColorData();
            }
            this.setErrorLabels();
        },
        methods: {
            ...mapActions('tryOnTool', [ 'activateTool', 'updateToolState', 'setModel', 'updateColor', 'updateEyeShadow', 'updateBlush']),
            ...mapMutations('tryOnTool', ['ACTIVATE_TOOL', 'SET_COLOR_DATA', 'UPDATE_TOOL_STATE', 'SET_MODEL', 'UPDATE_COORDINATES']),
            applyColor() {
                this.clearCanvas();
                let lipCanvas = this.lipCanvas2;
                let hue = this.selectedModel > 0 ? this.coordinates[this.selectedModel].skinIs : 'mid';
                let lipCoordinates = this.coordinates[this.selectedModel].lipcoords;
                lipCanvas.globalAlpha = this.lipBlendLevel(hue);

                lipCanvas.beginPath();

                for (let m = 0; m < lipCoordinates.length; m++) {
                    if(m === 0) {
                        lipCanvas.moveTo(lipCoordinates[m].x, lipCoordinates[m].y);
                    } else {
                        lipCanvas.lineTo(lipCoordinates[m].x, lipCoordinates[m].y);
                    }
                }

                lipCanvas.closePath();
                lipCanvas.strokeStyle = 'rgba(255,255,255,.01)';
                lipCanvas.lineWidth = 3;
                lipCanvas.shadowColor = this.colorChoice;
                lipCanvas.shadowBlur = 20;
                lipCanvas.stroke();
                lipCanvas.fillStyle = this.colorChoice;
                lipCanvas.fill();
                this.isGloss = this.colorProfile.Type === 'gloss';
                this.isGlitter = this.colorProfile.Shimmer === true;
                this.isCream = this.colorProfile.Type !== 'gloss';
            },
            getModels() {
                switch (true) {
                    case this.useAsianModels:
                        this.models = [
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-thumb.jpg',
                                alt: '1st model, fair complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-glitter.png',
                                label: this.labels.White
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-thumb.jpg',
                                alt: '2nd model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-glitter.png',
                                label: this.labels.Nature
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-thumb.jpg',
                                alt: '3rd model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-glitter.png',
                                label: this.labels.Healthy
                            }
                        ];
                        break;
                    case this.isPh: // First 6 of the US models.
                        this.models = [
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-thumb.jpg',
                                alt: '1st model, fair complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-thumb.jpg',
                                alt: '2nd model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-thumb.jpg',
                                alt: '3rd model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4-thumb.jpg',
                                alt: '4th model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5-thumb.jpg',
                                alt: '5th model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6-thumb.jpg',
                                alt: '6th model, medium to dark complexion, dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6-glitter.png'
                            }
                        ];
                        break;
                    default:
                        this.models = [
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-thumb.jpg',
                                alt: '1st model, fair complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face1-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-thumb.jpg',
                                alt: '2nd model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face2-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-thumb.jpg',
                                alt: '3rd model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face3-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4-thumb.jpg',
                                alt: '4th model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face4-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5-thumb.jpg',
                                alt: '5th model, medium complexion dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face5-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6-thumb.jpg',
                                alt: '6th model, medium to dark complexion, dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face6-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face7-thumb.jpg',
                                alt: '7th model, dark complexion, dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face7.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face7-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face7-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face8-thumb.jpg',
                                alt: '8th model, dark complexion, dark brown hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face8.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face8-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face8-glitter.png'
                            },
                            {
                                thumb: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face9-thumb.jpg',
                                alt: '9th model, dark complexion, short low cut hair',
                                face: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face9.jpg',
                                gloss: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face9-gloss.png',
                                glitter: '//cdnsc1.melaleuca.com/na/images/product-store/try-on-tool/face9-glitter.png'
                            }
                        ];
                }
            },
            setFocus(ele) {
                ele.focus();
            },
            clearCanvas() {
                let canvas = document.getElementById('lips');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            },
            setColorData() {
                this.$store.commit('tryOnTool/SET_COLOR_DATA', this.colors);
            },
            setErrorLabels() {
                this.$store.commit('tryOnTool/SET_ERROR_LABELS', this.labels.ColorNotAvailable);
            },
            removeIntro() {
                this.updateToolState(3);
            },
            lipBlendLevel(hue) {
                let _alpha = 0;
                switch (hue) {
                    case 'light':
                        _alpha = 0.32;
                        break;

                    case 'mid':
                        _alpha = 0.28;
                        break;

                    case 'dark':
                        _alpha = 0.30;
                        break;

                    default:
                        _alpha = 0.6;
                        break;
                }
                return _alpha;
            },
            pickAModel(_index) {
                this.clearCanvas();
                this.updateToolState(4);
                let canvas = document.getElementById('lips');
                this.ctx = canvas.getContext('2d');
                this.lipCanvas2 = this.ctx;
                this.setModel({ index: _index });
                this.isGloss = false;
                this.isGlitter = false;
                this.setFocus(this.$refs.returnModels);
                // if choice was picked but tool not active
                if(this.colorChoice) {
                    this.applyColor();
                }

                if(this.useAsianModels) {
                    switch (this.tryOnToolType) {
                        case 'EyeShadow': this.updateEyeShadow({ sku: this.selectedSku}); break;
                        case 'Blush': this.updateBlush({ sku: this.selectedSku}); break;
                    }
                }
            },
            resetTool() {
                this.updateToolState(3);
                this.clearCanvas();
                this.isGloss = false;
                this.isGlitter = false;
                this.setModel({ index: -1 });
            },
            getTryOnToolData() {
                const scriptEl = document.getElementById('data-try-on-tool');
                if(scriptEl) {
                    const data = JSON.parse(scriptEl.innerHTML);
                    if(data) {
                        if(this.isCn) {
                            switch (this.tryOnToolType) {
                                case 'EyeShadow':
                                    this.eyeShadows = { ...data.EyeShadow };
                                    break;
                                case 'Blush':
                                    this.blushArray = { ...data.Blush };
                                    break;
                                case 'LipLiner':
                                    this.colors = { ...data.Colors };
                                    break;
                            }
                        } else {
                            this.colors = { ...data.Colors };
                        }
                    }
                }
            },
            setEyeShadow() {
                this.$store.commit('tryOnTool/SET_EYE_SHADOW', this.eyeShadows);
            },
            setBlush() {
                this.$store.commit('tryOnTool/SET_BLUSH', this.blushArray);
            }
        }
    };
</script>
