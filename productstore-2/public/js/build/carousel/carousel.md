# Carousel Modules
The file `carousel.js` is the base for the existing carousels on the site. It uses slick slider and is based on the old hero carousel.

- The file exports a component module builder. The builder receives 2 parameters and returns a carousel module.
- The builder is based on the old `hero-carousel.js` file, with small changes to allow different configurations.
- The first parameter is the div classname to which the carousel module will be applied.
- The second is custom configuration values, which will override the default carousel configuration values. Config values not set are going to be reset to the default for that module.

This approach allows for multiple carousels with similar (but a little different) settings to be easily built without rewriting code.

#### Example 1 - `hero.js`
1. The first parameter is the classname to which the module will be applied: `o-heroCarousel`.
1. As the hero carousel uses the default settings, there is no need to pass a second parameter with custom settings.
1. The `onReady` function of the built module is called when the document is loaded.

#### Example 2 - `seasonal.js`
1. The first parameter is the classname to which the module will be applied: `o-seasonalCarousel`.
1. The config values of the seasonal carousel that differs from the default are passed as a second parameter.
1. The `onReady` function of the built module is called when the document is loaded.
