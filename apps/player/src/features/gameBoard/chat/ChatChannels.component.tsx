import { Button, SelectField } from '@tapestry/ui';
import { TbDice, TbLock } from 'react-icons/tb';
import type { ChatChannelDto } from '@tapestry/types';
import type { ChatChannelsProps } from './ChatChannels.types';
import styles from './Chat.module.scss';

export function ChatChannels({ channels, selectedId, onSelect, rollsSelected, onSelectRolls, canManage, onCreate }: ChatChannelsProps) {
  const pinned = (['ic', 'ooc'] as const).flatMap((key) => channels.filter((channel) => channel.defaultKey === key));
  const conversations = channels.filter((channel) => channel.defaultKey === null && !channel.scene);
  const encounters = channels.filter(channel => channel.defaultKey === null && channel.scene && channel.scene.status !== 'completed');
  const completed = channels.filter(channel => channel.defaultKey === null && channel.scene?.status === 'completed');
  const option = (channel: ChatChannelDto) => <option key={channel.id} value={channel.id}>{channel.name} · {channel.mode.toUpperCase()}{channel.archived ? ' · Archived' : ''}{channel.unreadCount ? ` · ${channel.unreadCount} unread` : ''}</option>;
  const channelButton = (channel: ChatChannelDto) => (
    <button key={channel.id} type="button" className={`${styles.channelItem} ${!rollsSelected && channel.id === selectedId ? styles.selectedChannel : ''}`} onClick={() => onSelect(channel.id)} aria-current={!rollsSelected && channel.id === selectedId ? 'true' : undefined}>
      <span className={styles.channelName}>{channel.visibility === 'private' ? <TbLock size={15} aria-label="Private" /> : null}{channel.name}</span>
      <span className={styles.channelDetail}>{channel.mode === 'ic' ? 'In character' : 'Out of character'}{channel.scene && channel.defaultKey ? ` · ${channel.scene.title}` : ''}{channel.archived ? ' · Archived' : ''}</span>
      {channel.unreadCount > 0 ? <span className={styles.unread}>{channel.unreadCount} unread</span> : null}
    </button>
  );
  return (
    <aside className={styles.channelRail} aria-label="Chat channels">
      <div className={styles.channelRailHeader}><h3>Channels</h3>{canManage ? <Button data-chat-control="new-channel" size="sm" variant="ghost" type="button" onClick={onCreate}>New</Button> : null}</div>
      <div className={styles.compactPicker}>
        <SelectField id="chat-channel-picker" label="Channel" value={rollsSelected ? 'roll-history' : selectedId ?? ''} onChange={(event) => event.target.value === 'roll-history' ? onSelectRolls() : onSelect(event.target.value)}>
          {!channels.length ? <option value="">Conversations</option> : null}
          {pinned.map(option)}
          <option value="roll-history">Rolls · Roll history</option>
          {!!encounters.length && <optgroup label="Encounters">{encounters.map(option)}</optgroup>}
          {!!completed.length && <optgroup label="Completed encounters">{completed.map(option)}</optgroup>}
          {conversations.length > 0 ? <optgroup label="Conversations">{conversations.map(option)}</optgroup> : null}
        </SelectField>
      </div>
      <div className={styles.channelList}>
        <div className={styles.pinnedChannels} role="group" aria-label="Pinned channels">
        {pinned.map(channelButton)}
        {!channels.length ? <button type="button" className={`${styles.channelItem} ${!rollsSelected ? styles.selectedChannel : ''}`} onClick={() => onSelect('')} aria-current={!rollsSelected ? 'true' : undefined}><span className={styles.channelName}>Conversations</span><span className={styles.channelDetail}>Table chat</span></button> : null}
        <button type="button" className={`${styles.channelItem} ${styles.rollsChannel} ${rollsSelected ? styles.selectedChannel : ''}`} onClick={onSelectRolls} aria-current={rollsSelected ? 'true' : undefined}><span className={styles.channelName}><TbDice size={17} aria-hidden="true" />Rolls</span><span className={styles.channelDetail}>Roll history</span></button>
        </div>
        {!!encounters.length && <section className={`${styles.conversationChannels} ${styles.sceneChannels}`} aria-labelledby="encounter-channels-heading"><h4 id="encounter-channels-heading">Encounters</h4><div className={styles.conversationChannelList} role="region" aria-label="Active encounter scenes" tabIndex={0}>{encounters.map(channelButton)}</div></section>}
        {!!completed.length && <details className={styles.completedSceneChannels}><summary>Completed encounters ({completed.length})</summary>{completed.map(channelButton)}</details>}
        <section className={styles.conversationChannels} aria-labelledby="other-conversations-heading">
          <h4 id="other-conversations-heading">Conversations</h4>
          <div className={styles.conversationChannelList} role="region" aria-label="Other conversations" tabIndex={0}>
            {conversations.length ? conversations.map(channelButton) : <p className={styles.noConversations}>No other conversations.</p>}
          </div>
        </section>
      </div>
    </aside>
  );
}
