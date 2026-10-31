import { useEffect, useRef, useState } from 'react';
import { Button, Loader } from '@tapestry/ui';
import { setupChatChannels } from '@tapestry/api-client';
import type { ChatChannelDto, ChatMessageDto } from '@tapestry/types';
import { api } from '@/lib/api';
import { ChatChannels } from './ChatChannels.component';
import { ChatComposer } from './ChatComposer.form';
import { ChatTranscript } from './ChatTranscript.component';
import { ChatChannelModal } from './ChatChannel.modal';
import { ChatMessageModal } from './ChatMessageAction.modal';
import { emptyChatDraft } from './Chat.drafts.hooks';
import { chatError } from './Chat.helpers';
import { RollHistory } from '../rollHistory/RollHistory.component';
import type { ChatProps } from './Chat.types';
import { currentSceneTurn } from '../scenes/Scene.helpers';
import { SceneDefenseNotice } from '../scenes/SceneDefenseNotice.component';
import sceneStyles from '../scenes/Scene.module.scss';
import styles from './Chat.module.scss';

export default function Chat({ campaign, currentUserId, playerName, userRole, isSW, characterState, chat, scenes, tableOpen, onToggleTable }: ChatProps) {
  const [channelEditor, setChannelEditor] = useState<ChatChannelDto | null | undefined>(undefined);
  const [messageAction, setMessageAction] = useState<{ action: 'edit' | 'remove'; message: ChatMessageDto } | null>(null);
  const [settingUp, setSettingUp] = useState(false);
  const [setupError, setSetupError] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const channelOpenerRef = useRef<'manage-channel' | 'new-channel'>('new-channel');
  const returnChannelFocusRef = useRef(false);
  const { channel } = chat;
  const rollsSelected = chat.view === 'rolls';
  const channelsAvailable = !chat.channelsQuery.isError && !chat.accessRefreshing;
  const campaignArchived = campaign.status === 'archived';
  const discordPlay = campaign.playSurface === 'discord';
  const canManage = isSW && !campaignArchived && !discordPlay;
  const closeChannelEditor = () => {
    returnChannelFocusRef.current = true;
    setChannelEditor(undefined);
  };
  useEffect(() => {
    if (!returnChannelFocusRef.current || channelEditor !== undefined || chat.accessRefreshing) return;
    const opener = sectionRef.current?.querySelector<HTMLElement>(`[data-chat-control="${channelOpenerRef.current}"]`);
    if (opener) { opener.focus(); returnChannelFocusRef.current = false; }
  }, [channelEditor, chat.accessRefreshing, chat.channelsQuery.dataUpdatedAt]);
  const scene = channel?.scene;
  const sceneDetail = scenes.scene?.id === scene?.id ? scenes.scene : null;
  const readOnlyReason = scene?.status === 'draft' ? 'This scene is in private preparation. Open it for players before posting.' : scene?.status === 'completed' ? 'This scene is completed. Its conversation is read-only.' : scene && !scene.canPost ? 'You are reading this scene. Only participating character owners and Storyweavers can post.' : discordPlay ? 'This table plays in Discord. Your Tapestry conversations are preserved until the Storyweaver switches back.' : campaignArchived ? 'This campaign is archived. You can read its conversations.' : channel?.archived ? 'This channel is archived. You can read its conversation.' : userRole === 'observer' ? 'You’re observing this table. Chat is read-only.' : !userRole ? 'Your table membership is loading.' : channel?.canPost === false ? 'Posting is paused for this conversation.' : null;
  const setup = async () => {
    if (settingUp) return;
    setSettingUp(true);
    setSetupError('');
    try { await setupChatChannels(api, campaign._id); await chat.refreshChannels(); }
    catch (error) { setSetupError(chatError(error)); }
    finally { setSettingUp(false); }
  };

  return (
    <section ref={sectionRef} className={styles.chat} aria-label="Campaign chat">
      <div className={styles.chatGrid}>
        <ChatChannels channels={channelsAvailable ? chat.channels : []} selectedId={channelsAvailable ? channel?.id ?? null : null} onSelect={chat.selectChannel} rollsSelected={rollsSelected} onSelectRolls={chat.selectRolls} canManage={canManage && channelsAvailable && !chat.channelsQuery.isLoading} onCreate={() => { channelOpenerRef.current = 'new-channel'; setChannelEditor(null); }} />
        {rollsSelected ? <div className={styles.rollHistory}><RollHistory key={`${campaign._id}:${currentUserId}`} campaignId={campaign._id} currentUserId={currentUserId} /></div>
          : chat.channelsQuery.isLoading ? <div className={styles.empty}><Loader label="Opening table conversations…" /></div>
          : chat.channelsQuery.isError ? <div className={styles.empty}><h2>Chat is unavailable</h2><p>{chatError(chat.channelsQuery.error)}</p><Button type="button" variant="outline" onClick={() => void chat.channelsQuery.refetch()}>Try again</Button></div>
          : chat.accessRefreshing ? <div className={styles.empty}><Loader label="Updating channel access…" /></div>
          : !chat.channels.length ? <div className={styles.empty}><h2>Conversations at your table</h2><p>{canManage ? 'Set up an in-character channel for the story and an out-of-character channel for the table.' : campaignArchived ? 'No conversations were set up for this campaign.' : 'Your Storyweaver has not set up any channels you can access yet.'}</p>{canManage ? <Button type="button" onClick={() => void setup()} isLoading={settingUp}>Set up IC & OOC channels</Button> : null}{setupError ? <p className={styles.error} role="alert">{setupError}</p> : null}</div>
          : channel ? <div className={styles.conversation}>
          <header className={scene ? sceneStyles.header : styles.conversationHeader}><div>{scene && <p className={sceneStyles.eyebrow}>{scene.encounterTitle}</p>}<h2>{scene?.title ?? channel.name}</h2>{scene && <p>{sceneDetail ? `Round ${sceneDetail.turnOrder.round} · ${currentSceneTurn(sceneDetail)}` : 'Updating scene status…'} · {scene.mode === 'opposed' ? 'Opposed defense' : 'Defense TN'}</p>}<p>{channel.mode === 'ic' ? 'In character' : 'Out of character'} · {channel.visibility === 'private' ? 'Private conversation' : 'Everyone at the table'}{channel.archived ? ' · Archived' : ''}</p></div>{scene ? <Button size="sm" variant="outline" aria-controls="board-table-panel" aria-expanded={tableOpen} onClick={onToggleTable}>{tableOpen ? 'Hide tools' : 'Scene tools'}</Button> : canManage ? <Button data-chat-control="manage-channel" size="sm" variant="outline" type="button" onClick={() => { channelOpenerRef.current = 'manage-channel'; setChannelEditor(channel); }}>Manage</Button> : null}</header>
          {!chat.isConnected ? <p className={styles.connectionStatus}>Live connection interrupted. Messages refresh when the connection returns.</p> : null}
          <ChatTranscript key={channel.id} channelId={channel.id} messages={chat.messages} loading={chat.historyQuery.isLoading} error={chat.historyQuery.isError} hasOlder={chat.historyQuery.hasNextPage} loadingOlder={chat.historyQuery.isFetchingNextPage} currentUserId={currentUserId} isSW={isSW} readOnly={Boolean(readOnlyReason)} replyDisabled={['sending', 'failed'].includes(chat.draftState.drafts[channel.id]?.status ?? '')} onOlder={() => chat.historyQuery.fetchNextPage()} onRetry={() => void chat.historyQuery.refetch()} onRead={chat.markRead} onReply={(message) => chat.draftState.setReply(channel.id, message)} onEdit={(message) => setMessageAction({ action: 'edit', message })} onRemove={(message) => setMessageAction({ action: 'remove', message })} />
          {scene && <SceneDefenseNotice key={scene.id} sceneId={scene.id} state={scenes} characterState={characterState} readOnly={campaignArchived || discordPlay || channel.archived || userRole === 'observer' || !userRole} />}
          <ChatComposer scene={sceneDetail} scenes={scenes} channel={channel} draft={chat.draftState.drafts[channel.id] ?? emptyChatDraft} currentUserId={currentUserId} playerName={playerName} isSW={isSW} readOnlyReason={readOnlyReason} characterState={characterState} onContent={(content) => chat.draftState.updateContent(channel.id, content)} onComposition={(composition) => chat.draftState.updateComposition(channel.id, composition)} onClearReply={() => chat.draftState.setReply(channel.id, null)} onDiscardAttempt={() => chat.draftState.discardAttempt(channel.id)} onSend={(speaker, speakerLabel) => chat.send(channel.id, speaker, { speakerLabel, channelName: channel.name })} />
        </div> : null}
      </div>
      {channelEditor !== undefined && canManage && channelsAvailable ? <ChatChannelModal key={channelEditor?.id ?? 'new'} campaign={campaign} channel={channelEditor} onClose={closeChannelEditor} onSaved={chat.refreshChannels} /> : null}
      {messageAction && !readOnlyReason && !rollsSelected && channelsAvailable ? <ChatMessageModal key={`${messageAction.message.id}:${messageAction.action}`} campaignId={campaign._id} message={messageAction.message} action={messageAction.action} onClose={() => setMessageAction(null)} onSaved={() => chat.refreshMessages(messageAction.message.channelId)} /> : null}
    </section>
  );
}
