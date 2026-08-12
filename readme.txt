=== ITmaroon Back Anime ===
Contributors:      itmaroon
Tags:              block, animation, background, particle, wave
Requires at least: 6.4
Tested up to:      6.9
Stable tag:        0.1.0
Requires PHP:      8.2
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A collection of background animation Gutenberg blocks

== Description ==

ITmaroon Back Anime is a collection of Gutenberg blocks that add decorative background animations to your content.
This plugin is designed for modern block themes and the Site Editor.

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
  - @tsparticles/pjs (^3.9.1)
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
3. In the block editor or Site Editor, search for "ITmaroon Back Anime" blocks and insert them into your layout.
4. Adjust animation settings in the block sidebar (Inspector).

Notes:
* Background animation blocks are typically used inside containers (e.g., Group/Cover/Section-like blocks) to decorate content behind other blocks.
* For best results, ensure the parent/container block has a visible area (height/spacing) where the animation should appear.

== Frequently Asked Questions ==

= Does this plugin load external scripts (CDN)? =
No. The animation library for particles is bundled in the plugin build via npm packages (@tsparticles/engine, @tsparticles/slim, @tsparticles/pjs).
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

1. Particle Background Block - example (desktop)
2. Particle Background Block - settings panel
3. Wave Background Block - example (desktop)
4. Wave Background Block - responsive (mobile) settings example
5. Wave Background Block - placement options (top/right/bottom/left)

== Related Links ==
* ITmaroon Back Anime: GitHub
  https://github.com/itmaroon/back-anime-block
* block-class-package: GitHub
  https://github.com/itmaroon/block-class-package
* block-class-package: Packagist
  https://packagist.org/packages/itmar/block-class-package
* itmar-block-packages: npm
  https://www.npmjs.com/package/itmar-block-packages
* itmar-block-packages: GitHub
  https://github.com/itmaroon/itmar-block-packages

== Changelog ==

= 0.1.0 =
* Release
* Added Particle Background Block powered by tsParticles v3
* Added Wave Background Block with responsive desktop/mobile values
* Front-end scripts are loaded only when blocks are present (block.json viewScript)

== Arbitrary section ==

= Development / Build =
This plugin includes built assets generated from npm dependencies.
The Particle Background Block uses tsParticles v3 packages:
* @tsparticles/engine (^3.9.1)
* @tsparticles/slim (^3.9.1)
* @tsparticles/pjs (^3.9.1)

If you build from source, install dependencies and run the build command used by this repository.
