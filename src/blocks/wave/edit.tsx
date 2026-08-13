import { __ } from "@wordpress/i18n";
import "./editor.scss";

import type { BlockEditProps } from "@wordpress/blocks";
import { useRef, useMemo } from "@wordpress/element";
import {
	useDeepCompareEffect,
	useIsIframeMobile,
} from "itmar-block-packages";

import {
	PanelBody,
	PanelRow,
	RangeControl,
	RadioControl,
	ToggleControl,
} from "@wordpress/components";
import {
	useBlockProps,
	InspectorControls,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings,
} from "@wordpress/block-editor";

import type { WaveAttributes, WavePlacement } from "./types";

function getCanvasStyle(
	placement: WavePlacement,
	thickness: number,
): Record<string, string | number> {
	const t = Math.max(1, Number(thickness) || 200);

	const base = {
		position: "absolute",
		pointerEvents: "none",
		display: "block",
	};
	switch (placement) {
		case "top":
			return {
				...base,
				top: 0,
				left: 0,
				right: 0,
				height: `${t}px`,
				width: "100%",
			};
		case "bottom":
			return {
				...base,
				bottom: 0,
				left: 0,
				right: 0,
				height: `${t}px`,
				width: "100%",
			};
		case "left":
			return {
				...base,
				top: 0,
				bottom: 0,
				left: 0,
				width: `${t}px`,
				height: "100%",
			};
		case "right":
			return {
				...base,
				top: 0,
				bottom: 0,
				right: 0,
				width: `${t}px`,
				height: "100%",
			};
		default:
			return {
				...base,
				bottom: 0,
				left: 0,
				right: 0,
				height: `${t}px`,
				width: "100%",
			};
	}
}

// canvas の“表示サイズ”に合わせて実ピクセルを設定（上下左右どれでもOK）
function setupCanvasSize(canvas: HTMLCanvasElement) {
	const rect = canvas.getBoundingClientRect();
	const cssW = Math.max(1, Math.floor(rect.width));
	const cssH = Math.max(1, Math.floor(rect.height));
	const dpr = window.devicePixelRatio || 1;

	canvas.width = Math.floor(cssW * dpr);
	canvas.height = Math.floor(cssH * dpr);

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("A 2D canvas context is not available.");
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	return { cssW, cssH, dpr, ctx };
}

// 「波が親要素の内側へ向く」向きに揃える transform
// ここでは “top=下向き、bottom=上向き、left=右向き、right=左向き” にしています
function applyPlacementTransform(
	ctx: CanvasRenderingContext2D,
	placement: WavePlacement,
	cssW: number,
	cssH: number,
) {
	// 戻り値は「描画ロジック上の横幅/縦幅（回転時は入れ替え）」
	switch (placement) {
		case "bottom":
			// そのまま（塗りが下方向）
			return { w: cssW, h: cssH };

		case "top":
			// 上向きにする（上下反転）
			ctx.translate(0, cssH);
			ctx.scale(1, -1);
			return { w: cssW, h: cssH };
		case "left":
			// 右向きにする（90°回転）
			ctx.translate(cssW, 0);
			ctx.rotate(Math.PI / 2);
			return { w: cssH, h: cssW };

		case "right":
			// 左向きにする（-90°回転）
			ctx.translate(0, cssH);
			ctx.rotate(-Math.PI / 2);
			return { w: cssH, h: cssW };

		default:
			return { w: cssW, h: cssH };
	}
}

export default function Edit({
	attributes,
	setAttributes,
}: BlockEditProps<WaveAttributes>) {
	const {
		first_Color,
		second_Color,
		is_mulutiwave,
		placement,
		default_val,
		mobile_val,
	} = attributes;

	//モバイルの判定
	const isMobile = useIsIframeMobile();

	// ブロックDOM / canvas を直接掴む（idで取らない）
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// ループ/状態管理
	const rafIdRef = useRef(0);
	const lastTsRef = useRef(0);
	const timeRef = useRef({ seconds: 0 });

	// サイズ/ctxキャッシュ
	const renderRef = useRef<{
		cssW: number;
		cssH: number;
		dpr: number;
		ctx: CanvasRenderingContext2D | null;
	}>({ cssW: 0, cssH: 0, dpr: 1, ctx: null });
	const resizeFnRef = useRef<(() => void) | null>(null);
	//レスポンシブデザイン
	const wave_height = !isMobile
		? default_val.wave_height
		: mobile_val.wave_height;
	const first_wave_size = !isMobile
		? default_val.first_wave_size
		: mobile_val.first_wave_size;
	const second_wave_size = !isMobile
		? default_val.second_wave_size
		: mobile_val.second_wave_size;

	// 設定は ref に入れて、属性変更時に差し替える（ループは増やさない）
	const settings = useMemo(
		() => ({
			firstColor: first_Color,
			secondColor: second_Color,
			isMulti: !!is_mulutiwave,
			thickness: Number(wave_height) || 200,
			zoom1: Number(first_wave_size) || 3,
			zoom2: Number(second_wave_size) || 3,
			placement: placement || "bottom",
		}),
		[
			first_Color,
			second_Color,
			is_mulutiwave,
			wave_height,
			first_wave_size,
			second_wave_size,
			placement,
		],
	);
	const settingsRef = useRef(settings);
	settingsRef.current = settings;

	// 初期化：canvasのサイズ調整とアニメーション開始（1回だけ）
	useDeepCompareEffect(() => {
		const canvas = canvasRef.current;
		const wrapper = wrapperRef.current;

		if (!canvas || !wrapper) return;

		const unit = 100;
		const SPEED_PER_MS = 0.0004;

		const resize = () => {
			// rect が 0 になるケース（ブロックが空など）への保険
			const rect = canvas.getBoundingClientRect();
			if (!rect.width || !rect.height) return;

			renderRef.current = setupCanvasSize(canvas);
		};
		resizeFnRef.current = resize;
		resize();

		// ブロックのサイズ変化（インスペクター変更・レスポンシブ）に追従
		let ro = null;
		if ("ResizeObserver" in window) {
			ro = new ResizeObserver(() => resize());
			ro.observe(wrapper);
		}

		const drawSine = (
			ctx: CanvasRenderingContext2D,
			w: number,
			h: number,
			t: number,
			zoom: number,
			delay: number,
		) => {
			const xAxis = Math.floor(h / 2);
			const yAxis = 0;

			let x = t;
			let y = Math.sin(x) / zoom;

			ctx.moveTo(yAxis, unit * y + xAxis);

			for (let i = yAxis; i <= w + 10; i += 10) {
				x = t + (i - yAxis) / unit / zoom;
				y = Math.sin(x - delay) / 3;
				ctx.lineTo(i, unit * y + xAxis);
			}
		};

		const drawWave = (
			ctx: CanvasRenderingContext2D,
			w: number,
			h: number,
			color: string,
			alpha: number,
			zoom: number,
			delay: number,
			t: number,
		) => {
			ctx.save();
			ctx.fillStyle = color || "#000";
			ctx.globalAlpha = alpha;

			ctx.beginPath();
			drawSine(ctx, w, h, t / 0.5, zoom, delay);
			ctx.lineTo(w + 10, h);
			ctx.lineTo(0, h);
			ctx.closePath();
			ctx.fill();

			ctx.restore();
		};

		const tick = (ts: number) => {
			const { ctx, cssW, cssH, dpr } = renderRef.current;
			if (!ctx || !cssW || !cssH) {
				rafIdRef.current = requestAnimationFrame(tick);
				return;
			}
			const s = settingsRef.current;

			const last = lastTsRef.current || ts;
			const delta = ts - last;
			lastTsRef.current = ts;

			timeRef.current.seconds += delta * SPEED_PER_MS;
			const t = timeRef.current.seconds * Math.PI;

			// まず素の座標系（DPR込み）に戻してクリア
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, cssW, cssH);

			// placement に応じて向きを変えて描画
			ctx.save();
			const { w: logicalW, h: logicalH } = applyPlacementTransform(
				ctx,
				s.placement,
				cssW,
				cssH,
			);

			drawWave(ctx, logicalW, logicalH, s.firstColor, 0.5, s.zoom1, 0, t);
			if (s.isMulti) {
				drawWave(ctx, logicalW, logicalH, s.secondColor, 0.4, s.zoom2, 250, t);
			}

			ctx.restore();

			rafIdRef.current = requestAnimationFrame(tick);
		};

		// 開始
		rafIdRef.current = requestAnimationFrame(tick);

		// cleanup
		return () => {
			if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = 0;
			lastTsRef.current = 0;
			timeRef.current.seconds = 0;

			if (ro) ro.disconnect();
			resizeFnRef.current = null;
		};
	}, []); // ← ループは1回だけ起動

	// placement / wave_height が変わったら、CSSサイズが変わるので resize だけ実行（ループは増やさない）
	useDeepCompareEffect(() => {
		resizeFnRef.current?.();
	}, [settings.placement, settings.thickness]);

	// ブロック本体は relative に（canvas を内側に固定）
	const blockProps = useBlockProps({
		ref: wrapperRef,
		style: {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			margin: 0,
			padding: 0,
			zIndex: 0,
		},
	});

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__("Global Settings", "itmaroon-back-anime")}
					initialOpen={true}
					className="back_design_ctrl"
				>
					<PanelRow>
						<ToggleControl
							label={__("Double the waves", "itmaroon-back-anime")}
							checked={is_mulutiwave}
							onChange={(val: boolean) =>
								setAttributes({ is_mulutiwave: val })
							}
						/>
					</PanelRow>
					<PanelRow className="logoSizeCtrl">
						<RangeControl
							value={
								!isMobile ? default_val.wave_height : mobile_val.wave_height
							}
							label={
								!isMobile
									? __("Wave Height(desk top)", "itmaroon-back-anime")
									: __("Wave Height(mobile)", "itmaroon-back-anime")
							}
							max={500}
							min={50}
							onChange={(val: number) => {
								if (!isMobile) {
									setAttributes({
										default_val: { ...default_val, wave_height: val },
									});
								} else {
									setAttributes({
										mobile_val: { ...mobile_val, wave_height: val },
									});
								}
							}}
							separatorType="none"
							step={10}
							withInputField={false}
						/>
					</PanelRow>
					<PanelRow>
						<div className="itmar_wave_placement">
							<RadioControl
								label={__("Placement", "itmaroon-back-anime")}
								selected={placement}
								options={[
									{ label: __("Top", "itmaroon-back-anime"), value: "top" },
									{ label: __("Right", "itmaroon-back-anime"), value: "right" },
									{ label: __("Bottom", "itmaroon-back-anime"), value: "bottom" },
									{ label: __("Left", "itmaroon-back-anime"), value: "left" },
								]}
								onChange={(changeOption: WavePlacement) => {
									setAttributes({ placement: changeOption });
								}}
							/>
						</div>
					</PanelRow>
				</PanelBody>

				<PanelBody
					title={__("Wave 1 Setup", "itmaroon-back-anime")}
					initialOpen={true}
					className="back_design_ctrl"
				>
					<PanelColorGradientSettings
						title={__("Background Color Setting", "itmaroon-back-anime")}
						settings={[
							{
								colorValue: first_Color,
								label: __("Choice color", "itmaroon-back-anime"),
								onColorChange: (newValue: string | undefined) => {
									setAttributes({
										first_Color: newValue === undefined ? "" : newValue,
									});
								},
							},
						]}
					/>
					<PanelRow className="logoSizeCtrl">
						<RangeControl
							value={
								!isMobile
									? default_val.first_wave_size
									: mobile_val.first_wave_size
							}
							label={
								!isMobile
									? __("Wave Size(desk top)", "itmaroon-back-anime")
									: __("Wave Size(mobile)", "itmaroon-back-anime")
							}
							onChange={(val: number) => {
								if (!isMobile) {
									setAttributes({
										default_val: { ...default_val, first_wave_size: val },
									});
								} else {
									setAttributes({
										mobile_val: { ...mobile_val, first_wave_size: val },
									});
								}
							}}
							max={5}
							min={0.5}
							separatorType="none"
							step={0.5}
							withInputField={false}
						/>
					</PanelRow>
				</PanelBody>

				{is_mulutiwave && (
					<PanelBody
						title={__("Wave 2 Setup", "itmaroon-back-anime")}
						initialOpen={true}
						className="back_design_ctrl"
					>
						<PanelColorGradientSettings
							title={__("Background Color Setting", "itmaroon-back-anime")}
							settings={[
								{
									colorValue: second_Color,
									label: __("Choice color", "itmaroon-back-anime"),
									onColorChange: (newValue: string | undefined) => {
										setAttributes({
											second_Color: newValue === undefined ? "" : newValue,
										});
									},
								},
							]}
						/>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={
									!isMobile
										? default_val.second_wave_size
										: mobile_val.second_wave_size
								}
								label={
									!isMobile
										? __("Wave Size(desk top)", "itmaroon-back-anime")
										: __("Wave Size(mobile)", "itmaroon-back-anime")
								}
								onChange={(val: number) => {
									if (!isMobile) {
										setAttributes({
											default_val: { ...default_val, second_wave_size: val },
										});
									} else {
										setAttributes({
											mobile_val: { ...mobile_val, second_wave_size: val },
										});
									}
								}}
								max={5}
								min={0.5}
								separatorType="none"
								step={0.5}
								withInputField={false}
							/>
						</PanelRow>
					</PanelBody>
				)}
			</InspectorControls>

			<div {...blockProps}>
				<canvas
					ref={canvasRef}
					style={getCanvasStyle(settings.placement, settings.thickness)}
					aria-hidden="true"
				/>
			</div>
		</>
	);
}
