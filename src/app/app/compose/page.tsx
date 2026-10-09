import { ComposePage } from "@/components/features/compose-page";

type RouteSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ComposeRoute({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const asString = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
  return <ComposePage initialDraftId={asString(params.draft)} replyId={asString(params.reply)} forwardId={asString(params.forward)} />;
}
