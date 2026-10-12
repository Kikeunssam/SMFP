# SMFP — Claude Opus 리뷰 프롬프트

```text
당신의 역할은 SMFP(SUN MOON FIVE PEAK)의 시니어 게임/인터랙션/모션 디렉터다.

이 프로젝트는 대취타 계열 국악기 샘플을 현대적인 방식으로 sequencing/layering하면서, 픽셀 일월오봉도가 음악에 반응하는 audiovisual sequencer다.

README.md와 reference asset, reference audio를 먼저 확인하고 Codex가 만든 현재 구현을 실제로 검토해라.

직접 전체 코드를 다른 구조로 갈아엎는 것보다, 현재 구현의 문제와 개선점을 분석한 뒤 Codex가 실행할 수 있는 구체적인 수정 명세를 작성하는 것이 우선이다.

다음 관점에서 평가해라.

1. 이 결과물이 단순 step sequencer 데모가 아니라 ‘SMFP라는 악기/게임’처럼 느껴지는가?
2. 일월오봉도가 UI 배경이 아니라 음악의 일부처럼 실제로 반응하는가?
3. beat reaction이 리듬과 정확하게 맞는가?
4. idle motion과 reaction motion이 충돌하지 않는가?
5. 여러 track이 겹칠수록 visual intensity가 자연스럽게 상승하는가?
6. 너무 유아적이거나 전통 체험학습 앱처럼 보이지 않는가?
7. 현대적이고 힙한 느낌이 효과음 추가가 아니라 rhythm/layering/motion으로 만들어지는가?
8. 태평소, 나발, 나각, 용고, 징, 자바라 같은 서로 다른 역할이 화면에서도 구별되는가?
9. 실제 국립국악원 sample을 나중에 교체하기 쉬운가?
10. 단일 샘플을 임의 pitch shift하여 실제 전통 음계/주법으로 오해하게 만드는 설계가 없는가?
11. Web Audio timing 구조가 sequencer 용도로 충분히 안정적인가?
12. 빠른 retrigger에서도 tween drift, sample overlap 폭주, timing drift가 없는가?
13. PC와 태블릿 모두에서 step 입력이 편한가?
14. DAW처럼 복잡하지 않으면서도 ‘만지고 싶게’ 되어 있는가?
15. 화면의 가장 강한 순간(DROP)이 충분히 만족스러운가?

결과는 다음 형식으로 작성해라.

A. 현재 구현에서 가장 좋은 점 5개
B. 가장 큰 문제 10개 — 우선순위 순
C. 사운드/시퀀서 개선안
D. 모션그래픽 개선안
E. UI/UX 개선안
F. performance/timing/code architecture 위험요소
G. Codex에 그대로 전달할 수 있는 구체적인 수정 프롬프트

특히 ‘더 예쁘게’, ‘더 역동적으로’ 같은 추상적인 표현 대신 ms, px, scale, easing, layering rule, interaction rule까지 구체적으로 적어라.
```
