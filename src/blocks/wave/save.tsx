import { useBlockProps } from "@wordpress/block-editor";
import type { WaveAttributes } from "./types";

interface SaveProps {
	attributes: WaveAttributes;
}

export default function save({ attributes }: SaveProps) {
	// そのまま全部保存でもOKだけど、最小化するなら必要項目だけにするのがベター
	const payload = {
		first_Color: attributes.first_Color,
		second_Color: attributes.second_Color,
		is_mulutiwave: attributes.is_mulutiwave,
		placement: attributes.placement,
		default_val: attributes.default_val,
		mobile_val: attributes.mobile_val,
	};

	const str_option = JSON.stringify(payload);

	return (
		<div {...useBlockProps.save()}>
			<canvas
				className="itmar-wave-canvas"
				data-wave_option={str_option}
				aria-hidden="true"
				style={{
					display: "block",
					width: "100%",
					height: `${payload.default_val.wave_height || 200}px`,
				}}
			/>
		</div>
	);
}
