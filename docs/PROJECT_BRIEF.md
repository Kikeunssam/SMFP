# SMFP — SUN MOON FIVE PEAK

> Audiovisual Korean court-music sequencer inspired by the visual language of **일월오봉도** and the instrumental character of **대취타**.

## 1. 프로젝트 한 줄 정의

**SMFP는 대취타 계열 국악기 샘플을 현대적으로 레이어링하고 시퀀싱하면서, 그 소리에 반응해 픽셀 일월오봉도가 살아 움직이는 웹 기반 오디오비주얼 시퀀서다.**

이 프로젝트의 핵심은 ‘전통음악 재현 게임’도, ‘정답을 맞히는 리듬게임’도 아니다.

사용자가 직접 비트를 만들고, 레이어를 켜고 끄고, 패턴을 반복·변형하면서 **하나의 현대적인 트랙과 하나의 움직이는 일월오봉도 장면을 동시에 만든다.**

---

## 2. 프로젝트명

### SMFP
### SUN MOON FIVE PEAK

- SUN = 해
- MOON = 달
- FIVE PEAK = 오봉
- 로고/타이틀은 영문 `SMFP`를 메인으로 사용한다.
- 서브타이틀 후보: `SUN MOON FIVE PEAK — Korean Court Music Sequencer`

---

## 3. 사운드 레퍼런스

참고 음원:

`assets/reference/The_Kings_March_reference.mp3`

이 음원에서 참고할 것은 특정 멜로디의 복제가 아니라 **전체적인 에너지 설계 방식**이다.

### 레퍼런스에서 느껴지는 핵심

- 약 117 BPM 부근의 현대적인 행진감
- 긴 취주 신호가 공간을 크게 여는 방식
- 묵직한 북 계열의 반복 패턴
- 태평소 계열의 날카롭고 공격적인 리드
- 섹션이 진행될수록 레이어와 밀도가 누적되는 빌드업
- 중간중간 강한 hit / accent / transition
- 후반부에 시네마틱한 질감이 더해져 규모가 커지는 느낌

SMFP는 이 구조를 참고하되, 실제 사용 음원은 사용자가 제공하는 **국립국악원 국악 디지털 음원 샘플**을 중심으로 한다.

---

## 4. 중요한 사운드 원칙

### 4-1. 단일 샘플을 가상악기처럼 과장하지 않는다

사용자가 제공할 수 있는 것은 국립국악원 디지털 음원의 개별 샘플이다.

따라서:

- 한 개의 관악기 샘플을 임의로 여러 음정으로 바꾸어 ‘궁상각치우 실제 연주’라고 표현하지 않는다.
- 한 개의 샘플로 실제 존재하지 않는 주법을 생성했다고 설명하지 않는다.
- 실제로 여러 음높이/주법 샘플이 제공될 때만 해당 기능을 확장한다.

### 4-2. 현대적인 느낌은 ‘작곡/편곡 방식’에서 만든다

현대적인 느낌은 피치 변조보다 아래 요소로 만든다.

- 8/16/32 step sequencing
- repeat / mute / solo
- subdivision
- syncopation
- velocity 차이
- sample start / gate length
- reverse(필요 시, 연출용)
- stutter / retrigger
- delay
- reverb
- filter
- saturation의 가벼운 사용
- transition hit
- build-up / drop 구조
- 레이어의 추가·삭제

즉, **국악 원음을 재료로 현대적인 비트 메이킹을 하는 것**이 핵심이다.

---

## 5. 1차 악기 레이어

대취타 중심의 1차 후보:

| Track | 악기 | 시퀀서 역할 | 시각 반응 |
|---|---|---|---|
| 1 | 용고 | 저역 중심 pulse / downbeat | 중앙 오봉이 쿵 내려앉음 |
| 2 | 장구 또는 보조 타악 | subdivision / groove | 파도 리듬 |
| 3 | 징 | 긴 accent / 공간감 | 달의 파동 |
| 4 | 자바라 | metallic hit / transition | 해의 플래시 |
| 5 | 나발 | ceremonial long call | 오봉 뒤 빛/공기 파동 |
| 6 | 나각 | 낮고 신비한 drone/call | 구름/달/하늘 반응 |
| 7 | 태평소 | lead / hook / 공격적인 전면 레이어 | 해·능선·하늘이 강하게 반응 |
| 8 | 선택 확장 | 대금/피리 등 | texture / melodic layer | 폭포/소나무 |

실제 국립국악원 샘플 확보 상황에 따라 트랙 구성은 바뀔 수 있다.

---

## 6. 핵심 인터페이스

SMFP의 메인 화면은 **일월오봉도 자체가 시퀀서의 비주얼라이저이자 악기**처럼 보여야 한다.

### 화면 중앙

- 픽셀 일월오봉도
- 해 / 달 / 다섯 봉우리 / 소나무 / 폭포 / 파도 / 구름 각각 독립 레이어
- 아무 입력이 없어도 약한 idle motion
- 재생 중에는 각 track 이벤트에 맞춰 reaction motion

### 화면 하단 또는 하단 패널

- 16-step sequencer 기본
- 필요하면 8/16/32 step 전환
- 각 row = 악기 track
- step on/off
- mute / solo
- volume
- 간단한 FX send 또는 FX preset
- BPM
- PLAY / STOP / CLEAR

### 핵심 감각

Ableton이나 전문 DAW처럼 복잡하면 안 된다.

**Patatap + 간단한 step sequencer + 픽셀게임 화면** 정도의 직관성을 목표로 한다.

---

## 7. 시각 컨셉

- 16-bit / pixel game 스타일
- 전통 일월오봉도의 구도는 유지
- 너무 유아적인 캐릭터화는 피함
- 귀엽지만 세련되고 힙한 인상
- 높은 대비의 픽셀 실루엣
- 화면 전체는 하나의 왕실 병풍이자 공연 무대처럼 보이게
- 사운드가 쌓일수록 화면도 더 화려해져야 함

### 참고 이미지

![구성 참고](assets/reference/ref_01_labeled_composition.png)
![오봉 구조](assets/reference/ref_02_mountain_geometry.png)
![전통 참고 1](assets/reference/ref_03_traditional_scene.png)
![전통 참고 2](assets/reference/ref_04_traditional_scene.png)
![전통 참고 3](assets/reference/ref_05_traditional_scene.png)
![스타일 참고](assets/reference/ref_06_stylization.png)

### 생성된 픽셀 콘셉트

![픽셀 콘셉트](assets/concept/concept_pixel_sheet.png)

### 생성된 모션 스토리보드

![모션 스토리보드](assets/concept/concept_motion_storyboard.png)

---

## 8. Motion System

모션은 두 계층으로 설계한다.

### Idle motion

- 해/달: 1~2px 부유
- 구름: 느린 이동
- 파도: 여러 레이어가 다른 속도로 loop
- 폭포: sprite loop
- 소나무: 매우 약한 흔들림
- 별/빛: 간헐적 점멸

### Beat reaction

#### 용고
- 중앙 오봉 Y +4~6px
- 80~160ms 강한 impact
- 아주 약한 screen shake

#### 장구/리듬 타악
- 파도 frame 또는 높이가 step마다 반응
- 빠른 subdivision에서는 좌→우로 흐르는 리듬감

#### 징
- 달 주변 concentric pixel ring
- decay가 길수록 visual tail도 길게

#### 자바라
- 해 flash
- 픽셀 광선 6~8개
- transition에서는 화면 전체 highlight 가능

#### 나발
- 오봉 뒤쪽에서 커다란 공기 파동
- 긴 샘플일 경우 느리게 확장

#### 나각
- 구름/하늘이 저주파처럼 천천히 흔들림
- 달의 halo 강화

#### 태평소
- 가장 강한 lead reaction
- 해/산 능선/하늘에 빠른 빛 이동
- 연속 note/sample retrigger 시 화면이 리드 프레이즈를 시각적으로 따라감

---

## 9. 음악이 쌓일수록 화면도 쌓인다

SMFP의 가장 중요한 연출 규칙.

### 낮은 밀도

- 파도 작음
- 색 대비 낮음
- 구름 천천히 이동
- 산은 거의 정지

### 중간 밀도

- 타악이 늘어나면 파도와 오봉 반응 증가
- 금속 악기 accent에 해/달 빛 증가

### 높은 밀도 / DROP

- 태평소 + 용고 + 금속 타악 레이어가 겹치면
  - 산 능선 highlight
  - 파도 높이 증가
  - 해/달 glow 증가
  - 폭포 강조
  - 화면 전체가 음악과 함께 살아나는 느낌

단, 지속적인 화면 흔들림이나 과도한 flash는 피한다.

---

## 10. 1차 MVP에서 만들 것

1. SMFP 타이틀 화면
2. 16:9 픽셀 일월오봉도 Scene
3. 요소별 독립 레이어
4. idle motion
5. 8-track × 16-step sequencer
6. BPM 조절
7. play / stop / clear
8. mute / solo
9. 임시 sample 또는 silent fallback
10. track event → visual reaction 연결
11. 기본 FX architecture
12. 사운드 밀도에 따른 visual intensity system
13. 태블릿/PC 반응형

아직 만들지 않을 것:

- 로그인
- 서버 DB
- 점수/랭킹
- 캐릭터 성장
- 복잡한 스테이지
- AI 음악 생성

SMFP의 1차 목표는 **‘게임처럼 재미있게 만지는 음악 도구’**다.

---

## 11. 권장 기술 구조

- Vite
- TypeScript
- Phaser 3: 비주얼/모션/scene
- Web Audio API: 정확한 timing 및 sample playback
- 필요하면 AudioWorklet 또는 scheduler architecture를 추후 고려

중요: Step sequencer timing은 단순 `setInterval`에만 의존하지 말고 Web Audio clock 기반 scheduling을 고려한다.

### 권장 모듈

```text
src/
  audio/
    AudioEngine.ts
    Transport.ts
    SampleBank.ts
    Effects.ts
  sequencer/
    SequencerStore.ts
    Pattern.ts
  visual/
    VisualEventBus.ts
    MotionController.ts
    VisualIntensity.ts
  game/
    IntroScene.ts
    SMFPScene.ts
  config/
    tracks.ts
    motionPresets.ts
    sampleManifest.ts
```

---

## 12. 프로젝트 철학

SMFP는 국악을 ‘옛날 음악’으로 보여주는 프로젝트가 아니다.

**전통 악기의 실제 음색과 일월오봉도의 강한 시각 언어를, 오늘날의 인터랙티브 음악 경험으로 다시 조합한다.**

사용자는 국악을 설명으로 배우기보다 직접 누르고, 반복하고, 겹치고, 빼면서 소리를 경험한다.

그리고 그 결과는 음악만 남는 것이 아니라 **움직이는 일월오봉도**로 동시에 보인다.
