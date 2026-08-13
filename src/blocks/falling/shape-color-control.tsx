import { ColorPicker } from "@wordpress/components";
import { useState } from "@wordpress/element";

interface ColorResult {
	hex: string;
}

interface ShapeColorControlProps {
	value: string[];
	onChange: (value: string[]) => void;
}

export function ShapeColorControl({
	value,
	onChange,
}: ShapeColorControlProps): JSX.Element {
	const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);

	const toggleColorPicker = (index: number) => {
		setActiveColorIndex((current) => (current === index ? null : index));
	};

	const updateColor = (color: ColorResult) => {
		if (activeColorIndex === null) return;

		const updatedColors = [...value];
		if (activeColorIndex >= updatedColors.length) {
			updatedColors.push(color.hex);
		} else {
			updatedColors[activeColorIndex] = color.hex;
		}
		onChange(updatedColors);
	};

	const deleteColor = (indexToRemove: number) => {
		onChange(value.filter((_, index) => index !== indexToRemove));
		setActiveColorIndex((current) => {
			if (current === null) return null;
			if (current === indexToRemove) return null;
			return current > indexToRemove ? current - 1 : current;
		});
	};

	const addColor = () => {
		setActiveColorIndex(value.length);
	};

	return (
		<div>
			{value.map((color, index) => (
				<div className="color_item" key={`${color}-${index}`}>
					<div
						className={`color_circle${index === activeColorIndex ? " checked" : ""}`}
						style={{ backgroundColor: color }}
						onClick={() => toggleColorPicker(index)}
					/>
					<div
						className="color_delete"
						onClick={() => deleteColor(index)}
					/>
				</div>
			))}
			<div
				className="color_item color_plus"
				onClick={addColor}
			/>
			{activeColorIndex !== null && (
				<ColorPicker
					color={value[activeColorIndex]}
					onChangeComplete={updateColor}
				/>
			)}
		</div>
	);
}
