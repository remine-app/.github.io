# Re:chant Web App v0.1.1 — GitHub Pages 배포

대상 저장소: `remine-app/Re-Chant`
배포 주소: `https://remine-app.github.io/Re-Chant/`

## 배포 방식

이 프로젝트는 `main` 브랜치에 소스를 올리면 `.github/workflows/deploy-pages.yml`이 자동으로:

1. Node.js 설치
2. npm 의존성 설치
3. `npm run build`
4. `dist/` 업로드
5. GitHub Pages 배포

를 수행합니다.

GitHub 저장소에는 `dist`를 직접 올릴 필요가 없습니다.

## GitHub에서 최초 1회 설정

1. Repository → Settings → Pages
2. Build and deployment → Source
3. `Deploy from a branch` 대신 `GitHub Actions` 선택
4. 저장소 루트에 이 프로젝트 파일 전체를 업로드/커밋
5. Actions 탭에서 `Deploy Re:chant Web App to GitHub Pages` 워크플로 확인
6. 초록색 체크가 뜨면 Pages 주소 접속

## 중요

- Vite `base`는 `/Re-Chant/`로 설정되어 있습니다.
- GitHub Pages의 SPA 새로고침 문제를 피하기 위해 `HashRouter`를 사용합니다.
- 따라서 내부 주소는 `https://remine-app.github.io/Re-Chant/#/songs` 같은 형태가 됩니다.
- 음원/콘텐츠 팩 URL은 `import.meta.env.BASE_URL` 기준으로 생성되므로 `/Re-Chant/` 하위에서도 정상 동작하도록 구성했습니다.
