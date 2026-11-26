import { Suspense } from 'react';

import { ServerStatusList } from './ServerStatusList';

export const HomePage = () => {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">DataGSM Status</h1>
      {/* 상태 확인은 최대 3초 걸린다. 제목은 먼저 보여 주고 결과는 도착하면 채운다. */}
      <Suspense fallback={<p>서버 상태를 확인하는 중입니다.</p>}>
        <ServerStatusList />
      </Suspense>
    </main>
  );
};
