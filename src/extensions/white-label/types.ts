export type HeaderDisplayMode = 'both' | 'logo' | 'tagline' | 'title';

export interface ShareConfig {
  brandName?: string;
  logoUrl?: string;
  headerDisplay?: HeaderDisplayMode;
  primaryColor?: string;
  backgroundColor?: string;
  cardBackgroundColor?: string;
  textColor?: string;
  defaultTheme?: 'system' | 'light' | 'dark';
  hideUmamiBranding?: boolean;
}

export const DEFAULT_SHARE_CONFIG: ShareConfig = {
  brandName: '',
  logoUrl: '',
  headerDisplay: 'both',
  primaryColor: '',
  backgroundColor: '',
  cardBackgroundColor: '',
  textColor: '',
  defaultTheme: 'system',
  hideUmamiBranding: true,
};
