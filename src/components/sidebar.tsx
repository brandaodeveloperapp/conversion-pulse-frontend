import { Brand } from './brand';
import { Nav } from './nav';
import { Filters } from './filters';
import { SidebarFooter } from './sidebar-footer';

export function SidebarBody() {
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Brand />
      <Nav />
      <div className="border-t border-border-subtle pt-5">
        <Filters />
      </div>
      <div className="mt-auto">
        <SidebarFooter />
      </div>
    </div>
  );
}
