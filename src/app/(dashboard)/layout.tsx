import { Shell } from '@/components/shell';
import { SidebarBody } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell sidebar={<SidebarBody />}>{children}</Shell>;
}
