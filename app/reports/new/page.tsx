"use client";
import { submitProfileReportAction } from "../../profiles/actions";
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

export default function NewReportPage() {
  async function onSubmit(formData: FormData) {
    try {
      await submitProfileReportAction(formData);
      toast.success("Report submitted successfully!");
    } catch (err: any) {
      // If the error is a redirect error, let Next.js handle it without showing a toast
      if (err?.digest === "NEXT_REDIRECT") return;
      toast.error("Submission failed.");
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
              e.preventDefault(); // prevent full page reload
              const form = e.currentTarget;
              const formData = new FormData(form);
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
