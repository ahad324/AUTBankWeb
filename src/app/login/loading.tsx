import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="w-full h-full">
      <LoadingSpinner text="Preparing login screen..." fullscreen />
    </div>
  );
}
