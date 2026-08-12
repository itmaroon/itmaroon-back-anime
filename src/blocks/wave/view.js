const SELECTOR = "canvas.itmar-wave-canvas[data-wave_option]";
const instances = new WeakMap();

function safeParse(json) {
	try {
		return JSON.parse(json);
	} catch {
		return null;
	}
}

function isPositioned(el) {
	const pos = window.getComputedStyle(el).position;
	return pos && pos !== "static";
}

// 「このブロックの背景」を貼り付ける先（positioned 祖先）を探す
// 見つからなければ null（= フォールバック）
function findNearestPositionedAncestor(el) {
	let cur = el.parentElement;
	while (cur) {
		if (isPositioned(cur)) return cur;
		cur = cur.parentElement;
	}
	return null;
}

function applyWrapperAsOverlay(wrapper, positionedAncestor) {
	// wrapper 自体を overlay 化（親スタイルは触らない）
	// ※ wrapper の containing block は “最も近い positioned 祖先” になる
	wrapper.style.position = "absolute";
	wrapper.style.inset = "0";
	wrapper.style.width = "100%";
	wrapper.style.height = "100%";
	wrapper.style.margin = "0";
	wrapper.style.padding = "0";
	wrapper.style.pointerEvents = "none";
	wrapper.style.zIndex = "0";
	// クリッピングしたいなら wrapper.style.overflow = "hidden" を有効に
	// wrapper.style.overflow = "hidden";
}

function applyWrapperFallback(wrapper, opt) {
	// positioned 祖先が無い場合、absolute にすると viewport に貼り付くので危険
	// → ブロック内（通常フロー）で最低限描画できる形にする
	wrapper.style.position = "relative";
	wrapper.style.pointerEvents = "none";
	wrapper.style.zIndex = "0";

	// 背景としては理想ではないが、事故を避けるため “高さ” を確保
	// ここを 0 にすると見えなくなるので、設定値を使う
	const t = Math.max(1, Number(opt.wave_height) || 200);
	wrapper.style.minHeight = `${t}px`;
}

function getCanvasStyle(placement, waveHeight, overlayMode) {
	const thickness = Math.max(1, Number(waveHeight) || 200);

	const base = {
		position: overlayMode ? "absolute" : "relative",
		pointerEvents: "none",
		display: "block",
	};

	// overlayMode=true の時は “親いっぱい(inset:0)のwrapper” に対して貼り付け
	// overlayMode=false の時は “ブロック内” の扱いになるので、上下はOK / 左右は制約あり
	switch (placement) {
		case "top":
			return {
				...base,
				top: 0,
				left: 0,
				right: 0,
				height: `${thickness}px`,
				width: "100%",
			};
		case "bottom":
			return {
				...base,
				bottom: 0,
				left: 0,
				right: 0,
				height: `${thickness}px`,
				width: "100%",
			};
		case "left":
			return overlayMode
				? {
						...base,
						top: 0,
						bottom: 0,
						left: 0,
						width: `${thickness}px`,
						height: "100%",
				  }
				: { ...base, width: `${thickness}px`, height: "100%" };
		case "right":
			return overlayMode
				? {
						...base,
						top: 0,
						bottom: 0,
						right: 0,
						width: `${thickness}px`,
						height: "100%",
				  }
				: { ...base, width: `${thickness}px`, height: "100%" };
		default:
			return {
				...base,
				bottom: 0,
				left: 0,
				right: 0,
				height: `${thickness}px`,
				width: "100%",
			};
	}
}

function setupCanvasSize(canvas) {
	const rect = canvas.getBoundingClientRect();
	const cssW = Math.max(1, Math.floor(rect.width));
	const cssH = Math.max(1, Math.floor(rect.height));
	const dpr = window.devicePixelRatio || 1;

	canvas.width = Math.floor(cssW * dpr);
	canvas.height = Math.floor(cssH * dpr);

	const ctx = canvas.getContext("2d");
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	return { cssW, cssH, dpr, ctx };
}

// 「波がコンテナ内側へ向く」向きに揃える
function applyPlacementTransform(ctx, placement, cssW, cssH) {
	switch (placement) {
		case "bottom":
			// 下向き（そのまま）
			return { w: cssW, h: cssH };

		case "top":
			// 上向き（上下反転）
			ctx.translate(0, cssH);
			ctx.scale(1, -1);
			return { w: cssW, h: cssH };

		case "left":
			// 右向き（+90°回転）
			ctx.translate(cssW, 0);
			ctx.rotate(Math.PI / 2);
			return { w: cssH, h: cssW };

		case "right":
			// 左向き（-90°回転）
			ctx.translate(0, cssH);
			ctx.rotate(-Math.PI / 2);
			return { w: cssH, h: cssW };

		default:
			return { w: cssW, h: cssH };
	}
}

function startWave(canvas, opt) {
	//スマホ対応
	let responsive = resolveResponsive(opt);

	// 既存の実行があれば止める（多重起動防止）
	const prev = instances.get(canvas);
	if (prev) prev.destroy();

	const wrapper = canvas.parentElement; // save.js の wrapper div

	// overlay できるか（近い positioned 祖先があるか）
	const positionedAncestor = findNearestPositionedAncestor(wrapper);
	const overlayMode = Boolean(positionedAncestor);

	if (overlayMode) {
		applyWrapperAsOverlay(wrapper, positionedAncestor);
	} else {
		applyWrapperFallback(wrapper, opt);
		// “背景化できません” は開発時だけ気づけるように
		// console.warn("[itmar-wave] Positioned ancestor not found. Falling back to in-block rendering.");
	}

	// canvas の CSS 配置（先に当ててから rect を取る）
	const placement = opt.placement || "bottom";
	Object.assign(
		canvas.style,
		getCanvasStyle(placement, responsive.wave_height, overlayMode),
	);
	canvas.setAttribute("aria-hidden", "true");

	const unit = 100;
	const SPEED_PER_MS = 0.0004; // edit と揃える

	let rafId = 0;
	let lastTs = 0;
	let seconds = 0;

	// サイズ・ctx キャッシュ
	let render = null;

	const resize = () => {
		// CSS反映後に rect を取る
		render = setupCanvasSize(canvas);
	};

	const handleResponsiveChange = () => {
		const next = resolveResponsive(opt);
		// 「mobile/desktop が切り替わった」or「数値が変わった」なら更新
		const changed =
			next.mobile !== responsive.mobile ||
			next.wave_height !== responsive.wave_height ||
			next.first_wave_size !== responsive.first_wave_size ||
			next.second_wave_size !== responsive.second_wave_size;

		if (!changed) return;

		responsive = next;

		// wave_height が変わると canvas の表示サイズが変わるので CSS → resize
		Object.assign(
			canvas.style,
			getCanvasStyle(placement, responsive.wave_height, overlayMode),
		);
		resize();
	};
	window.addEventListener("resize", handleResponsiveChange, { passive: true });

	const drawSine = (ctx, w, h, t, zoom, delay) => {
		const xAxis = Math.floor(h / 2);
		let x = t;
		let y = Math.sin(x) / zoom;

		ctx.moveTo(0, unit * y + xAxis);

		for (let i = 0; i <= w + 10; i += 10) {
			x = t + i / unit / zoom;
			y = Math.sin(x - delay) / 3;
			ctx.lineTo(i, unit * y + xAxis);
		}
	};

	const drawWave = (ctx, w, h, color, alpha, zoom, delay, t) => {
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

	// 初期リサイズ（1フレーム遅らせると rect が安定しやすい）
	requestAnimationFrame(() => {
		resize();
	});

	// サイズ変化追従：overlay の時は positionedAncestor を監視するのが安定
	let ro = null;
	if ("ResizeObserver" in window) {
		const observeTarget = overlayMode ? positionedAncestor : wrapper;
		if (observeTarget) {
			ro = new ResizeObserver(() => resize());
			ro.observe(observeTarget);
		}
	}

	const tick = (ts) => {
		if (!render || !render.ctx) {
			rafId = requestAnimationFrame(tick);
			return;
		}

		const { ctx, cssW, cssH, dpr } = render;

		const delta = ts - (lastTs || ts);
		lastTs = ts;

		seconds += delta * SPEED_PER_MS;
		const t = seconds * Math.PI;

		// clear
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, cssW, cssH);

		// placement transform
		ctx.save();
		const { w, h } = applyPlacementTransform(ctx, placement, cssW, cssH);

		const zoom1 = Number(responsive.first_wave_size) || 3;
		const zoom2 = Number(responsive.second_wave_size) || 3;

		drawWave(ctx, w, h, opt.first_Color, 0.5, zoom1, 0, t);
		if (opt.is_mulutiwave) {
			drawWave(ctx, w, h, opt.second_Color, 0.4, zoom2, 250, t);
		}

		ctx.restore();

		rafId = requestAnimationFrame(tick);
	};

	rafId = requestAnimationFrame(tick);

	const destroy = () => {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = 0;
		if (ro) ro.disconnect();
		ro = null;
		window.removeEventListener("resize", handleResponsiveChange);
	};

	instances.set(canvas, { destroy });
}

//レスポンシブ対応
function isMobileNow() {
	return window.matchMedia("(max-width: 782px)").matches;
}

function resolveResponsive(opt) {
	const mobile = isMobileNow();
	const base = mobile ? opt.mobile_val : opt.default_val;

	// フォールバック（古い payload でも壊れないように）
	const wave_height = Number(base?.wave_height ?? opt.wave_height ?? 200);

	const first_wave_size = Number(
		base?.first_wave_size ?? opt.first_wave_size ?? 3,
	);

	const second_wave_size = Number(
		base?.second_wave_size ?? opt.second_wave_size ?? 2,
	);

	return { mobile, wave_height, first_wave_size, second_wave_size };
}

//スタートポイント
function initAll() {
	document.querySelectorAll(SELECTOR).forEach((canvas) => {
		const opt = safeParse(canvas.getAttribute("data-wave_option"));
		if (!opt) return;
		startWave(canvas, opt);
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initAll, { once: true });
} else {
	initAll();
}
