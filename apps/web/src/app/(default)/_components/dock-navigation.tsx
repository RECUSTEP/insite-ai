'use client';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import {
  AtSignIcon,
  FileTextIcon,
  HistoryIcon,
  HomeIcon,
  Instagram,
  MapPinIcon,
  SettingsIcon,
  TrendingUpIcon,
  UserRoundSearchIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { css } from 'styled-system/css';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  path: string;
};

type Props = {
  seoAddonEnabled: boolean;
};

export function DockNavigation({ seoAddonEnabled }: Props) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: <HomeIcon />, label: 'ホーム', path: '/home' },
    { icon: <UserRoundSearchIcon />, label: '分析AI', path: '/competitor-analysis' },
    { icon: <TrendingUpIcon />, label: 'AIコンサルティング', path: '/improvement-proposal' },
    { icon: <Instagram />, label: 'Instagram', path: '/writing' },
    { icon: <AtSignIcon />, label: 'Threads', path: '/threads' },
    { icon: <MapPinIcon />, label: 'Google Map', path: '/google-map' },
    ...(seoAddonEnabled
      ? [{ icon: <FileTextIcon />, label: 'SEO記事', path: '/seo-articles' }]
      : []),
    { icon: <HistoryIcon />, label: '履歴', path: '/history' },
    { icon: <SettingsIcon />, label: '設定', path: '/' },
  ];

  return (
    <div
      style={{ viewTransitionName: "dock-nav" }}
      className={css({
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'fit-content',
        maxWidth: 'calc(100vw - 16px)',
      })}
    >
      <Dock magnification={64} panelHeight={52} distance={120}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} tabIndex={-1}>
              <DockItem
                className={css({
                  aspectRatio: '1/1',
                  borderRadius: '14px',
                  bg: isActive
                    ? { base: '#09090B', _dark: '#FAFAFA' }
                    : { base: '#F4F4F5', _dark: '#27272A' },
                  transition: 'background 0.15s ease',
                  _hover: {
                    bg: isActive
                      ? { base: '#09090B', _dark: '#FAFAFA' }
                      : { base: '#E4E4E7', _dark: '#3F3F46' },
                  },
                })}
              >
                <DockLabel>{item.label}</DockLabel>
                <DockIcon
                  className={css({
                    color: isActive
                      ? { base: '#FAFAFA', _dark: '#09090B' }
                      : { base: '#71717A', _dark: '#A1A1AA' },
                  })}
                >
                  {item.icon}
                </DockIcon>
              </DockItem>
            </Link>
          );
        })}
      </Dock>
    </div>
  );
}
