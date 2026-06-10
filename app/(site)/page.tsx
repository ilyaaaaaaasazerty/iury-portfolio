import { getProfile, getProjects } from "@/lib/data";
import PortfolioClient from "@/components/portfolio-client";

export default async function Page() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  return <PortfolioClient profile={profile} projects={projects} />;
}
