import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { tsOptionsJson, bg_Color, bg_Gradient } = attributes;
	//単色かグラデーションかの選択
	const bgColor = bg_Gradient || bg_Color;
	//ブロックのスタイル設定
	const blockProps = useBlockProps.save({
		style: {
			position: "absolute",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0,
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
