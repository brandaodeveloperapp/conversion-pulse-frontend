export type NavKey = 'overview' | 'channels' | 'table' | 'compare' | 'about';

export interface NavItem {
  href: string;
  key: NavKey;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/overview', key: 'overview' },
  { href: '/channels', key: 'channels' },
  { href: '/table', key: 'table' },
  { href: '/compare', key: 'compare' },
  { href: '/about', key: 'about' },
];
