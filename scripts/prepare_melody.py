"""Prepare the supplied Daechwita performance without changing the source WAV.
Usage: python3 scripts/prepare_melody.py /path/to/performance.wav
macOS afconvert supplies the AAC encoder. Excerpt boundaries are provisional,
selected from quiet gaps; they are not pitch or beat transcriptions.
"""
import array, json, math, pathlib, subprocess, sys, wave
source = pathlib.Path(sys.argv[1])
root = pathlib.Path(__file__).resolve().parents[1]
with wave.open(str(source)) as wav:
    rate, channels = wav.getframerate(), wav.getnchannels()
    if wav.getsampwidth() != 2:
        raise ValueError('Expected 16-bit PCM WAV')
    samples = array.array('h', wav.readframes(wav.getnframes()))
    if sys.byteorder != 'little': samples.byteswap()
# Keep aligned with src/config/melodyPhrases.ts.
clips = [('a', 40.20, 3.74), ('b', 56.72, 4.42), ('c', 22.04, 6.90)]
envelopes = {}
for key, start, duration in clips:
    energies = []
    for i in range(math.ceil(duration * 20)):
        part = samples[int((start + i * .05) * rate) * channels:int((start + min(duration, (i + 1) * .05)) * rate) * channels]
        energies.append(math.sqrt(sum(x*x for x in part) / max(1, len(part))))
    peak = max(energies) or 1
    envelopes[key] = [round(x / peak, 3) for x in energies]
output = root / 'public/samples/taepyeongso-performance.m4a'
subprocess.run(['/usr/bin/afconvert', '-f', 'm4af', '-d', 'aac', '-b', '128000', '-q', '127', str(source), str(output)], check=True)
(root / 'src/config/melodyDynamics.ts').write_text('// RMS envelopes at 20 Hz from the supplied recording; amplitude only, not pitch.\nexport const melodyDynamics: Record<string, number[]> = ' + json.dumps(envelopes) + ';\n')
