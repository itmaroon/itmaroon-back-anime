import { useEffect, useState } from "@wordpress/element";

export interface ParticleImageOption {
	label: JSX.Element;
	value: string;
}

export function useParticleImageOptions(): ParticleImageOption[] {
	const [imageOptions, setImageOptions] = useState<ParticleImageOption[]>([]);

	useEffect(() => {
		const abortController = new AbortController();

		const fetchImageOptions = async () => {
			try {
				const response = await fetch(
					`${back_anime.plugin_url}/build/fileList.json`,
					{ signal: abortController.signal },
				);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const data: unknown = await response.json();
				if (!Array.isArray(data) || !data.every((item) => typeof item === "string")) {
					throw new TypeError("fileList.json must contain an array of strings.");
				}

				setImageOptions(
					data.map((fileName) => ({
						label: (
							<div
								style={{
									background: `url(${back_anime.plugin_url}/assets/img/${fileName}) no-repeat center center / cover`,
								}}
							/>
						),
						value: fileName,
					})),
				);
			} catch (error) {
				if (!abortController.signal.aborted) {
					console.error("Failed to load particle image options:", error);
				}
			}
		};

		void fetchImageOptions();
		return () => abortController.abort();
	}, []);

	return imageOptions;
}
