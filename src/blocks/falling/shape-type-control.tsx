import { CheckboxControl } from "@wordpress/components";

interface ShapeTypeControlProps {
	options: readonly string[];
	value: string[];
	onChange: (value: string[]) => void;
}

export function ShapeTypeControl({
	options,
	value,
	onChange,
}: ShapeTypeControlProps): JSX.Element {
	return (
		<div>
			{options.map((option) => (
				<CheckboxControl
					key={option}
					label={option}
					checked={value.includes(option)}
					onChange={(checked: boolean) =>
						onChange(
							checked
								? [...value, option]
								: value.filter((current) => current !== option),
						)
					}
				/>
			))}
		</div>
	);
}
