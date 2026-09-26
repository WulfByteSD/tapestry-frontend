'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/brandMark/BrandMark.component';
import { portalCtas, portalNavigation } from '@/config/portal-navigation';
import type { PortalNavigationGroup, PortalNavigationItem } from '@/config/portal-navigation';
import styles from './Navbar.module.scss';

type NavbarProps = {
  isMobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
  onCloseMobileMenu: () => void;
};

const portalUtilityLinks = [
  // portalCtas.cart, portalCtas.checkout
] as any[];

function isPortalNavigationGroup(item: PortalNavigationItem): item is PortalNavigationGroup {
  return 'items' in item;
}

export function Navbar({ isMobileMenuOpen, onOpenMobileMenu, onCloseMobileMenu }: NavbarProps) {
  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.inner}>
          <BrandMark />

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {portalNavigation.map((item) =>
              isPortalNavigationGroup(item) ? (
                <details key={item.label} className={styles.navDropdown}>
                  <summary className={styles.navSummary}>{item.label}</summary>
                  <div className={styles.dropdownMenu}>
                    {item.items.map((link) => (
                      <Link key={link.href} href={link.href} className={styles.dropdownLink}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link key={item.href} href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className={styles.actions}>
            <div className={styles.utilityLinks} aria-label="Utility links">
              {portalUtilityLinks?.map((link) => (
                <Link key={link.href} href={link.href} className={styles.utilityLink}>
                  {link.label}
                </Link>
              ))}
            </div>

            <Link href={portalCtas.getPlayersGuide.href} className={styles.desktopCta}>
              {portalCtas.getPlayersGuide.label}
            </Link>

            <button
              type="button"
              className={[styles.menuButton, isMobileMenuOpen ? styles.menuButtonOpen : ''].filter(Boolean).join(' ')}
              onClick={isMobileMenuOpen ? onCloseMobileMenu : onOpenMobileMenu}
              aria-controls="portal-mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <span className={styles.menuButtonLine} aria-hidden="true" />
              <span className={styles.menuButtonLine} aria-hidden="true" />
              <span className={styles.menuButtonLine} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className={[styles.mobileLayer, isMobileMenuOpen ? styles.mobileLayerOpen : ''].filter(Boolean).join(' ')} aria-hidden={!isMobileMenuOpen}>
        <button type="button" className={styles.mobileBackdrop} onClick={onCloseMobileMenu} aria-label="Close navigation overlay" tabIndex={isMobileMenuOpen ? 0 : -1} />

        <div id="portal-mobile-navigation" className={styles.mobileDrawer} role="dialog" aria-modal="true" aria-label="Site navigation">
          <div className={styles.mobileHeader}>
            <BrandMark compact tabIndex={isMobileMenuOpen ? 0 : -1} />

            <button type="button" className={styles.closeButton} onClick={onCloseMobileMenu} aria-label="Close navigation menu" tabIndex={isMobileMenuOpen ? 0 : -1}>
              <span aria-hidden="true">x</span>
            </button>
          </div>

          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            {portalNavigation.map((item) =>
              isPortalNavigationGroup(item) ? (
                <section key={item.label} className={styles.mobileGroup} aria-labelledby={`portal-mobile-group-${item.label}`}>
                  <h2 id={`portal-mobile-group-${item.label}`} className={styles.mobileGroupTitle}>
                    {item.label}
                  </h2>
                  <div className={styles.mobileGroupLinks}>
                    {item.items.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={styles.mobileLink}
                        onClick={onCloseMobileMenu}
                        tabIndex={isMobileMenuOpen ? 0 : -1}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : (
                <Link key={item.href} href={item.href} className={styles.mobileLink} onClick={onCloseMobileMenu} tabIndex={isMobileMenuOpen ? 0 : -1}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className={styles.mobileUtilityRail}>
            <Link href={portalCtas.getPlayersGuide.href} className={styles.mobileCta} onClick={onCloseMobileMenu} tabIndex={isMobileMenuOpen ? 0 : -1}>
              {portalCtas.getPlayersGuide.label}
            </Link>

            <div className={styles.mobileUtilityLinks}>
              {portalUtilityLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.mobileUtilityLink}
                  onClick={onCloseMobileMenu}
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
