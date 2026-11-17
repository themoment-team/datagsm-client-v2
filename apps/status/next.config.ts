import type { NextConfig } from 'next';

// 환경 변수를 dev·build 시작 시점에 검증한다. 값이 없으면 여기서 바로 실패한다.
import './src/shared/config';

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,

  // 모든 응답에 기본 보안 헤더를 적용한다. CSP는 서비스별 정책으로 따로 정한다.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  transpilePackages: ['@datagsm/core'],

  // AGENTS.md는 이 프로젝트가 직접 관리한다. next dev가 내용을 덧붙이지 않게 한다.
  agentRules: false,
};

export default nextConfig;
