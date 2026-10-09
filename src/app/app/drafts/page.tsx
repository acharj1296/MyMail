import { MailboxPage } from "@/components/features/mailbox-page";

type RouteSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DraftsRoute({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const initialSearch = typeof params.search === "string" ? params.search : "";
  const initialOpen = typeof params.open === "string" ? params.open : "";
  return <MailboxPage folder="drafts" initialSearch={initialSearch} initialOpen={initialOpen} />;
}
