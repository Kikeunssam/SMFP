"""Convert supplied WAVs to AAC/M4A; never modify source recordings."""
import array, json, math, pathlib, subprocess, sys, unicodedata, wave
if len(sys.argv) != 2:
    raise SystemExit('Usage: python3 scripts/convert_samples.py /path/to/wav-folder')
SOURCE = pathlib.Path(sys.argv[1])
DEST = pathlib.Path(__file__).resolve().parents[1] / 'public/samples'
NAMES = {'자바라_1.wav':'jabara','Janggu_1_1.wav':'janggu','Jing_1.wav':'jing','Yonggo_1.wav':'yonggo','태평소_강세별음계_강.wav':'taepyeongso','Nabal_1.wav':'nabal','Nagak_1 (1).wav':'nagak'}
report=[]
for file in SOURCE.glob('*.wav'):
    key=NAMES.get(unicodedata.normalize('NFC',file.name))
    if not key: continue
    with wave.open(str(file),'rb') as wav:
        rate=wav.getframerate(); channels=wav.getnchannels(); duration=wav.getnframes()/rate
        data=array.array('h',wav.readframes(wav.getnframes()))
    hop=int(rate*.02)*channels
    energy=[math.sqrt(sum(v*v for v in data[i:i+hop])/len(data[i:i+hop]))/32768 for i in range(0,len(data),hop)]
    threshold=max(.002,max(energy)*.035)
    active=[i for i,rms in enumerate(energy) if rms>threshold]
    segments=[]; begin=None; last=0
    for i in active:
        if begin is None: begin=i
        elif i-last>10: segments.append([round(begin*.02,2),round((last+1)*.02,2)]);begin=i
        last=i
    if begin is not None:segments.append([round(begin*.02,2),round((last+1)*.02,2)])
    out=DEST/f'{key}.m4a'
    subprocess.run(['/usr/bin/afconvert','-f','m4af','-d','aac','-b','128000','-q','127',str(file),str(out)],check=True)
    row={'id':key,'source':file.name,'duration':duration,'wavBytes':file.stat().st_size,'m4aBytes':out.stat().st_size,'activeSegments':segments,'peak':round(max(abs(v) for v in data)/32768,4)}
    report.append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
(DEST/'conversion-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
