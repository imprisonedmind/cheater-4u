// app/reports/new/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-server-session";
import { isLoggedIn } from "@/lib/utils";
import ReportPageClient from "@/components/reports/report-client";

export default async function NewReportPage() {
  const user = await getServerSession();

  if (!isLoggedIn(user)) {
    redirect("/");
  }

  return <ReportPageClient />;
}
