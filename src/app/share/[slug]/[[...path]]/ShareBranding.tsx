'use client';
import { Icon, Row, Text } from '@umami/react-zen';
import { useShare } from '@/components/hooks';
import { Logo } from '@/components/svg';

const LOGO_SIZE = { sm: 24, md: 32, lg: 40 };
const TEXT_SIZE = { sm: 'sm', md: 'base', lg: 'lg' } as const;

export function ShareBranding({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const share = useShare();
  const shareConfig = share?.shareConfig;
  const hideBranding = shareConfig?.hideUmamiBranding ?? false;

  const customLogo = shareConfig?.logoUrl;
  const customName = shareConfig?.brandName;

  // If hideUmamiBranding is enabled and no custom branding was provided, don't show Umami logo/name
  if (hideBranding && !customLogo && !customName) {
    return null;
  }

  const logoDomain = customLogo || customName ? undefined : (share?.whiteLabel?.domainName || 'https://umami.is');
  const logoName = customName || share?.whiteLabel?.displayName || 'umami';
  const logoImage = customLogo || share?.whiteLabel?.logoUrl;
  const height = LOGO_SIZE[size];

  const content = (
    <Row alignItems="center" gap>
      {logoImage ? (
        <img src={logoImage} alt={logoName} style={{ height, maxWidth: 120, objectFit: 'contain' }} />
      ) : (
        !hideBranding && (
          <Icon>
            <Logo />
          </Icon>
        )
      )}
      {logoName && (
        <Text size={TEXT_SIZE[size]} weight="bold">
          {logoName}
        </Text>
      )}
    </Row>
  );

  if (!logoDomain) {
    return <div style={{ marginLeft: 12, display: 'inline-flex' }}>{content}</div>;
  }

  return (
    <a href={logoDomain} target="_blank" rel="noopener" style={{ marginLeft: 12 }}>
      {content}
    </a>
  );
}
