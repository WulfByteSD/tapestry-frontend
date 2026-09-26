'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Modal, Tabs, type TabsItem } from '@tapestry/ui';
import ResourceEditor from '../resourceEditor/ResourceEditor.component';
import ResourceList from '../resourceList/ResourceList.component';
import { useResourceWindows } from './useResourceWindows';
import styles from './ResourcesWorkspace.module.scss';

type ResourcesWorkspaceProps = {
  initialResourceId?: string;
  initialNew?: boolean;
};

export default function ResourcesWorkspace({ initialResourceId, initialNew = false }: ResourcesWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const bootstrappedRef = useRef(false);
  const {
    windows,
    activeKey,
    setActiveKey,
    pendingClose,
    openExisting,
    openNew,
    closeWindow,
    setWindowDirty,
    replaceNew,
    renameWindow,
    confirmClose,
    cancelClose,
  } = useResourceWindows();

  useEffect(() => {
    if (bootstrappedRef.current) return;
    if (!initialNew && !initialResourceId) return;

    bootstrappedRef.current = true;

    if (initialNew) {
      openNew(false);
    } else if (initialResourceId) {
      openExisting(initialResourceId, 'Resource', false);
    }

    if (pathname !== '/resources') {
      router.replace('/resources');
    }
  }, [initialNew, initialResourceId, openExisting, openNew, pathname, router]);

  const pendingWindow = pendingClose ? windows.find((windowEntry) => windowEntry.key === pendingClose) : null;

  const tabItems = useMemo<TabsItem[]>(
    () =>
      windows.map((windowEntry) => {
        if (windowEntry.key === 'list') {
          return {
            key: 'list',
            label: 'Resources',
            closable: false,
            children: <ResourceList onRowClick={(id, label) => openExisting(id, label, true)} onNewResource={() => openNew(true)} />,
          };
        }

        const editorId = 'id' in windowEntry ? windowEntry.id : undefined;

        return {
          key: windowEntry.key,
          label: windowEntry.label,
          closable: true,
          children: (
            <ResourceEditor
              id={editorId}
              onCreated={(id, label) => replaceNew(windowEntry.key, id, label)}
              onDeleted={() => closeWindow(windowEntry.key, true)}
              onCancel={() => closeWindow(windowEntry.key)}
              onDirtyChange={(dirty) => setWindowDirty(windowEntry.key, dirty)}
              onLabelChange={(label) => renameWindow(windowEntry.key, label)}
            />
          ),
        };
      }),
    [closeWindow, openExisting, openNew, renameWindow, replaceNew, setWindowDirty, windows]
  );

  return (
    <div className={styles.workspace}>
      <Tabs
        items={tabItems}
        activeKey={activeKey}
        onChange={setActiveKey}
        onRemove={closeWindow}
        variant="underline"
        keepMounted
        fit="content"
        ariaLabel="Resource workspace"
      />

      <Modal
        open={pendingClose !== null}
        title="Unsaved Changes"
        onCancel={cancelClose}
        onOk={confirmClose}
        okText="Close Tab"
        cancelText="Keep Editing"
        okButtonProps={{ tone: 'danger' }}
      >
        <p>
          <strong>{pendingWindow?.label ?? 'This tab'}</strong> has unsaved changes. Close it anyway?
        </p>
        <p>Your changes will be lost.</p>
      </Modal>
    </div>
  );
}
