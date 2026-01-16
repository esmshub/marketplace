import { EmptyPanel } from "@/components/empty-panel";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  // Or a custom loading skeleton component
  return <EmptyPanel icon={<Spinner />} title="Loading..." description="" />;
}
