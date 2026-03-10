"use client";

import React from "react";
import clsx from "clsx";
import styles from "./Header.module.scss";
import { RxHamburgerMenu } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import { Avatar } from "../avatar";
import { Tooltip } from "../tooltip";

export type HeaderUser = {
  fullName: string;
  profileImageUrl?: string | null;
};

export type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * User data to display in the header
   */
  user?: HeaderUser;

  /**
   * Callback when the logout button is clicked
   */
  onLogout?: () => void;

  /**
   * Callback when the menu toggle (hamburger) is clicked
   */
  onMenuToggle?: () => void;

  /**
   * Optional notifications component/element to render
   */
  notifications?: React.ReactNode;

  /**
   * Whether to show the menu toggle button
   * @default true
   */
  showMenuToggle?: boolean;

  /**
   * Size of the avatar
   * @default "md"
   */
  avatarSize?: "sm" | "md" | "lg";

  /**
   * Custom content to render on the left side of the header
   */
  leftContent?: React.ReactNode;

  /**
   * Custom content to render on the right side (before user info)
   */
  rightContent?: React.ReactNode;
};

export default function Header({
  user,
  onLogout,
  onMenuToggle,
  notifications,
  showMenuToggle = true,
  avatarSize = "md",
  leftContent,
  rightContent,
  className,
  ...rest
}: HeaderProps) {
  return (
    <div {...rest} className={clsx(styles.header, className)}>
      <div className={styles.headerLeft}>
        {showMenuToggle && (
          <div className={styles.hamburger} onClick={onMenuToggle}>
            <RxHamburgerMenu />
          </div>
        )}

        {leftContent}
      </div>

      <div className={styles.headerRight}>
        <div className={styles.userContainer}>
          {rightContent}

          {user && (
            <div className={styles.user}>
              <div className={styles.userInfo}>
                <p>{user.fullName}</p>
              </div>
              <Avatar src={user.profileImageUrl} name={user.fullName} size={avatarSize} alt={user.fullName} />
            </div>
          )}

          {notifications && <div className={styles.notificationsSlot}>{notifications}</div>}

          {onLogout && (
            <Tooltip title="Logout" placement="left">
              <button className={styles.logoutButton} onClick={onLogout} aria-label="Logout" type="button">
                <BiLogOutCircle />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
