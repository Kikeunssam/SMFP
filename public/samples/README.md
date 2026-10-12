# 국립국악원 국악 디지털 음원

사용자가 제공한 WAV 7개를 원본 변경 없이 AAC 128kbps M4A로 변환했습니다.

- yonggo.m4a — Yonggo_1.wav
- janggu.m4a — Janggu_1_1.wav
- jing.m4a — Jing_1.wav
- jabara.m4a — 자바라_1.wav
- nabal.m4a — Nabal_1.wav
- nagak.m4a — Nagak_1 (1).wav
- taepyeongso.m4a — 태평소_강세별음계_강.wav

전체 파일의 길이는 유지했습니다. 앞 무음과 리듬용 재생 구간은 src/config/sampleManifest.ts의 start/gate 설정으로 제어합니다. 특히 태평소는 전체 음계 파일 중 첫 발음 구간을 사용합니다. 변환 크기·길이·원본 이름은 conversion-report.json에 기록되어 있습니다.

7개 악기 샘플은 국립국악원 '국악 디지털 음원' 자료를 활용하였습니다. 출정 음성은 별도로 사용자가 제공한 녹음입니다.

### 태평소 가락 놀이 업데이트
현재 태평소는 `taepyeongso-performance.m4a`를 사용합니다. 원본은 사용자가 제공한 `태평소 연주곡 대취타 wave.wav`이며, `src/config/melodyPhrases.ts`에서 세 구간을 선택합니다. 이전 `taepyeongso.m4a`는 향후 음별 창작 기능을 위해 보존했습니다. 구간 경계는 조용한 부분의 분석을 바탕으로 정한 초안이며, 실제 청취를 통한 음악적 다듬기가 남아 있습니다. 7개 악기 샘플은 국립국악원 '국악 디지털 음원' 자료를 활용하였습니다. 출정 음성은 별도로 사용자가 제공한 녹음입니다.

### 출정 음성
`daechwita-announcement.m4a`는 사용자가 제공한 `e편한세상영종국제도시센텀베뉴아파트.m4a`입니다. 원본은 재인코딩하지 않았습니다. 첫 재생의 왕명 연출에서 재생하며, Web Audio에서 재생 속도를 약간 높여 가볍고 밝게 들리도록 하고 저역의 웅웅거림과 고역의 잡음을 부드럽게 줄입니다.
