import React from 'react';
import styles from './RunTheGame.module.scss';
import { FiActivity, FiBookOpen, FiLayers, FiUsers } from 'react-icons/fi';

const WorkspacePreview = () => {
  return (
    <div className={styles.workspacePreview} aria-hidden="true">
      <div className={styles.previewTopbar}>
        <div className={styles.windowControls}>
          <span />
          <span />
          <span />
        </div>

        <span className={styles.previewUrl}>app.tapestry-ttrpg.com</span>
      </div>

      <div className={styles.previewShell}>
        <aside className={styles.previewSidebar}>
          <div className={styles.previewBrand}>
            <span className={styles.previewSigil}>T</span>
            <strong>Tapestry</strong>
          </div>

          <nav className={styles.previewNav}>
            <span className={styles.previewNavActive}>
              <FiLayers />
              Campaigns
            </span>

            <span>
              <FiUsers />
              Roster
            </span>

            <span>
              <FiBookOpen />
              Characters
            </span>

            <span>
              <FiActivity />
              Game Board
            </span>
          </nav>
        </aside>

        <div className={styles.previewMain}>
          <header className={styles.previewHeader}>
            <div>
              <span>Campaign workspace</span>
              <strong>The Endless Gauntlet</strong>
            </div>

            <span className={styles.previewStatus}>Active</span>
          </header>

          <div className={styles.previewMetrics}>
            <div>
              <span>Players</span>
              <strong>5</strong>
            </div>

            <div>
              <span>Characters</span>
              <strong>5</strong>
            </div>

            <div>
              <span>Open Threads</span>
              <strong>8</strong>
            </div>
          </div>

          <div className={styles.previewContent}>
            <div className={styles.previewPanel}>
              <span>Recent campaign activity</span>

              <div className={styles.activityItem}>
                <i />
                <div>
                  <strong>A character joined the campaign</strong>
                  <small>Moments ago</small>
                </div>
              </div>

              <div className={styles.activityItem}>
                <i />
                <div>
                  <strong>A new Thread was recorded</strong>
                  <small>Earlier today</small>
                </div>
              </div>
            </div>

            <div className={styles.previewPanel}>
              <span>Campaign roster</span>

              <div className={styles.avatarRow}>
                <i>A</i>
                <i>S</i>
                <i>B</i>
                <i>L</i>
                <i>+</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePreview;
