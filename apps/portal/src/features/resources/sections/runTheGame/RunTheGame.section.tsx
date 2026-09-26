import { InteractiveBook } from '@tapestry/ui';
import { FiActivity, FiArrowUpRight, FiBookOpen, FiCheckCircle, FiDownload, FiLayers, FiMonitor, FiUsers } from 'react-icons/fi';

import { rulesGuideResource, storyweaverWorkspace, storyweaversLoomResource, threadBuilderResource } from './RunTheGameSection.data';

import styles from './RunTheGame.module.scss';
import WorkspacePreview from './WorkspacePreview.component';

export function RunTheGameSection() {
  return (
    <section id="run-the-game" className={styles.section} aria-labelledby="run-the-game-title">
      <header className={styles.header}>
        <p className={styles.kicker}>Run the game</p>

        <h2 id="run-the-game-title">
          Prepare less.
          <br />
          Keep the story moving.
        </h2>

        <p className={styles.description}>
          Make confident rulings, shape flexible adventures, and manage your campaign with tools built around the way Tapestry is actually played.
        </p>
      </header>

      <article className={styles.rulesCard}>
        <div className={styles.rulesBook}>
          <InteractiveBook
            title={rulesGuideResource.title}
            coverSrc={rulesGuideResource.coverSrc}
            coverAlt={`${rulesGuideResource.title} cover`}
            expanded
            showMetadata={false}
            showSpineLabel={false}
            width="clamp(13rem, 19vw, 17rem)"
            height="clamp(19rem, 28vw, 25rem)"
            spineWidth="3.5rem"
          />
        </div>

        <div className={styles.rulesCopy}>
          <p className={styles.stepLabel}>{rulesGuideResource.eyebrow}</p>

          <h3>{rulesGuideResource.title}</h3>

          <p>{rulesGuideResource.description}</p>

          <ul className={styles.tagList}>
            {rulesGuideResource.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href={rulesGuideResource.downloadHref} target="_blank" rel="noreferrer">
              <FiDownload aria-hidden="true" />
              Download the guide
            </a>

            <a className={styles.secondaryAction} href={rulesGuideResource.previewHref} target="_blank" rel="noreferrer">
              Preview the guide
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>

      <article className={styles.workspaceCard}>
        <div className={styles.workspaceCopy}>
          <div className={styles.developmentBadge}>
            <span aria-hidden="true" />
            Heavy development
          </div>

          <p className={styles.stepLabel}>{storyweaverWorkspace.eyebrow}</p>

          <h3>{storyweaverWorkspace.title}</h3>

          <p>{storyweaverWorkspace.description}</p>

          <ul className={styles.featureList}>
            {storyweaverWorkspace.features.map((feature) => (
              <li key={feature}>
                <FiCheckCircle aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>

          <aside className={styles.developmentNotice}>
            <strong>The workspace is still being built.</strong>
            <p>Existing campaign tools are usable, but layouts, workflows, and available features may change as development continues.</p>
          </aside>

          <div className={styles.workspaceAction}>
            <a className={styles.primaryAction} href={storyweaverWorkspace.href} target="_blank" rel="noreferrer">
              <FiMonitor aria-hidden="true" />
              {storyweaverWorkspace.actionLabel}
              <FiArrowUpRight aria-hidden="true" />
            </a>

            <span>{storyweaverWorkspace.accessNote}</span>
          </div>
        </div>

        <WorkspacePreview />
      </article>

      <div className={styles.planningGrid}>
        <article className={styles.planningCard}>
          <div className={styles.planningIcon}>
            <FiLayers aria-hidden="true" />
          </div>

          <p className={styles.stepLabel}>{storyweaversLoomResource.eyebrow}</p>

          <h3>{storyweaversLoomResource.title}</h3>

          <p>{storyweaversLoomResource.description}</p>

          <div className={styles.loomFlow} aria-label={storyweaversLoomResource.flow.join(' to ')}>
            {storyweaversLoomResource.flow.map((step, index) => (
              <span key={step}>
                <strong>{step}</strong>

                {index < storyweaversLoomResource.flow.length - 1 && <i aria-hidden="true">→</i>}
              </span>
            ))}
          </div>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href={storyweaversLoomResource.downloadHref} target="_blank" rel="noreferrer">
              <FiDownload aria-hidden="true" />
              Download the Loom
            </a>

            <a className={styles.secondaryAction} href={storyweaversLoomResource.previewHref} target="_blank" rel="noreferrer">
              Preview
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </article>

        <article className={styles.planningCard}>
          <div className={styles.planningIcon}>
            <FiBookOpen aria-hidden="true" />
          </div>

          <p className={styles.stepLabel}>{threadBuilderResource.eyebrow}</p>

          <h3>{threadBuilderResource.title}</h3>

          <p>{threadBuilderResource.description}</p>

          <span className={styles.resourceMeta}>{threadBuilderResource.meta}</span>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href={threadBuilderResource.downloadHref} target="_blank" rel="noreferrer">
              <FiDownload aria-hidden="true" />
              Download the framework
            </a>

            <a className={styles.secondaryAction} href={threadBuilderResource.previewHref} target="_blank" rel="noreferrer">
              Preview
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
