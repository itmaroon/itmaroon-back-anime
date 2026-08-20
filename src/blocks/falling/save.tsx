import { useBlockProps } from "@wordpress/block-editor";
import type { FallingAttributes } from "./types";

interface SaveProps {
	attributes: FallingAttributes;
}

export default function save({ attributes }: SaveProps) {
	const { tsOptionsJson, bg_Color, bg_Gradient } = attributes;
	//単色かグラデーションかの選択
	const bgColor = bg_Gradient || bg_Color;
	//ブロックのスタイル設定
	const blockProps = useBlockProps.save({
		style: {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			margin: 0,
			padding: 0,
			zIndex: 0,
			pointerEvents: "none",
		},
	});

	return (
		<div {...blockProps}>
			<div
				data-particle_option={tsOptionsJson}
				style={{
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					background: bgColor,
					zIndex: 0,
				}}
			/>
		</div>
	);
}
