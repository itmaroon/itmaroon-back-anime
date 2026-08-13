export interface FallingAttributes {
	bg_Color: string;
	bg_Gradient?: string;
	number_value: number;
	particleImage: string;
	particleSize: number;
	particleSpeed: number;
	particleDirection: string;
	poliline_num: number;
	linkLine_color: string;
	poliline_color: string;
	polilineSpeed: number;
	paperNum: number;
	paperSpeed: number;
	paperDirection: string;
	paperDensity: number;
	twincleNum: number;
	twincleDensity: number;
	twincle_color: string;
	shapeNum: number;
	shapeDensity: number;
	shape_color: string[];
	shape_type: string[];
	shapeSize: number;
	shapeSpeed: number;
	tsOptionsJson: string;
	className?: string;
}

export type SetFallingAttributes = (
	attributes: Partial<FallingAttributes>,
) => void;
