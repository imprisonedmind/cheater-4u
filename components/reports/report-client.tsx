"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReportFormClient from "@/components/forms/new-client-report";
import { submitProfileReportAction } from "@/app/reports/actions";

export default function ReportPageClient() {
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    try {
      const result = await submitProfileReportAction(formData);

      if (result?.profileId) {
        toast.success("Report submitted successfully!");
        router.push(`/profiles/${result.profileId}`);
      } else {
        toast.error("Submission failed or was interrupted.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Submission failed.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Submit a Report</h1>
        <p className="text-muted-foreground">
          Report a suspected cheater with evidence to help keep games fair
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>
            Provide information about the suspected cheater
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await onSubmit(formData);
            }}
          >
            <ReportFormClient />
            <CardFooter className="flex justify-between px-0 mt-6">
              <Button variant="outline" type="reset">
                Cancel
              </Button>
              <Button type="submit">Submit Report</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
