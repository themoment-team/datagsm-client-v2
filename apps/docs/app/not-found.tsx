import { toAppUrls } from '@datagsm/core/shared/config';

import { NotFoundPage } from '@/_pages/not-found';
import { env } from '@/shared/config';

const NotFound = () => <NotFoundPage clientUrl={toAppUrls(env).client} />;

export default NotFound;
