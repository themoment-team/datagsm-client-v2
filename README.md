# DataGSM Client

> 광주소프트웨어마이스터고등학교 OAuth & OpenAPI 서비스의 웹 클라이언트

DataGSM Client는 [DataGSM](https://github.com/themoment-team/datagsm-server) 서비스의 웹 프런트엔드입니다. 사용자 웹, 관리자 웹, 기술 문서, 서비스 상태 페이지, OAuth 로그인 화면, 프로젝트 페이지를 하나의 모노레포에서 개발하고 앱마다 따로 배포합니다.

## 앱 구조

| 앱           | 역할                       | 포트 |
| ------------ | -------------------------- | ---- |
| **client**   | 사용자 웹 서비스           | 3000 |
| **admin**    | 관리자 웹 서비스           | 3001 |
| **docs**     | 기술 문서                  | 3002 |
| **status**   | 서비스 상태 페이지         | 3003 |
| **oauth**    | OAuth 로그인 화면          | 3004 |
| **projects** | 프로젝트 페이지            | 3005 |
| **core**     | 앱이 함께 쓰는 공통 패키지 | -    |

Next.js, React, TypeScript, Tailwind CSS로 만들고 pnpm과 Turborepo로 관리합니다.

## 문서

- **공식 기술 문서**: [https://docs.datagsm.kr](https://docs.datagsm.kr)
- **개발 규칙과 명령**: [AGENTS.md](./AGENTS.md)

## 라이선스

이 프로젝트는 [MIT 라이선스](./LICENSE)를 따릅니다.

## 문의

- **이슈**: [GitHub Issues](https://github.com/themoment-team/datagsm-client-v2/issues)

---

Made with ❤️ by [themoment-team](https://github.com/themoment-team)
