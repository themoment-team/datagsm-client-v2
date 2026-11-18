import { render, screen, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { USER_SIDEBAR_FOOTER_ITEMS, USER_SIDEBAR_ITEMS } from '../config/userSidebarMenu';
import { AppSidebar } from './AppSidebar';

const pathname = vi.hoisted(() => ({ value: '/' }));

vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }));

const appUrls = {
  client: 'https://datagsm.kr',
  docs: 'https://docs.datagsm.kr',
  status: 'https://status.datagsm.kr',
  projects: 'https://projects.datagsm.kr',
};

const renderSidebar = (currentApp: 'client' | 'docs') =>
  render(
    <AppSidebar
      currentApp={currentApp}
      appUrls={appUrls}
      items={USER_SIDEBAR_ITEMS}
      footerItems={USER_SIDEBAR_FOOTER_ITEMS}
    />,
  );

beforeEach(() => {
  pathname.value = '/';
});

it('같은 앱 메뉴는 앱 안 경로로, 다른 앱 메뉴는 그 앱 주소로 연결한다', () => {
  renderSidebar('client');

  const nav = screen.getByRole('navigation', { name: '주 메뉴' });

  expect(within(nav).getByRole('link', { name: 'API 키' })).toHaveAttribute('href', '/api-keys');
  expect(within(nav).getByRole('link', { name: '문서' })).toHaveAttribute(
    'href',
    'https://docs.datagsm.kr',
  );
  expect(within(nav).getByRole('link', { name: '서비스 상태' })).toHaveAttribute(
    'href',
    'https://status.datagsm.kr',
  );
  expect(within(nav).getByRole('link', { name: '프로젝트' })).toHaveAttribute(
    'href',
    'https://projects.datagsm.kr',
  );
});

it('다른 앱에서는 client 메뉴와 계정 메뉴가 client 주소로 연결된다', () => {
  renderSidebar('docs');

  expect(screen.getByRole('link', { name: 'API 키' })).toHaveAttribute(
    'href',
    'https://datagsm.kr/api-keys',
  );
  expect(screen.getByRole('link', { name: '내 정보' })).toHaveAttribute(
    'href',
    'https://datagsm.kr/me',
  );
  expect(screen.getByRole('link', { name: '문서' })).toHaveAttribute('href', '/');
});

it('지금 경로의 메뉴를 선택된 상태로 표시한다', () => {
  pathname.value = '/api-keys/123';
  renderSidebar('client');

  expect(screen.getByRole('link', { name: 'API 키' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: '이벤트' })).not.toHaveAttribute('aria-current');
});

it('앱의 루트 메뉴는 그 앱 안 어느 경로에서도 선택된다', () => {
  pathname.value = '/guides/oauth';
  renderSidebar('docs');

  expect(screen.getByRole('link', { name: '문서' })).toHaveAttribute('aria-current', 'page');
});

it('주소를 모르는 앱으로 가는 메뉴가 있으면 바로 알린다', () => {
  expect(() =>
    render(
      <AppSidebar
        currentApp="client"
        appUrls={{ client: appUrls.client }}
        items={USER_SIDEBAR_ITEMS}
        footerItems={[]}
      />,
    ),
  ).toThrow("사이드바 메뉴 '프로젝트'의 앱(projects) 주소가 없습니다.");
});

it('badge를 넘기면 로고 옆에 표시하고, 넘기지 않으면 표시하지 않는다', () => {
  const { rerender } = render(
    <AppSidebar currentApp="admin" appUrls={{}} items={[]} footerItems={[]} badge="관리자" />,
  );

  expect(screen.getByText('관리자')).toBeInTheDocument();

  rerender(<AppSidebar currentApp="admin" appUrls={{}} items={[]} footerItems={[]} />);

  expect(screen.queryByText('관리자')).not.toBeInTheDocument();
});

it('idpLogoutUrl을 넘긴 앱만 계정 메뉴에 로그아웃 버튼을 둔다', () => {
  const { rerender } = render(
    <AppSidebar
      currentApp="client"
      appUrls={appUrls}
      items={[]}
      footerItems={USER_SIDEBAR_FOOTER_ITEMS}
      idpLogoutUrl="https://oauth.example/v1/oauth/logout"
    />,
  );

  const accountNav = screen.getByRole('navigation', { name: '계정 메뉴' });

  expect(within(accountNav).getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  expect(within(accountNav).queryByRole('link', { name: '로그아웃' })).not.toBeInTheDocument();

  rerender(
    <AppSidebar
      currentApp="docs"
      appUrls={appUrls}
      items={[]}
      footerItems={USER_SIDEBAR_FOOTER_ITEMS}
    />,
  );

  expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
});
