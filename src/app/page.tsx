import { DateInvitation } from "@/components/date-invitation";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeQueryValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return "";
  }

  return raw.trim().replace(/^['"]|['"]$/g, "");
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const name = normalizeQueryValue(params.name) || "beautiful";
  const metadataEmail = normalizeQueryValue(params.m);

  return <DateInvitation name={name} metadataEmail={metadataEmail} />;
}
