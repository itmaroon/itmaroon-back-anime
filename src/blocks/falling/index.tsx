import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import "./style.scss";
import { ReactComponent as Falling } from "./falling.svg";

/**
 * Internal dependencies
 */
import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";
import type { FallingAttributes } from "./types";

registerBlockType<FallingAttributes>(metadata.name, {
	styles: [
		{
			name: "default",
			label: __("Default", "itmaroon-back-anime"),
			isDefault: true,
		},
		{
			name: "degital",
			label: __("Geometric Patterns", "itmaroon-back-anime"),
		},
		{
			name: "paper",
			label: __("Confetti", "itmaroon-back-anime"),
		},
		{
			name: "bubbly",
			label: __("Bubble", "itmaroon-back-anime"),
		},
	],

	description: __(
		"Particle animation has been made blocky.",
		"itmaroon-back-anime",
	),
	icon: <Falling />,
	edit: Edit,
	save,
});
