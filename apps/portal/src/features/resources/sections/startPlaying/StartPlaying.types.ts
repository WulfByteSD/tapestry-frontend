export type StartPlayingResource = {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  accessNote?: string;
  resourceType: 'guide' | 'app' | 'download';
  external?: boolean;
};