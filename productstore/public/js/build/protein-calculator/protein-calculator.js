const PROTEIN_CALCULATOR_MODULE = {
    onReady: function() {
        $('.o-proteinCalc').not('.-isCn').each((index, element) => {
            let el = $(element);
            PROTEIN_CALCULATOR_MODULE.setClick(el);
        });
        PROTEIN_CALCULATOR_MODULE.avoidLetters();

        $('.o-proteinCalc.-isCn').each((index, element) => {
            let el = $(element);
            PROTEIN_CALCULATOR_MODULE.setClick(el);
        });
    },
    avoidLetters: function() {
        $('#proteinCalculatorForm input#weight').on('keypress', function(key) {
            if(key.charCode < 48 || key.charCode > 57) return false;
        });
    },
    setClick: function(el) {
        const button = $(el).find('.o-proteinCalc__CTA');

        button.on('click', (e) => { PROTEIN_CALCULATOR_MODULE.calculateProtein(el, e); });
    },
    calculateProtein: function(el, event) {
        event.preventDefault();
        const proteinCalc = el;
        proteinCalc.find('.o-proteinCalc__error').addClass('hidden');
        proteinCalc.find('.o-proteinCalc__result').addClass('hidden');
        const allFieldsFilled = PROTEIN_CALCULATOR_MODULE.isAllFieldsFilled(el);
        if(!allFieldsFilled.filled) {
            if(allFieldsFilled.type === 'dropdown') {
                if($('.o-proteinCalc.-isCn').length > 0) {
                    if(allFieldsFilled.current.length > 1) {
                        allFieldsFilled.current.forEach(function(item) {
                            item.children('.o-proteinCalc__error.-dropdown').removeClass('hidden');
                        });
                    } else {
                        if(allFieldsFilled.current.length > 0) {
                            allFieldsFilled.current[0].children('.o-proteinCalc__error.-dropdown').removeClass('hidden');
                        }
                    }
                } else {
                    proteinCalc.find('.o-proteinCalc__error.-dropdown').removeClass('hidden');
                }
            } else {
                proteinCalc.find('.o-proteinCalc__error.-number').removeClass('hidden');
            }
            return;
        }
        if($('.o-proteinCalc.-isCn').length > 0) {
            let results = {
                protein: '',
                recomendedProduct: ''
            };
            const genderFieldValue = proteinCalc.find('.o-proteinCalc__field.-gender select').find('option:selected').val();
            const ageFieldValue = proteinCalc.find('.o-proteinCalc__field.-age select').find('option:selected').val();
            const goalFieldValue = proteinCalc.find('.o-proteinCalc__field.-goal select').find('option:selected').val();
            if(genderFieldValue === 'male') {
                switch (ageFieldValue) {
                    case '3-6':
                        results.protein = '30-35';
                        break;
                    case '7-14':
                        results.protein = '40-60';
                        break;
                    case '14-17':
                        results.protein = '75';
                        break;
                    case '>18':
                        results.protein = '65';
                        break;
                    default:
                        results.protein = '30-35';
                }
            } else {
                switch (ageFieldValue) {
                    case '3-6':
                        results.protein = '30-35';
                        break;
                    case '7-14':
                        results.protein = '40-55';
                        break;
                    case '14-17':
                        results.protein = '60';
                        break;
                    case '>18':
                        results.protein = '55';
                        break;
                    default:
                        results.protein = '30-35';
                }
            }
            switch (goalFieldValue) {
                case 'nutrition':
                    results.recomendedProduct = ['nutritionShake', 'kpShakeable', 'proflex20Shake'];
                    break;
                case 'endurance':
                    results.recomendedProduct = ['accessShake'];
                    break;
                case 'muscle':
                    results.recomendedProduct = ['proflex20Shake'];
                    break;
                case 'meal':
                    results.recomendedProduct = ['attainShake', 'gcControl'];
                    break;
                default:
                    results.recomendedProduct = ['nutritionShake', 'kpShakeable', 'proflex20Shake'];
            }
            PROTEIN_CALCULATOR_MODULE.showCnResults(el, results);
        } else {
            let results = {
                weightMultiplier: '',
                recomendedProduct: '',
                weight: ''
            };
            const goalFieldValue = proteinCalc.find('.o-proteinCalc__field.-goal select').find('option:selected').val();
            const preferenceFieldValue = proteinCalc.find('.o-proteinCalc__field.-preference select').find('option:selected').val();
            const ageFieldValue = proteinCalc.find('.o-proteinCalc__field.-age select').find('option:selected').val();
            results.weight = proteinCalc.find('.o-proteinCalc__field.-weight').val();

            if(preferenceFieldValue === 'whey protein') {
                if(goalFieldValue === 'muscle') {
                    results.recomendedProduct = 'elevateProtein';
                } else {
                    results.recomendedProduct = 'proflex';
                }
            } else if(preferenceFieldValue) {
                results.recomendedProduct = 'veganProtein';
            }
            // Check for isTdfa flag for Taiwan
            const isTdfa = $(el).data('is-tdfa') === true;

            // Calculate weight multiplier
            if(isTdfa) {
                // The weight multiplier is a result of the grams multiplier divided by 2.205 (for the kg to lbs conversion)
                // For example, if it is 1.75g/1kg, then the weight multiplier is 0.79. 1.1g equates to 0.50, and 1.2g equates to 0.54 s
                if(goalFieldValue === 'muscle') {
                    results.weightMultiplier = 0.793;
                } else if(ageFieldValue === '<=70') {
                    results.weightMultiplier = 0.499;
                } else {
                    results.weightMultiplier = 0.544;
                }
            } else if(goalFieldValue === 'muscle') {
                results.weightMultiplier = 0.8;
            } else if(ageFieldValue === '<50') {
                results.weightMultiplier = 0.38;
            } else if(ageFieldValue === '51-59') {
                results.weightMultiplier = 0.45;
            } else {
                results.weightMultiplier = 0.54;
            }

            PROTEIN_CALCULATOR_MODULE.showResults(el, results);
        }
    },
    showResults: function(el, results) {
        const proteinCalc = el;
        const poundsCalculated = results.weight * results.weightMultiplier;
        const kgMultiplier = 2.205;
        const kilogramsCalculated = poundsCalculated * kgMultiplier;

        proteinCalc.find('.o-proteinCalc__result.-metric #proteinId').text(Math.round(kilogramsCalculated));
        proteinCalc.find('.o-proteinCalc__result.-imperial #proteinId').text(Math.round(poundsCalculated));
        proteinCalc.find('.o-proteinCalc__text.-recommended').addClass('hidden');
        results.recomendedProduct && proteinCalc.find(`.o-proteinCalc__text.-recommended#${results.recomendedProduct}`).removeClass('hidden');
        proteinCalc.find('.o-proteinCalc__result').removeClass('hidden');
    },
    showCnResults: function(el, results) {
        const proteinCalc = el;
        proteinCalc.find('.o-proteinCalc__text #proteinId').text(results.protein);
        proteinCalc.find('.o-proteinCalc__text.-recommended').addClass('hidden');
        results.recomendedProduct.forEach(element => {
            proteinCalc.find(`.o-proteinCalc__text.-recommended#${element}`).removeClass('hidden');
        });
        proteinCalc.find('.o-proteinCalc__result').removeClass('hidden');
    },
    isAllFieldsFilled: function(el) {
        const isFilled = { filled: true, type: '', current: [] };
        $(el).find('.o-proteinCalc__field .a-select__field').each((index, element) => {
            if($('.o-proteinCalc.-isCn').length > 0) {
                if($(element).find('option:selected').val() === $(element).find('option:first-child').val()) {
                    isFilled.filled = false;
                    isFilled.type = 'dropdown';
                    isFilled.current.push($(element).parents('.m-formField.-proteinCalc').next('.o-proteinCalc__wrapper'));
                }
            } else {
                if($(element).find('option:selected').val() === 'Select') {
                    isFilled.filled = false;
                    isFilled.type = 'dropdown';
                }
            }
        });
        if(!isFilled.filled) return isFilled;

        if($('.o-proteinCalc.-isCn').length === 0 && !$(el).find('.o-proteinCalc__field.-weight').val()) {
            isFilled.filled = false;
            isFilled.type = 'number';
        }

        return isFilled;
    }
};

$(document).ready(PROTEIN_CALCULATOR_MODULE.onReady);
