import PortfolioClient from '@/components/PortfolioClient';
import { getPublicProjects } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const projects = await getPublicProjects();
  return <PortfolioClient projects={projects} />;
}
