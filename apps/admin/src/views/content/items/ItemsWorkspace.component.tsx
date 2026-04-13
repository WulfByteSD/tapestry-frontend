'use client';

import React, { useMemo } from 'react';
import { Modal, Tabs } from '@tapestry/ui';
import type { TabsItem } from '@tapestry/ui';
import { useItemWindows } from './useItemWindows';
import ItemsListView from './ItemsView.component';
import ItemEditor from './itemEditor/ItemEditor.component';
import styles from './ItemsWorkspace.module.scss';

export default function ItemsWorkspace() {
  const { windows, activeKey, setActiveKey, pendingClose, openExisting, openNew, closeWindow, setWindowDirty, replaceNew, confirmClose, cancelClose } = useItemWindows();

  const pendingWindow = pendingClose ? windows.find((w) => w.key === pendingClose) : null;

  const tabItems = useMemo<TabsItem[]>(
    () =>
      windows.map((win) => {
        if (win.key === 'list') {
          return {
            key: 'list',
            label: 'Items',
            closable: false,
            children: <ItemsListView onRowClick={(id, name) => openExisting(id, name, true)} onNewItem={() => openNew(true)} />,
          };
        }

        const editorId = 'id' in win ? win.id : undefined;

        return {
          key: win.key,
          label: win.label,
          closable: true,
          children: (
            <ItemEditor
              id={editorId}
              onCreated={(id, name) => replaceNew(win.key, id, name)}
              onDeleted={() => closeWindow(win.key, true)}
              onCancel={() => closeWindow(win.key, true)}
              onDirtyChange={(dirty) => setWindowDirty(win.key, dirty)}
            />
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [windows]
  );

  return (
    <div className={styles.workspace}>
      <Tabs
        items={tabItems}
        activeKey={activeKey}
        onChange={setActiveKey}
        onRemove={closeWindow}
        variant="underline"
        fit="content"
        keepMounted={false}
        ariaLabel="Item workspace"
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
