/**
 * Frontend initializer for itmar/falling
 *
 * Required deps:
 *  - @tsparticles/engine
 *  - @tsparticles/slim
 *  - @tsparticles/shape-image   (needed if using shape.type="image")
 *  - @tsparticles/pjs           (optional, for particles.js options compatibility)
 */

import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { loadImageShape } from "@tsparticles/shape-image";
import { initPjs } from "@tsparticles/pjs";

const SELECTOR = "[data-particle_option]";
const initialized = new WeakSet();

let engineReadyPromise;

/**
 * particles.js 互換 + slim + image shape を1回だけロード
 */
async function ensureEngineReady() {
	if (!engineReadyPromise) {
		engineReadyPromise = (async () => {
			await loadSlim(tsParticles); // slim bundle loader :contentReference[oaicite:13]{index=13}
			await loadImageShape(tsParticles); // image shape loader :contentReference[oaicite:14]{index=14}
			initPjs(tsParticles); // particles.js compatibility :contentReference[oaicite:15]{index=15}
		})();
	}

	return engineReadyPromise;
}

function isNumericString(v) {
	return typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v.trim());
}

/**
 * save.js 側で `${number}` のように文字列化されてる値が多いので
 * JSON を再帰的に走査して「数値っぽい文字列」を Number に戻します。
 */
function coerceNumericStrings(value) {
	if (Array.isArray(value)) {
		return value.map(coerceNumericStrings);
	}
	if (value && typeof value === "object") {
		const out = {};
		for (const [k, v] of Object.entries(value)) {
			out[k] = coerceNumericStrings(v);
		}
		return out;
	}
	if (isNumericString(value)) {
		return Number(value);
	}
	return value;
}

function safeParseOptions(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		return coerceNumericStrings(parsed);
	} catch (e) {
		// 何か壊れてたら落とす（フロント崩壊防止）
		return null;
	}
}

function makeUniqueId(index) {
	return `itmar-tsparticles-${index}-${Math.random().toString(36).slice(2, 9)}`;
}

function destroyIfExists(id) {
	// 既に動いている同IDのContainerがあれば破棄（念のため）
	const containers = tsParticles.dom(); // Container[] :contentReference[oaicite:16]{index=16}
	for (const c of containers) {
		if (c?.id === id) {
			c.destroy(true); // destroy(remove=true) :contentReference[oaicite:17]{index=17}
		}
	}
}

async function mountOne(el, index) {
	if (initialized.has(el)) return;

	const raw = el.getAttribute("data-particle_option");
	const options = safeParseOptions(raw);

	if (!options) return;

	initialized.add(el);

	// 固定ID衝突を避けるため、必ずユニークIDを付与
	const id = makeUniqueId(index);
	el.id = id;

	destroyIfExists(id);

	// v3 は object 引数で load する例が公式にもあります :contentReference[oaicite:18]{index=18}
	const container = await tsParticles.load({
		id,
		options,
	});

	// 要素サイズが動的に変わるテーマ対策（任意）
	if (container && "ResizeObserver" in window) {
		const ro = new ResizeObserver(() => {
			// refresh() は stop/start のショートカット :contentReference[oaicite:19]{index=19}
			container.refresh?.();
		});
		ro.observe(el);
	}
}

async function initAll() {
	const elements = Array.from(document.querySelectorAll(SELECTOR));

	if (!elements.length) return;

	await ensureEngineReady();

	await Promise.all(elements.map((el, i) => mountOne(el, i)));
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initAll, { once: true });
} else {
	initAll();
}
