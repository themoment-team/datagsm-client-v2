import { NotFoundPage } from '@/_pages/not-found';
import { env } from '@/shared/config';

const NotFound = () => <NotFoundPage clientUrl={env.APP_CLIENT_URL} />;

export default NotFound;
