declare module "@wordpress/i18n" {
	export function __(text: string, domain?: string): string;
}

declare module "@wordpress/blocks" {
	export interface BlockEditProps<T> {
		attributes: T;
		setAttributes(attributes: Partial<T>): void;
		clientId: string;
		[key: string]: unknown;
	}

	export function registerBlockType<T>(
		name: string,
		settings: Record<string, unknown>,
	): unknown;
}

declare module "@wordpress/block-editor" {
	export const InspectorControls: any;
	export const __experimentalPanelColorGradientSettings: any;
	export const useBlockProps: any;
}

declare module "@wordpress/components" {
	export const CheckboxControl: any;
	export const ColorPicker: any;
	export const PanelBody: any;
	export const PanelRow: any;
	export const RadioControl: any;
	export const RangeControl: any;
	export const ToggleControl: any;
}

declare module "@wordpress/element" {
	export function useEffect(
		effect: () => void | (() => void),
		dependencies?: readonly unknown[],
	): void;
	export function useMemo<T>(
		factory: () => T,
		dependencies: readonly unknown[],
	): T;
	export function useRef<T>(initialValue: T): { current: T };
	export function useState<T>(
		initialValue: T | (() => T),
	): [T, (value: T | ((previous: T) => T)) => void];
}

declare module "itmar-block-packages" {
	export function useDeepCompareEffect(
		callback: () => void | (() => void),
		dependencies: readonly unknown[],
	): void;
	export function useIsIframeMobile(): boolean;
}

declare module "@tsparticles/shape-image" {
	import type { Engine } from "@tsparticles/engine";
	export function loadImageShape(engine: Engine): Promise<void>;
}

declare module "*.scss";

declare module "*.svg" {
	export const ReactComponent: (props: Record<string, unknown>) => JSX.Element;
	const source: string;
	export default source;
}

declare const itmaroon_back_anime: {
	plugin_url: string;
};

declare namespace JSX {
	interface Element {
		type: any;
		props: any;
		key: string | null;
	}
	interface IntrinsicElements {
		[elementName: string]: any;
	}
}
