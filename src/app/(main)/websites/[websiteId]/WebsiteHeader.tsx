import { Icon, Row, Text } from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages, useNavigation, useShare, useWebsite } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';

export function WebsiteHeader({
  showActions,
  allowLink = true,
}: {
  showActions?: boolean;
  allowLink?: boolean;
}) {
  const website = useWebsite();
  const share = useShare();
  const shareConfig = share?.shareConfig;
  const { renderUrl, pathname } = useNavigation();
  const isSettings = pathname.endsWith('/settings');

  const { t, labels } = useMessages();

  if (isSettings) {
    return null;
  }

  const title = shareConfig?.brandName || website.name;
  const icon = shareConfig?.logoUrl ? (
    <img
      src={shareConfig.logoUrl}
      alt={title}
      style={{ height: 28, width: 28, objectFit: 'contain', borderRadius: 4 }}
    />
  ) : (
    <Favicon domain={website.domain} />
  );

  return (
    <PageHeader
      title={title}
      icon={icon}
      titleHref={allowLink ? renderUrl(`/websites/${website.id}`, false) : undefined}
    >
      <Row alignItems="center" gap="6" wrap="wrap">
        <ActiveUsers websiteId={website.id} allowLink={allowLink} />

        {showActions && (
          <LinkButton href={renderUrl(`/websites/${website.id}/settings`, false)}>
            <IconLabel icon={<Edit />}>{t(labels.edit)}</IconLabel>
          </LinkButton>
        )}
      </Row>
    </PageHeader>
  );
}
