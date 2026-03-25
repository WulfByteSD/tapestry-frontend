'use client';

import { useState } from 'react';
import styles from './Sidebar.module.scss';
import { SidebarGroup, SidebarLink } from './sidebar.types';

type Props = {
  title: string;
  groups: SidebarGroup[]; // Changed from flat links to grouped
  currentPath?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean; // Whether sidebar can be collapsed
  defaultCollapsed?: boolean; // Whether sidebar starts collapsed
  LinkComponent?: any; // Next.js Link or custom link component
};

export default function Sidebar({
  title,
  groups,
  currentPath,
  logo,
  footer,
  collapsible = true,
  defaultCollapsed = false,
  LinkComponent = 'a', // Default to standard anchor tag
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const isLinkActive = (link: SidebarLink): boolean => {
    if (currentPath === link.href) return true;
    if (link.children) {
      return link.children.some((child) => currentPath === child.href);
    }
    return false;
  };

  const renderLink = (link: SidebarLink, depth: number = 0) => {
    const hasChildren = link.children && link.children.length > 0;
    const isActive = isLinkActive(link);

    return (
      <div key={link.href}>
        <LinkComponent
          href={link.href}
          className={`${styles.link} ${isActive ? styles.active : ''} ${hasChildren ? styles.parentLink : ''} ${depth > 0 ? styles.childLink : ''}`}
          style={{ paddingLeft: `${12 + depth * 10}px` }}
        >
          {link.icon && <span className={styles.icon}>{link.icon}</span>}
          {!isCollapsed && (
            <span className={styles.label}>
              {link.label}
              {link.badge !== undefined && link.badge > 0 && <span className={styles.badge}>{link.badge}</span>}
            </span>
          )}
        </LinkComponent>
        {hasChildren && !isCollapsed && <div className={styles.childrenContainer}>{link.children!.map((child) => renderLink(child, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {collapsible && (
        <button className={styles.collapseButton} onClick={toggleCollapse} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? '→' : '←'}
        </button>
      )}

      {/* Fixed Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.logoContainer}>
          {logo && <div className={styles.logo}>{logo}</div>}
          {!isCollapsed && <div className={styles.title}>{title}</div>}
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className={styles.mainContent}>
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.group}>
            {!isCollapsed && <h2 className={styles.groupHeader}>{group.title}</h2>}
            <nav className={styles.links}>{group.links.map((link) => renderLink(link))}</nav>
          </div>
        ))}
      </div>

      {/* Fixed Footer Section */}
      {footer && <div className={styles.footerSection}>{footer}</div>}
    </aside>
  );
}
