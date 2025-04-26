import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={() => router.back()}
      className="flex items-center gap-2"
    >
      <ArrowLeft />
      Go Back
    </Button>
  );
}
