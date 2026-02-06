import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Music, Mic } from 'lucide-react';

interface AudioMixerProps {
    onVolumeChange: (channel: 'bgm' | 'sfx' | 'voice', volume: number) => void;
}

export function AudioMixer({ onVolumeChange }: AudioMixerProps) {
    const [volumes, setVolumes] = useState({
        bgm: 0.5,
        sfx: 1.0,
        voice: 0.8
    });

    const handleChange = (channel: 'bgm' | 'sfx' | 'voice', val: number[]) => {
        const newVol = val[0];
        setVolumes(prev => ({ ...prev, [channel]: newVol }));
        onVolumeChange(channel, newVol);
    };

    return (
        <div className="glass-card rounded-xl p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Audio Mixer
            </h3>

            <div className="space-y-4">
                {/* BGM */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <Music className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium">Music (BGM)</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{(volumes.bgm * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={[volumes.bgm]}
                        max={1}
                        step={0.01}
                        onValueChange={(v) => handleChange('bgm', v)}
                        className="cursor-pointer"
                    />
                </div>

                {/* SFX */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium">SFX (Horns)</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{(volumes.sfx * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={[volumes.sfx]}
                        max={1}
                        step={0.01}
                        onValueChange={(v) => handleChange('sfx', v)}
                        className="cursor-pointer"
                    />
                </div>

                {/* Voice */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium">Voice / TTS</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{(volumes.voice * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={[volumes.voice]}
                        max={1}
                        step={0.01}
                        onValueChange={(v) => handleChange('voice', v)}
                        className="cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}
