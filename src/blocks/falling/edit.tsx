import { __ } from "@wordpress/i18n";
import "./editor.scss";
import type { BlockEditProps } from "@wordpress/blocks";
import {
	tsParticles,
	type Container,
	type ISourceOptions,
	type MoveDirection,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useDeepCompareEffect } from "itmar-block-packages";

import {
	PanelBody,
	PanelRow,
	RangeControl,
	RadioControl,
} from "@wordpress/components";
import { useMemo, useRef } from "@wordpress/element";
import {
	useBlockProps,
	InspectorControls,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings,
} from "@wordpress/block-editor";
import { ShapeColorControl } from "./shape-color-control";
import { ShapeTypeControl } from "./shape-type-control";
import type { FallingAttributes } from "./types";
import { useParticleImageOptions } from "./use-particle-image-options";

let slimLoaded = false;
const ensureSlimLoaded = async () => {
	if (slimLoaded) return;
	await loadSlim(tsParticles); // slimをengine(tsParticles)へロード :contentReference[oaicite:1]{index=1}
	slimLoaded = true;
};

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps<FallingAttributes>) {
	const {
		bg_Color,
		bg_Gradient,
		number_value,
		particleImage,
		particleSize,
		poliline_num,
		linkLine_color,
		particleSpeed,
		particleDirection,
		poliline_color,
		polilineSpeed,
		paperNum,
		paperSpeed,
		paperDirection,
		paperDensity,
		shape_color,
		shapeNum,
		shapeDensity,
		shape_type,
		shapeSize,
		shapeSpeed,
		className,
	} = attributes;

	//単色かグラデーションかの選択
	const bgColor = bg_Color || bg_Gradient;
	//ブロックのスタイル設定
	const blockProps = useBlockProps({
		style: {
			position: "absolute",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0,
		},
	});
	// edit.js 内で attributes から作る想定（数値が文字列でも安全にする）
	const toNumber = (v: unknown, fallback = 0): number => {
		const n = Number(v);
		return Number.isFinite(n) ? n : fallback;
	};

	const buildTsOptions = (): ISourceOptions => {
		//パーティクルのオプション

		const particle_options: Record<string, ISourceOptions> = {
			"is-style-default": {
				fullScreen: { enable: false },
				detectRetina: true,
				particles: {
					number: {
						value: number_value,
						density: { enable: true, width: 800, height: 800 },
					},
					color: { value: "#ffffff" },
					shape: {
						type: "image",
						options: {
							image: {
								src: `${itmaroon_back_anime.plugin_url}/assets/img/${particleImage}`,
								width: 120,
								height: 120,
							},
						},
					},
					stroke: { width: 3, color: { value: "#fff" } },
					opacity: {
						value: 0.7,
						animation: {
							enable: false,
							speed: 1,
							sync: false,
						},
					},
					size: {
						value: { min: 0.1, max: Number(particleSize) }, // ← ランダムサイズ
						animation: {
							enable: false,
							speed: 20,
							sync: false,
						},
					},

					links: { enable: false },
					move: {
						enable: true,
						speed: particleSpeed,
						direction: particleDirection as MoveDirection,
						random: true,
						straight: false,
						outModes: { default: "out" },
						attract: { enable: true, rotate: { x: 300, y: 1200 } },
					},
				},
				interactivity: {
					detectsOn: "canvas",
					events: {
						onHover: { enable: false },
						onClick: { enable: false },
						resize: { enable: true },
					},
				},
			},

			"is-style-degital": {
				fullScreen: { enable: false },
				detectRetina: true,

				particles: {
					number: {
						value: toNumber(poliline_num, 0),
						density: {
							enable: true,
							width: 800, // ← 旧 value_area: 800 相当
							height: 1000, // ← 旧 factor を明示（互換メモ）
						},
					},

					color: { value: poliline_color },

					// 旧 shape.stroke は v3 では particles.stroke に寄せる
					stroke: {
						width: 1,
						color: { value: poliline_color },
						opacity: 1,
					},

					shape: {
						type: "polygon",
						options: {
							polygon: { sides: 3 }, // 旧 nb_sides: 3
						},
					},

					opacity: {
						value: 0.664994832269074,
						animation: {
							enable: true,
							speed: 2.2722661797524872,
							sync: false,
						},
					},

					size: {
						value: 3,
						animation: {
							enable: false,
							speed: 40,
							sync: false,
						},
					},

					// 旧 line_linked → v3 は links
					links: {
						enable: true,
						distance: 150,
						color: { value: linkLine_color },
						opacity: 0.6,
						width: 1,
					},

					move: {
						enable: true,
						speed: toNumber(polilineSpeed, 0),
						direction: "none",
						random: false,
						straight: false,

						// 旧 out_mode: "out" → v3 は outModes.default
						outModes: { default: "out" },

						attract: {
							enable: false,
							rotate: {
								x: 600,
								y: 961.4383117143238,
							},
						},
					},
				},

				interactivity: {
					detectsOn: "canvas",
					events: {
						onHover: { enable: false, mode: "repulse" },
						onClick: { enable: false },
						resize: { enable: true },
					},
				},
			},

			"is-style-paper": {
				fullScreen: { enable: false },
				detectRetina: true,

				particles: {
					number: {
						value: toNumber(paperNum, 0),
						density: {
							enable: true,
							width: toNumber(paperDensity, 800),
							height: 1000,
						},
					},

					color: {
						value: [
							"#EA5532",
							"#F6AD3C",
							"#FFF33F",
							"#00A95F",
							"#00ADA9",
							"#00AFEC",
							"#4D4398",
							"#E85298",
						],
					},

					stroke: {
						width: 0,
						opacity: 1,
					},

					shape: {
						type: "polygon",
						options: {
							polygon: { sides: 4 },
						},
					},

					opacity: {
						value: 1,
						animation: {
							enable: true,
							speed: 20,
							sync: false,
						},
					},

					size: {
						value: 5,
						animation: {
							enable: true,
							speed: 1,
							sync: false,
						},
					},

					links: { enable: false },

					move: {
						enable: true,
						speed: toNumber(paperSpeed, 0),
						direction: (paperDirection || "bottom") as MoveDirection,
						random: false,
						straight: false,
						outModes: { default: "out" },
						attract: {
							enable: false,
							rotate: { x: 600, y: 1200 },
						},
					},
				},

				interactivity: {
					detectsOn: "canvas",
					events: {
						onHover: { enable: false },
						onClick: { enable: false },
						resize: { enable: true },
					},
				},
			},

			"is-style-bubbly": {
				fullScreen: { enable: false },
				detectRetina: true,

				particles: {
					number: {
						value: toNumber(shapeNum, 0),
						density: {
							enable: true,
							width: toNumber(shapeDensity, 800),
							height: 1000,
						},
					},

					color: { value: shape_color },

					stroke: {
						width: 0,
						color: { value: "#000000" },
						opacity: 1,
					},

					shape: {
						type: shape_type, // "circle" | ["circle","triangle",...]
						options: {
							polygon: { sides: 5 },
							// shape_type に "image" を含めるなら、ここに image: { src, width, height } 等も必要になります
						},
					},

					opacity: {
						value: 0.5,
						animation: {
							enable: true,
							speed: 1,
							sync: false,
						},
					},

					size: {
						value: {
							min: 0.1,
							max: Number.isFinite(shapeSize) ? shapeSize : 11,
						},
						animation: {
							enable: false,
							speed: 10,
							sync: false,
						},
					},

					links: {
						enable: false,
						distance: 150,
						color: { value: "#ffffff" },
						opacity: 0.4,
						width: 1,
					},

					move: {
						enable: true,
						speed: toNumber(shapeSpeed, 0),
						direction: "none",
						random: false,
						straight: false,
						outModes: { default: "out" },
						attract: {
							enable: true,
							rotate: { x: 1000, y: 1000 },
						},
					},
				},

				interactivity: {
					detectsOn: "canvas",
					events: {
						onHover: { enable: false, mode: "bubble" },
						onClick: { enable: true, mode: "push" },
						resize: { enable: true },
					},
					modes: {
						grab: {
							distance: 300,
							links: { opacity: 1 },
						},
						bubble: {
							distance: 100,
							size: 7.5,
							duration: 2,
							opacity: 1, // 元コードは 8 でしたが、通常は 0..1 想定（hover無効なので影響なし）
							speed: 3,
						},
						repulse: { distance: 1 },
						push: { quantity: 4 }, // 旧 particles_nb: 4
						remove: { quantity: 2 }, // 旧 particles_nb: 2
					},
				},
			},
		};

		const base =
			particle_options[className ?? "is-style-default"] ||
			particle_options["is-style-default"];

		// --- 必須: 親要素からはみ出さない（fixed/top/leftを出さない） ---
		const options = {
			...base,
			fullScreen: { enable: false }, // これが無いと全画面固定になりがち :contentReference[oaicite:2]{index=2}
		};

		return options;
	};

	//パーティクルのイメージ画像リストの取得
	const imageOptions = useParticleImageOptions();

	const hostRef = useRef<HTMLDivElement | null>(null); // ここにcanvasが生成される
	const containerRef = useRef<Container | null>(null); // tsParticles Containerを保持

	const options = useMemo(() => {
		return buildTsOptions();
	}, [attributes]);

	// ✅ 生成済み options を “属性に保存”
	const optionsJson = useMemo(() => JSON.stringify(options), [options]);

	useDeepCompareEffect(() => {
		// 値が変わった時だけ保存 → ループ防止
		if (attributes.tsOptionsJson !== optionsJson) {
			setAttributes({ tsOptionsJson: optionsJson });
		}
	}, [optionsJson, attributes.tsOptionsJson]);

	useDeepCompareEffect(() => {
		let cancelled = false;

		const mount = async () => {
			const el = hostRef.current;
			if (!el) return;

			await ensureSlimLoaded();

			// 前回のインスタンスを破棄
			if (containerRef.current) {
				containerRef.current.destroy();
				containerRef.current = null;
			}
			// ブロックごとに安定したID（編集時も変わらない）
			const id = `itmar-tsparticles-editor-${clientId}`;

			// v3: element を渡せるので iframe / 非iframe を意識しなくてOK :contentReference[oaicite:3]{index=3}
			const container = await tsParticles.load({
				id,
				element: el,
				options: options,
			});

			if (cancelled) {
				container?.destroy();
				return;
			}
			containerRef.current = container ?? null;
		};

		mount();

		return () => {
			cancelled = true;
			if (containerRef.current) {
				containerRef.current.destroy();
				containerRef.current = null;
			}
		};
	}, [options, clientId]);

	return (
		<>
			<InspectorControls group="styles">
				<PanelBody
					title={__("Background Settings", "itmaroon-back-anime")}
					initialOpen={true}
					className="back_design_ctrl"
				>
					<PanelColorGradientSettings
						title={__("Background Color Setting", "itmaroon-back-anime")}
						settings={[
							{
								colorValue: bg_Color,
								gradientValue: bg_Gradient,
								colors: [
									{ name: "red", color: "#f00" },
									{ name: "white", color: "#fff" },
									{ name: "blue", color: "#00f" },
									{ name: "black", color: "#000" },
									{ name: "transparent", color: "#00000000" },
								],
								label: __("Choice color or gradient", "itmaroon-back-anime"),
								onColorChange: (newValue: string | undefined) => {
									setAttributes({
										bg_Color: newValue === undefined ? "" : newValue,
									});
								},
								onGradientChange: (newValue: string | undefined) => {
									setAttributes({ bg_Gradient: newValue });
								},
							},
						]}
					/>
				</PanelBody>
				{(className === "is-style-default" || className === undefined) && (
					<PanelBody
						title={__("Particle Settings", "itmaroon-back-anime")}
						initialOpen={true}
						className="particle_ctrl"
					>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={number_value}
								label={__("Particle Num", "itmaroon-back-anime")}
								max={500}
								min={50}
								onChange={(val: number | undefined) =>
									setAttributes({ number_value: val })
								}
								separatorType="none"
								step={10}
								withInputField={false}
							/>
						</PanelRow>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={particleSize}
								label={__("Particle Size", "itmaroon-back-anime")}
								max={20}
								min={3}
								onChange={(val: number | undefined) =>
									setAttributes({ particleSize: val })
								}
								separatorType="none"
								step={1}
								withInputField={false}
							/>
						</PanelRow>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={particleSpeed}
								label={__("Falling Speed", "itmaroon-back-anime")}
								max={10}
								min={1}
								onChange={(val: number | undefined) =>
									setAttributes({ particleSpeed: val })
								}
								separatorType="none"
								step={1}
								withInputField={false}
							/>
						</PanelRow>
						<PanelRow>
							<div className="particle_direction">
								<RadioControl
									label={__("Falling Direction", "itmaroon-back-anime")}
									selected={particleDirection}
									options={[
										{ value: "bottom" },
										{ value: "top" },
										{ value: "right" },
										{ value: "left" },
										{ value: "bottom-right" },
										{ value: "bottom-left" },
										{ value: "top-left" },
										{ value: "top-right" },
										{ value: "none" },
									]}
									onChange={(changeOption: string) => {
										setAttributes({ particleDirection: changeOption });
									}}
								/>
							</div>
						</PanelRow>
						<PanelRow>
							<div className="particle_image">
								<RadioControl
									label={__(
										"Selecting a particle image",
										"itmaroon-back-anime",
									)}
									selected={particleImage}
									options={imageOptions}
									onChange={(changeOption: string) => {
										setAttributes({ particleImage: changeOption });
									}}
								/>
							</div>
						</PanelRow>
					</PanelBody>
				)}
				{className === "is-style-degital" && (
					<PanelBody
						title={__("Polyline Settings", "itmaroon-back-anime")}
						initialOpen={true}
						className="particle_ctrl"
					>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={poliline_num}
								label={__("Polyline Num", "itmaroon-back-anime")}
								max={100}
								min={20}
								onChange={(val: number | undefined) =>
									setAttributes({ poliline_num: val })
								}
								separatorType="none"
								step={10}
								withInputField={false}
							/>
						</PanelRow>
						<PanelColorGradientSettings
							title={__("Color Setting", "itmaroon-back-anime")}
							settings={[
								{
									colorValue: poliline_color,
									label: __("Poliline line Color", "itmaroon-back-anime"),
									onColorChange: (newValue: string | undefined) =>
										setAttributes({ poliline_color: newValue }),
								},
								{
									colorValue: linkLine_color,
									label: __("Link line Color", "itmaroon-back-anime"),
									onColorChange: (newValue: string | undefined) =>
										setAttributes({ linkLine_color: newValue }),
								},
							]}
						/>

						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={polilineSpeed}
								label={__("Moving Speed", "itmaroon-back-anime")}
								max={20}
								min={3}
								onChange={(val: number | undefined) =>
									setAttributes({ polilineSpeed: val })
								}
								separatorType="none"
								step={1}
								withInputField={false}
							/>
						</PanelRow>
					</PanelBody>
				)}
				{className === "is-style-paper" && (
					<PanelBody
						title={__("Confetti Settings", "itmaroon-back-anime")}
						initialOpen={true}
						className="paper_ctrl"
					>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={paperNum}
								label={__("Confetti Num", "itmaroon-back-anime")}
								max={100}
								min={20}
								onChange={(val: number | undefined) =>
									setAttributes({ paperNum: val })
								}
								separatorType="none"
								step={10}
								withInputField={false}
							/>
						</PanelRow>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={paperDensity}
								label={__("Confetti density", "itmaroon-back-anime")}
								max={500}
								min={50}
								onChange={(val: number | undefined) =>
									setAttributes({ paperDensity: val })
								}
								separatorType="none"
								step={10}
								withInputField={false}
							/>
						</PanelRow>

						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={paperSpeed}
								label={__("The speed of the blizzard", "itmaroon-back-anime")}
								max={20}
								min={3}
								onChange={(val: number | undefined) =>
									setAttributes({ paperSpeed: val })
								}
								separatorType="none"
								step={1}
								withInputField={false}
							/>
						</PanelRow>
						<PanelRow>
							<div className="particle_direction">
								<RadioControl
									label={__("Blizzard Direction", "itmaroon-back-anime")}
									selected={paperDirection}
									options={[
										{ value: "bottom" },
										{ value: "top" },
										{ value: "right" },
										{ value: "left" },
										{ value: "bottom-right" },
										{ value: "bottom-left" },
										{ value: "top-left" },
										{ value: "top-right" },
									]}
									onChange={(changeOption: string) => {
										setAttributes({ paperDirection: changeOption });
									}}
								/>
							</div>
						</PanelRow>
					</PanelBody>
				)}

				{className === "is-style-bubbly" && (
					<PanelBody
						title={__("Shape Settings", "itmaroon-back-anime")}
						initialOpen={true}
						className="shape_ctrl"
					>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={shapeNum}
								label={__("Shape Num", "itmaroon-back-anime")}
								max={100}
								min={20}
								onChange={(val: number | undefined) =>
									setAttributes({ shapeNum: val })
								}
								separatorType="none"
								step={10}
								withInputField={false}
							/>
						</PanelRow>
						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={shapeDensity}
								label={__("Shape Density", "itmaroon-back-anime")}
								max={2000}
								min={500}
								onChange={(val: number | undefined) =>
									setAttributes({ shapeDensity: val })
								}
								separatorType="none"
								step={100}
								withInputField={false}
							/>
						</PanelRow>

						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={shapeSize}
								label={__("Shape Size", "itmaroon-back-anime")}
								max={100}
								min={10}
								onChange={(val: number | undefined) =>
									setAttributes({ shapeSize: val })
								}
								separatorType="none"
								step={10}
								withInputField={false}
							/>
						</PanelRow>

						<PanelRow className="logoSizeCtrl">
							<RangeControl
								value={shapeSpeed}
								label={__("Moving Speed", "itmaroon-back-anime")}
								max={20}
								min={3}
								onChange={(val: number | undefined) =>
									setAttributes({ shapeSpeed: val })
								}
								separatorType="none"
								step={1}
								withInputField={false}
							/>
						</PanelRow>
						<PanelRow>
							<div className="shapeType-ctrl">
								<label>
									{__("Types included in the shape", "itmaroon-back-anime")}
								</label>
								<ShapeTypeControl
									value={shape_type}
									options={["circle", "edge", "triangle", "star"]}
									onChange={(value) => setAttributes({ shape_type: value })}
								/>
							</div>
						</PanelRow>
						<PanelRow>
							<div className="shapeColor-ctrl">
								<label>
									{__("Color included in the shape", "itmaroon-back-anime")}
								</label>
								<ShapeColorControl
									value={shape_color}
									onChange={(value) => setAttributes({ shape_color: value })}
								/>
							</div>
						</PanelRow>
					</PanelBody>
				)}
			</InspectorControls>

			<div {...blockProps}>
				<div
					ref={hostRef}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
						zIndex: 0,
						background: bgColor,
					}}
				/>
			</div>
		</>
	);
}
