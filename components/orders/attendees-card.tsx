import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, XCircle } from "lucide-react";

interface AttendeesCardProps {
  attendees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    ticketTypeName: string;
    ticketCode: string;
    isCheckedIn: boolean;
    checkedInAt: Date | null;
  }>;
}

export function AttendeesCard({ attendees }: AttendeesCardProps) {
  const checkedInCount = attendees.filter((a) => a.isCheckedIn).length;

  return (
    <Card className="bg-white border-dash-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-dash-ink flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-dash-accent" />
            Attendees ({attendees.length})
          </span>
          <span className="text-sm font-normal text-dash-muted">
            {checkedInCount} checked in
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendees.map((attendee) => (
            <div
              key={attendee.id}
              className="p-4 rounded-lg border border-dash-border bg-dash-highlight/10"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-dash-ink">
                      {attendee.firstName} {attendee.lastName}
                    </p>
                    {attendee.isCheckedIn ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-dash-accent/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Checked In
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-dash-muted">{attendee.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dash-border">
                <div>
                  <p className="text-xs text-dash-accent">Ticket Type</p>
                  <p className="text-sm font-medium text-dash-ink">
                    {attendee.ticketTypeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-dash-accent">Ticket Code</p>
                  <p className="text-sm font-mono font-medium text-dash-ink">
                    {attendee.ticketCode}
                  </p>
                </div>
              </div>

              {attendee.isCheckedIn && attendee.checkedInAt && (
                <div className="mt-2 pt-2 border-t border-dash-border">
                  <p className="text-xs text-dash-accent">
                    Checked in on{" "}
                    {attendee.checkedInAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}