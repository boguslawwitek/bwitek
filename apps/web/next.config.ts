import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const devOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',')
  : ['localhost'];
 
const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);