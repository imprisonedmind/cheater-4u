import { submitProfileReportAction } from "../../profiles/actions"; // The server action
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReportFormClient from "@/components/forms/new-client-report";

export default function NewReportPage() {
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
          {/*
            The form uses server actions via action={submitProfileReportAction}.
            Our dynamic fields (tabs, etc.) are inside a client component, but
            still have name="..." so they get submitted with this form.
          */}
          <form action={submitProfileReportAction}>
            {/* Our client-side tabbed UI goes here */}
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
