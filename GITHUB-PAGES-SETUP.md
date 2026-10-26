# GitHub Pages 배포

대상 저장소: `remine-app/Re-chant`

1. GitHub Settings → Pages → Source를 `GitHub Actions`로 설정합니다.
2. 이 프로젝트 파일을 저장소 루트에 복사합니다.
3. Studio 콘텐츠를 `public/content/`에 복사합니다.
4. 아래 명령으로 push합니다.

```powershell
git add -A
git commit -m "Rechant Web App v0.2.0"
git push origin main
```

5. Actions에서 `Deploy Re:chant Web App to GitHub Pages`의 build/deploy가 모두 성공하는지 확인합니다.
6. 사이트: `https://remine-app.github.io/Re-chant/#/`

MP3는 저장소에 올리지 않습니다. `public/audio-catalog.json`의 Dropbox 링크를 통해 사용자가 ZIP을 직접 받고, 웹앱에서 설치하여 IndexedDB에 저장합니다.
