export interface NavItem {
  href: string;
  label: string;
  hint: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/overview', label: 'Visão geral', hint: 'KPIs, série e tabela' },
  { href: '/channels', label: 'Por canal', hint: 'Cada canal no seu eixo' },
  { href: '/table', label: 'Tabela', hint: 'Todos os pontos' },
  { href: '/compare', label: 'Comparação', hint: 'Dois recortes lado a lado' },
  { href: '/about', label: 'Sobre os dados', hint: 'O que a série significa' },
];
