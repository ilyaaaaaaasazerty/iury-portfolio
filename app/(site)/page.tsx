import { getProfile } from "@/lib/data";
import Story from "@/components/erp/story";

export default async function Page() {
  const profile = await getProfile();
  return <Story profile={profile} />;
}
