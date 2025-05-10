import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/skills")({  
  component: SkillsRoute,
});

function SkillsRoute() {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        Skills editor coming soon...
      </CardContent>
    </Card>
  );
}
