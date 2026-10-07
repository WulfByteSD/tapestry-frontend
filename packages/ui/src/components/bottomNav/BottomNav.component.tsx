'use client';

import { motion } from 'framer-motion';
import styles from './BottomNav.module.scss';
import type { BottomNavLink, BottomNavProps } from './bottomNav.types';

function isLinkActive(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(href + '/');
}

function getBadgeContent(count: number): string {
  return count > 99 ? '99+' : String(count);
}

export default function BottomNav(props: BottomNavProps) {
  const { currentPath, LinkComponent = 'a', className, labels = true } = props;
  const LinkEl = LinkComponent as React.ElementType;
  const expressive = props.variant === 'expressive';

  const renderBadge = (link: BottomNavLink) => {
    if (link.badge === undefined || link.badge <= 0) return null;

    return (
      <span className={styles.badge} aria-hidden="true">
        {getBadgeContent(link.badge)}
      </span>
    );
  };

  const getAccessibleLabel = (link: BottomNavLink) => {
    if (link.badge === undefined || link.badge <= 0) return link.label;
    return `${link.label}, ${link.badgeAriaLabel ?? link.badge}`;
  };

  const renderSideLink = (link: BottomNavLink) => {
    const active = isLinkActive(link.href, currentPath);

    return (
      <div key={link.href} className={styles.itemWrap}>
        {active && <motion.span layoutId="bottom-nav-indicator" className={styles.indicator} transition={{ type: 'spring', stiffness: 380, damping: 36 }} />}

        <motion.div className={styles.itemMotion} whileTap={{ scale: 0.86 }}>
          <LinkEl
            href={link.href}
            className={[styles.item, active ? styles.active : ''].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
            aria-label={getAccessibleLabel(link)}
          >
            <span className={styles.icon}>
              {link.icon}
              {renderBadge(link)}
            </span>
            {labels && <span className={styles.label}>{link.label}</span>}
          </LinkEl>
        </motion.div>
      </div>
    );
  };

  const renderCenterLink = (link: BottomNavLink) => {
    const active = isLinkActive(link.href, currentPath);

    return (
      <div className={styles.centerSlot}>
        <motion.div className={styles.centerMotion} whileTap={{ scale: 0.9 }}>
          <LinkEl
            href={link.href}
            className={[styles.centerItem, active ? styles.centerActive : ''].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
            aria-label={getAccessibleLabel(link)}
          >
            <span className={styles.centerIcon}>
              {link.icon}
              {renderBadge(link)}
            </span>
            {labels && <span className={styles.centerLabel}>{link.label}</span>}
          </LinkEl>
        </motion.div>
      </div>
    );
  };

  return (
    <motion.nav
      className={[styles.nav, expressive ? styles.expressive : '', className].filter(Boolean).join(' ')}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
      aria-label="Mobile navigation"
    >
      {expressive ? (
        <>
          <div className={styles.sideGroup}>{(props.layout.left ?? []).map(renderSideLink)}</div>
          {renderCenterLink(props.layout.center)}
          <div className={styles.sideGroup}>{(props.layout.right ?? []).map(renderSideLink)}</div>
        </>
      ) : (
        props.links.map(renderSideLink)
      )}
    </motion.nav>
  );
}
