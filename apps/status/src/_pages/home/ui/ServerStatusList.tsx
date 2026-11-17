import { connection } from 'next/server';

import { getServerStatuses } from '../api/getServerStatuses';

// 화면 구성은 디자인이 나오면 바꾼다. 지금은 측정 결과를 그대로 보여 준다.
export const ServerStatusList = async () => {
  // 요청마다 잰다. 빌드할 때 서버를 호출해 그 결과가 고정되지 않도록 미리 렌더하지 않는다.
  await connection();

  const statuses = await getServerStatuses();

  return (
    <ul className="flex w-full max-w-md flex-col gap-2">
      {statuses.map(({ id, label, state, latencyMs }) => (
        <li key={id} className="flex justify-between gap-4">
          <span>{label}</span>
          <span>
            {state === 'up' ? '정상' : '장애'} · {latencyMs === null ? '-' : `${latencyMs}ms`}
          </span>
        </li>
      ))}
    </ul>
  );
};
