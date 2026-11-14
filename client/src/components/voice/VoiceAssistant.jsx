import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  Globe,
  Radio
} from 'lucide-react';
import { voiceAssistant, LANGUAGES } from '../../services/voice/voiceAssistant';

export default function VoiceAssistant({ className = '' }) {
  const [voiceState, setVoiceState] = useState(voiceAssistant.getState());
  const [activities, setActivities] = useState(() => voiceAssistant.getActivityLogs());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = voiceAssistant.subscribe((state) => {
      setVoiceState(state);
    });

    const handleActivitiesUpdated = () => {
      setActivities(voiceAssistant.getActivityLogs());
    };

    window.addEventListener('qrshield_voice_activity_updated', handleActivitiesUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('qrshield_voice_activity_updated', handleActivitiesUpdated);
    };
  }, []);

  const { language, enabled, muted, volume, state, engine, currentText, currentResultType } = voiceState;

  const handleLanguageChange = (langId) => {
    voiceAssistant.setLanguage(langId);
  };

  const handleToggleEnabled = () => {
    voiceAssistant.setEnabled(!enabled);
  };

  const handleToggleMute = () => {
    voiceAssistant.setMuted(!muted);
  };

  const handleVolumeChange = (e) => {
    voiceAssistant.setVolume(parseFloat(e.target.value));
  };

  const handlePlayPause = () => {
    if (state === 'speaking') {
      voiceAssistant.pause();
    } else if (state === 'paused') {
      voiceAssistant.resume();
    } else {
      voiceAssistant.replay();
    }
  };

  const handleReplay = () => {
    voiceAssistant.replay();
  };

  const handlePlayPreview = (type = 'safe') => {
    voiceAssistant.playPreview(type);
  };

  const handleClearHistory = () => {
    voiceAssistant.clearActivityLogs();
  };

  // State Badge Label and Style
  const stateBadgeConfig = {
    ready: { label: 'Ready', bg: 'bg-canvas-subtle dark:bg-dark-secondary text-content-secondary dark:text-dark-secondaryText border-border dark:border-dark-border' },
    generating: { label: 'Generating Voice...', bg: 'bg-brand-teal/10 text-brand-teal border-brand-teal/30 animate-pulse' },
    speaking: { label: 'Speaking', bg: 'bg-status-success-bg text-status-success border-status-success-border font-semibold' },
    paused: { label: 'Paused', bg: 'bg-status-warning-bg text-status-warning-text border-status-warning-border' },
    completed: { label: 'Completed', bg: 'bg-canvas-subtle dark:bg-dark-secondary text-content-muted dark:text-dark-muted border-border dark:border-dark-border' },
    error: { label: 'Speech Fallback Active', bg: 'bg-status-danger-bg text-status-danger-text border-status-danger-border' }
  }[state] || { label: 'Ready', bg: 'bg-canvas-subtle text-content-secondary border-border' };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevation transition-all ${className}`}>
      {/* 1. Header Bar: Title, Status Badge & Master Toggle */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-border dark:border-dark-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center flex-shrink-0 shadow-subtle">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-bold text-content-primary dark:text-dark-primary tracking-tight">
                AI Voice Assistant
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${stateBadgeConfig.bg}`}>
                {stateBadgeConfig.label}
              </span>
            </div>
            <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText">
              ElevenLabs multilingual verbal announcements
            </p>
          </div>
        </div>

        {/* Enable / Disable Switch */}
        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <span className="text-[11px] font-medium text-content-muted dark:text-dark-muted hidden sm:inline">
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggleEnabled}
              className="sr-only peer"
              aria-label="Toggle Voice Assistant"
            />
            <div className="w-9 h-5 bg-canvas-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-teal border border-border dark:border-dark-border" />
          </div>
        </label>
      </div>

      {/* 2. Language Selector Row */}
      <div className="pt-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-content-secondary dark:text-dark-secondaryText flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-brand-teal" />
            <span>Announcement Language</span>
          </span>
          <span className="text-[10px] font-mono text-content-muted dark:text-dark-muted">
            Auto-persisted
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleLanguageChange(lang.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center space-y-0.5 border ${
                  isSelected
                    ? 'bg-brand-teal text-white border-brand-teal shadow-subtle'
                    : 'bg-canvas-subtle dark:bg-dark-secondary text-content-primary dark:text-dark-primary border-border dark:border-dark-border hover:border-brand-teal/50'
                }`}
              >
                <span className="font-semibold">{lang.native}</span>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-content-muted dark:text-dark-muted'}`}>
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Test Audio Preview & Engine Indicator */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => handlePlayPreview('safe')}
            disabled={!enabled || state === 'generating' || state === 'speaking'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/30 transition-all disabled:opacity-50 shadow-subtle"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test {LANGUAGES.find(l => l.id === language)?.label || 'Voice'} Audio</span>
          </button>

          {/* Active Voice Engine Badge */}
          <div className="flex items-center space-x-1.5 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${engine === 'elevenlabs' ? 'bg-status-success animate-pulse' : 'bg-status-warning'}`} />
            <span className="text-content-secondary dark:text-dark-secondaryText">
              {engine === 'elevenlabs' ? 'ElevenLabs AI' : 'Browser Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Audio Controls & Volume Bar */}
      <div className="pt-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Playback action buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!enabled}
            title={state === 'speaking' ? 'Pause' : 'Play announcement'}
            className="w-8 h-8 rounded-lg bg-canvas-subtle dark:bg-dark-secondary hover:bg-canvas border border-border dark:border-dark-border flex items-center justify-center text-content-primary dark:text-dark-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-subtle"
          >
            {state === 'speaking' ? (
              <Pause className="w-3.5 h-3.5 text-brand-teal" />
            ) : (
              <Play className="w-3.5 h-3.5 text-brand-teal fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            disabled={!enabled}
            title="Replay security announcement"
            className="w-8 h-8 rounded-lg bg-canvas-subtle dark:bg-dark-secondary hover:bg-canvas border border-border dark:border-dark-border flex items-center justify-center text-content-primary dark:text-dark-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-subtle"
          >
            <RotateCcw className="w-3.5 h-3.5 text-content-secondary dark:text-dark-secondaryText" />
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            disabled={!enabled}
            title={muted ? 'Unmute' : 'Mute'}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-40 shadow-subtle ${
              muted
                ? 'bg-status-danger-bg text-status-danger border-status-danger-border'
                : 'bg-canvas-subtle dark:bg-dark-secondary text-content-primary dark:text-dark-primary border-border dark:border-dark-border'
            }`}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Animated Sound Wave Indicator */}
        <div className="flex items-center space-x-1 h-6 px-2.5 py-1 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
          {[0.6, 1.0, 0.4, 0.9, 0.7].map((heightScale, i) => (
            <span
              key={i}
              className={`w-1 bg-brand-teal rounded-full transition-all duration-200 ${
                state === 'speaking' ? 'animate-pulse' : 'h-1.5 opacity-30'
              }`}
              style={{
                height: state === 'speaking' ? `${Math.max(4, Math.round(18 * heightScale))}px` : '4px',
                animationDelay: `${i * 120}ms`
              }}
            />
          ))}
          <span className="text-[10px] font-mono text-content-muted dark:text-dark-muted ml-1.5">
            {state === 'speaking' ? 'Speaking...' : 'Wave'}
          </span>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center space-x-2 min-w-[120px] flex-1 sm:flex-initial justify-end">
          <span className="text-[10px] font-mono text-content-muted dark:text-dark-muted">
            {muted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={!enabled || muted}
            aria-label="Voice Volume"
            className="w-20 sm:w-24 h-1.5 bg-canvas-subtle dark:bg-dark-secondary rounded-lg appearance-none cursor-pointer accent-brand-teal disabled:opacity-40"
          />
        </div>
      </div>

      {/* 4. Live Speech Transcript Box */}
      <div className="mt-3.5 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-xs space-y-1">
        <div className="flex items-center justify-between text-[10px] font-semibold text-content-muted dark:text-dark-muted uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-brand-teal" />
            <span>Spoken Verdict Transcript</span>
          </span>
          {currentResultType && (
            <span className="font-mono text-brand-teal capitalize">
              {currentResultType} Verdict
            </span>
          )}
        </div>
        <p className="text-xs text-content-primary dark:text-dark-primary font-medium leading-relaxed italic">
          {currentText ? `"${currentText}"` : 'Security verdicts will be spoken automatically upon scan completion in your chosen language.'}
        </p>
      </div>

      {/* 5. Collapsible Recent Voice Activity Drawer */}
      <div className="mt-3 pt-3 border-t border-border dark:border-dark-border">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-xs text-content-secondary dark:text-dark-secondaryText hover:text-content-primary py-1"
        >
          <span className="flex items-center space-x-1.5 font-medium">
            <History className="w-3.5 h-3.5 text-brand-teal" />
            <span>Recent Voice Activity ({activities.length})</span>
          </span>
          {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showHistory && (
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-[11px] text-content-muted dark:text-dark-muted py-2 text-center">
                No voice announcements logged yet.
              </p>
            ) : (
              <>
                <div className="flex justify-end pb-1">
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="inline-flex items-center space-x-1 text-[10px] text-content-muted hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear history</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2 rounded-lg bg-canvas-pure dark:bg-dark-bg border border-border dark:border-dark-border text-[11px] flex items-center justify-between gap-2"
                    >
                      <span className="text-content-primary dark:text-dark-primary font-medium truncate flex-1">
                        {act.title}
                      </span>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-brand-teal/10 text-brand-teal font-semibold">
                          {act.language}
                        </span>
                        <span className="text-[10px] text-content-muted font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
