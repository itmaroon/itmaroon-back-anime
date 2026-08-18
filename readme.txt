=== ITmaroon Back Anime ===
Contributors:      itmaroon
Tags:              block, animation, background, particle, wave
Requires at least: 6.4
Tested up to:      7.0
Stable tag:        0.1.1
Requires PHP:      8.2
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A collection of background animation Gutenberg blocks

== Description ==

ITmaroon Back Anime is a collection of Gutenberg blocks that add decorative background animations to your content.
This plugin is designed for modern block themes and the Site Editor.
It has been tested with WordPress 7.0.4.

Included blocks (current version):
* Particle Background Block (tsParticles v3)
* Wave Background Block (Canvas-based wave animation)

Performance-minded loading:
* Front-end scripts are registered through block.json and loaded only when the block exists on the page (viewScript).
* No runtime CDN is required for animation libraries.

tsParticles (v3) integration:
* The Particle Background Block is powered by tsParticles v3 and uses the following npm packages which are bundled into the plugin build:
  - @tsparticles/engine (^3.9.1)
  - @tsparticles/slim (^3.9.1)
  - @tsparticles/shape-image (^3.9.1)
  - @tsparticles/pjs (^3.9.1)
  - itmar-block-packages
* The slim bundle is used for smaller footprint while keeping common particle features.
* Particle options are generated in a tsParticles v3 compatible format (not legacy particles.js format).

Mobile / Desktop responsive settings:
* The Wave Background Block supports separate values for desktop and mobile (e.g., wave height and wave sizes).
* In the editor, the responsive preview switches based on viewport size.
* On the front-end, the responsive behavior is applied using a screen-width check (matchMedia) to mirror the editor logic.

Privacy:
* This plugin does not collect personal data.
* This plugin does not send data to external services.

== Installation ==

1. Upload the plugin folder to the /wp-content/plugins/ directory, or install it through the WordPress Plugins screen.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. In the block editor or Site Editor, search for the "Falling" or "Wave" block and insert it into your layout.
4. Adjust animation settings in the block sidebar (Inspector).

Notes:
* Background animation blocks are typically used inside containers (e.g., Group/Cover/Section-like blocks) to decorate content behind other blocks.
* For best results, ensure the parent/container block has a visible area (height/spacing) where the animation should appear.

== Frequently Asked Questions ==

= Does this plugin load external scripts (CDN)? =
No. The animation library for particles is bundled in the plugin build via npm packages (@tsparticles/engine, @tsparticles/slim, @tsparticles/shape-image, @tsparticles/pjs).
Front-end scripts are loaded only when the relevant block is present on the page.

= Will the scripts run on pages that do not use these blocks? =
No. Front-end scripts are registered via block.json viewScript and are loaded only when the block is rendered on the page.

= Is this plugin compatible with the Site Editor (Full Site Editing)? =
Yes. The blocks are intended to work in both the post editor and the Site Editor.

= How does mobile support work for the Wave block? =
The Wave block supports separate desktop/mobile values (e.g., wave height and wave sizes).
In the editor, the preview switches by viewport size. On the front-end, the plugin applies a screen-width based selection so mobile devices can use different values than desktop.

= Does this plugin affect accessibility? =
The canvas animations are decorative backgrounds. Canvas elements are output with aria-hidden="true" so they are not announced to assistive technologies.

== Screenshots ==

1. Particle Background Block - example (Geometric patterns and waves)
2. Particle Background Block - example (Bubbles and Waves)
3. Particle Background Block - example (Snow falling)
4. Particle Background Block - example (A flurry of falling blossoms)
5. Particle Background Block - settings panel
6. Wave Background Block - settings panel

== Changelog ==

= 0.1.0 =
* Release
* Added Particle Background Block powered by tsParticles v3
* Added Wave Background Block with responsive desktop/mobile values
* Front-end scripts are loaded only when blocks are present (block.json viewScript)

== Development / Source Code ==

The human-readable TypeScript source code and build configuration are included with this plugin and are also available in the public GitHub repository:
https://github.com/itmaroon/itmaroon-back-anime

This project is developed in a shared npm environment. Common development packages, including @wordpress/scripts, TypeScript, and itmar-block-packages, are installed in the wp-content directory and resolved from wp-content/node_modules by each plugin.

= Build =

1. Install the shared development packages in the WordPress wp-content directory:

`npm install --save-dev @wordpress/scripts typescript`

`npm install itmar-block-packages`

2. Install this plugin's dependencies in the plugin directory:

`npm install`

3. Run the TypeScript type check and production build:

`npm run typecheck`

`npm run build`

This plugin includes built assets generated from npm dependencies.
The Particle Background Block uses tsParticles v3 packages:
* @tsparticles/engine (^3.9.1)
* @tsparticles/slim (^3.9.1)
* @tsparticles/shape-image (^3.9.1)
* @tsparticles/pjs (^3.9.1)
* itmar-block-packages

= Development dependencies and source code =

* [ITmaroon Back Anime on GitHub](https://github.com/itmaroon/itmaroon-back-anime)
* [block-class-package on GitHub](https://github.com/itmaroon/block-class-package)
* [block-class-package on Packagist](https://packagist.org/packages/itmar/block-class-package)
* [itmar-block-packages on npm](https://www.npmjs.com/package/itmar-block-packages)
* [itmar-block-packages on GitHub](https://github.com/itmaroon/itmar-block-packages)
