import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SavedJobsDeprecatedPage() {
  return (
    <div className="max-w-3xl mx-auto py-16">
      <Card className="bg-[#111827]/60 border-white/10 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Feature Updated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-300">
          <p>
            Saved Jobs has been retired. This product now focuses on Career Role Recommendation and actionable resume improvements.
          </p>
          <p>
            You can open your role-fit suggestions and next steps directly from the role intelligence page.
          </p>
          <Link href="/dashboard/jobs">
            <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white">Open Career Roles</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
