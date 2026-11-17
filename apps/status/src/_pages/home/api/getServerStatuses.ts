import { MONITORED_SERVERS } from '../config/monitoredServers';
import { checkServerStatus } from './checkServerStatus';

import 'server-only';

// 서버들을 동시에 확인한다. 한 서버가 느려도 다른 서버의 측정값에는 영향이 없다.
export const getServerStatuses = () => Promise.all(MONITORED_SERVERS.map(checkServerStatus));
