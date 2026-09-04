"use client";

import { X } from "lucide-react";

export interface ModelSettingsState {
  topK: number;
  topP: number;
  maxOutputTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequence: string;
  seed: string;
}

export const DEFAULT_MODEL_SETTINGS: ModelSettingsState = {
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stopSequence: "",
  seed: "",
};

const TOP_K_OPTIONS = [1, 5, 10, 20, 40, 64];
const TOP_P_OPTIONS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0];
const OUTPUT_TOKEN_OPTIONS = [256, 512, 1024, 2048, 4096, 8192];
const STOP_SEQUENCE_OPTIONS = ["", "\\n\\n", "###", "STOP", "END"];
const SEED_OPTIONS = ["", "0", "1", "42", "100", "12345"];

interface ModelSettingsProps {
  open: boolean;
  settings: ModelSettingsState;
  onChange: (settings: ModelSettingsState) => void;
  onClose: () => void;
}

export default function ModelSettings({ open, settings, onChange, onClose }: ModelSettingsProps) {
  const update = <K extends keyof ModelSettingsState>(key: K, value: ModelSettingsState[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const selectClass =
    "w-full rounded-xl border border-[#1e3a5f]/12 bg-[#f3f6fa] px-3 py-2 text-sm text-[#1e3348] outline-none focus:border-[#e8829e]";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#1e3a5f]";

  return (
    <div
      className={`flex flex-col border-l border-[#1e3a5f]/10 bg-white transition-all duration-300 ${
        open ? "w-80" : "w-0"
      } overflow-hidden`}
    >
      <div className="flex items-center justify-between border-b border-[#1e3a5f]/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Model Settings</h2>
        <button
          onClick={onClose}
          aria-label="Close model settings"
          className="rounded-lg p-1.5 text-[#8ba0bb] transition-colors hover:bg-[#1e3a5f]/8 hover:text-[#1e3a5f]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <div>
          <label className={labelClass}>Top K</label>
          <select
            className={selectClass}
            value={settings.topK}
            onChange={(e) => update("topK", Number(e.target.value))}
          >
            {TOP_K_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Top P</label>
          <select
            className={selectClass}
            value={settings.topP}
            onChange={(e) => update("topP", Number(e.target.value))}
          >
            {TOP_P_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Output Token</label>
          <select
            className={selectClass}
            value={settings.maxOutputTokens}
            onChange={(e) => update("maxOutputTokens", Number(e.target.value))}
          >
            {OUTPUT_TOKEN_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-[#1e3a5f]">Frequency Penalty</label>
            <span className="text-sm text-[#5b7290]">{settings.frequencyPenalty.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.1}
            value={settings.frequencyPenalty}
            onChange={(e) => update("frequencyPenalty", Number(e.target.value))}
            className="w-full accent-[#1f7a6c]"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-[#1e3a5f]">Presence Penalty</label>
            <span className="text-sm text-[#5b7290]">{settings.presencePenalty.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.1}
            value={settings.presencePenalty}
            onChange={(e) => update("presencePenalty", Number(e.target.value))}
            className="w-full accent-[#1f7a6c]"
          />
        </div>

        <div className="border-t border-[#1e3a5f]/10 pt-5">
          <label className={labelClass}>Stop Sequence</label>
          <select
            className={selectClass}
            value={settings.stopSequence}
            onChange={(e) => update("stopSequence", e.target.value)}
          >
            <option value="">None</option>
            {STOP_SEQUENCE_OPTIONS.filter((v) => v).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Seed</label>
          <select
            className={selectClass}
            value={settings.seed}
            onChange={(e) => update("seed", e.target.value)}
          >
            <option value="">Random</option>
            {SEED_OPTIONS.filter((v) => v).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
