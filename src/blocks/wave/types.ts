export type WavePlacement = "top" | "right" | "bottom" | "left";

export interface ResponsiveWaveSettings {
	wave_height: number;
	first_wave_size: number;
	second_wave_size: number;
}

export interface WaveAttributes {
	first_Color: string;
	second_Color: string;
	is_mulutiwave: boolean;
	placement: WavePlacement;
	default_val: ResponsiveWaveSettings;
	mobile_val: ResponsiveWaveSettings;
}

export interface WavePayload extends WaveAttributes {
	wave_height?: number;
	first_wave_size?: number;
	second_wave_size?: number;
}
