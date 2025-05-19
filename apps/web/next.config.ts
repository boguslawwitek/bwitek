import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', 'localhost:3000', 'localhost:3001'],
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);