# Re:chant Web App v0.2.0

모바일 우선 RESCENE 응원법 연습 웹앱입니다. v0.2.0부터 앱/콘텐츠/음원을 분리합니다.

## 운영 구조

- GitHub Pages: React 앱 + 콘텐츠 JSON + 앨범 아트 + audio-catalog.json
- Dropbox: Re:chant Audio Pack ZIP 배포
- 사용자 브라우저 IndexedDB: 설치한 MP3 보관 및 로컬 재생
- Studio: 콘텐츠 ZIP / Dropbox용 음원팩 ZIP 생성

MP3는 GitHub 저장소나 GitHub Pages에 포함하지 않습니다.

## 현재 Dropbox 음원팩

웹앱은 `public/audio-catalog.json`에서 고정 공유 링크를 읽습니다. 현재 Love Attack 음원팩은 Dropbox 직접 다운로드 링크(`dl=1`)로 연결되어 있습니다.

사용 흐름:
1. 곡 선택
2. 로컬에 음원이 없으면 `음원팩 다운로드`
3. Dropbox ZIP 다운로드
4. `다운로드한 ZIP 설치`
5. manifest / songId / SHA-256 / 파일 크기 검증
6. IndexedDB 저장
7. 이후 로컬 MP3 재생

## 콘텐츠 반영

Studio v0.4.2에서 콘텐츠 ZIP을 만든 뒤 압축 내부의 내용을 저장소의 `public/content/`에 배치합니다.

```text
public/content/
  manifest.json
  songs/
    love-attack.json
  assets/
    love-attack/
      cover.webp
```

개발 테스트에는 Studio의 `선택 곡 테스트 ZIP`, 정식 배포에는 `배포 준비 곡 전체 ZIP`을 사용합니다.

## 화면

- 홈: 이어하기 / 주간 연습 통계 / 최근 곡
- 곡 목록: 콘텐츠 기반 자동 목록, 음원 설치 상태 표시
- 연습: 전체 따라가기 / 실전 연습
- 실전 연습: 힌트 표시 / 원본 가사만
- 설정: 선행 재생 시간 / 기본 모드 / 로컬 음원 관리

## 연습 UX

- 현재 가사 줄 변경 시 중앙 자동 추적
- 사용자가 직접 스크롤하면 자동 추적 중지
- `현재 가사` 버튼으로 복귀
- 가사 줄 클릭 시 `startMs - seekLeadMs`로 이동
- 기본 선행 재생 0.7초, 0~3초 조절

## 실행

```powershell
npm install
npm run dev
```

또는:

```powershell
npm run app
```

## GitHub Pages

저장소 이름은 `Re-chant` 기준이며 Vite base는 `/Re-chant/`입니다. main push 시 `.github/workflows/deploy-pages.yml`이 자동 빌드/배포합니다.

## 향후 확장

- PWA 오프라인 앱 캐시
- 음원 업데이트 알림 (audioVersion 비교)
- 마이크 기반 응원법 채점
- 점수/랭킹 백엔드
