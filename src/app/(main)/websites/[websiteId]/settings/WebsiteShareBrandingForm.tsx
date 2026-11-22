import {
  Button,
  Column,
  FormButtons,
  FormField,
  FormSubmitButton,
  Grid,
  Heading,
  Icon,
  Label,
  Loading,
  Row,
  Switch,
  Text,
  TextField,
} from '@umami/react-zen';
import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import { Upload, X, RotateCcw } from 'lucide-react';
import { useMessages, useUpdateQuery, useWebsite } from '@/components/hooks';
import { ThemeModeSelector, type ThemeMode } from '@/components/input/ThemeModeSelector';
import type { ShareConfig } from '@/lib/types';

const DEFAULT_SHARE_CONFIG: ShareConfig = {
  brandName: '',
  logoUrl: '',
  primaryColor: '',
  backgroundColor: '',
  cardBackgroundColor: '',
  textColor: '',
  defaultTheme: 'system',
  hideUmamiBranding: true,
};

function ColorPickerField({
  label,
  value = '',
  placeholder,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const safeColorForInput =
    value && /^#[0-9a-fA-F]{6}$/i.test(value)
      ? value
      : value && /^#[0-9a-fA-F]{3}$/i.test(value)
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : placeholder && /^#[0-9a-fA-F]{6}$/i.test(placeholder)
          ? placeholder
          : '#2680eb';

  return (
    <Column gap="1">
      <Label>{label}</Label>
      <Row alignItems="center" gap="2">
        <input
          type="color"
          value={safeColorForInput}
          onChange={e => onChange(e.target.value)}
          style={{
            width: 38,
            height: 38,
            padding: 2,
            border: '1px solid var(--zen-border)',
            borderRadius: 6,
            cursor: 'pointer',
            backgroundColor: 'var(--zen-surface)',
          }}
          aria-label={label}
        />
        <TextField
          value={value}
          placeholder={placeholder || '#000000'}
          onChange={onChange}
          style={{ width: 140 }}
        />
        {value && (
          <Button variant="quiet" size="sm" onPress={() => onChange('')} aria-label="Clear color">
            <Icon size="sm">
              <X size={14} />
            </Icon>
          </Button>
        )}
      </Row>
    </Column>
  );
}

export function WebsiteShareBrandingForm({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, touch, toast, isPending } = useUpdateQuery(`/websites/${websiteId}`);

  const initialConfig: ShareConfig = {
    ...DEFAULT_SHARE_CONFIG,
    ...((website as any)?.shareConfig || {}),
  };

  const [brandName, setBrandName] = useState(initialConfig.brandName || '');
  const [logoUrl, setLogoUrl] = useState(initialConfig.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(initialConfig.primaryColor || '');
  const [backgroundColor, setBackgroundColor] = useState(initialConfig.backgroundColor || '');
  const [cardBackgroundColor, setCardBackgroundColor] = useState(initialConfig.cardBackgroundColor || '');
  const [textColor, setTextColor] = useState(initialConfig.textColor || '');
  const [defaultTheme, setDefaultTheme] = useState<ThemeMode>(
    (initialConfig.defaultTheme as ThemeMode) || 'system',
  );
  const [hideUmamiBranding, setHideUmamiBranding] = useState(
    initialConfig.hideUmamiBranding ?? true,
  );
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const config = (website as any)?.shareConfig;
    if (config) {
      setBrandName(config.brandName || '');
      setLogoUrl(config.logoUrl || '');
      setPrimaryColor(config.primaryColor || '');
      setBackgroundColor(config.backgroundColor || '');
      setCardBackgroundColor(config.cardBackgroundColor || '');
      setTextColor(config.textColor || '');
      setDefaultTheme(config.defaultTheme || 'system');
      setHideUmamiBranding(config.hideUmamiBranding ?? true);
    }
  }, [website]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 150 * 1024) {
      setFileError('El archivo excede el tamaño máximo recomendado (150 KB).');
      return;
    }
    setFileError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    setBrandName(DEFAULT_SHARE_CONFIG.brandName || '');
    setLogoUrl(DEFAULT_SHARE_CONFIG.logoUrl || '');
    setPrimaryColor(DEFAULT_SHARE_CONFIG.primaryColor || '');
    setBackgroundColor(DEFAULT_SHARE_CONFIG.backgroundColor || '');
    setCardBackgroundColor(DEFAULT_SHARE_CONFIG.cardBackgroundColor || '');
    setTextColor(DEFAULT_SHARE_CONFIG.textColor || '');
    setDefaultTheme('system');
    setHideUmamiBranding(true);
    setFileError(null);
  };

  const handleSave = async () => {
    const shareConfig: ShareConfig = {
      brandName: brandName.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      primaryColor: primaryColor.trim() || undefined,
      backgroundColor: backgroundColor.trim() || undefined,
      cardBackgroundColor: cardBackgroundColor.trim() || undefined,
      textColor: textColor.trim() || undefined,
      defaultTheme,
      hideUmamiBranding,
    };

    await mutateAsync(
      {
        shareConfig,
      },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch('websites');
          touch(`website:${websiteId}`);
        },
      },
    );
  };

  return (
    <Column gap="4">
      <Row justifyContent="space-between" alignItems="center">
        <Column gap="1">
          <Heading>Share Branding / Apariencia Compartida</Heading>
          <Text color="muted">
            Personaliza la apariencia (colores, logo, nombre y tema) exclusivamente para los dashboards públicos compartidos (/share/...). El panel de administración conserva siempre la interfaz nativa de Umami.
          </Text>
        </Column>
      </Row>

      {error && <Text color="red">{getErrorMessage(error)}</Text>}
      {fileError && <Text color="red">{fileError}</Text>}

      <Grid columns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
        <Column gap="1">
          <Label>Nombre de Marca / Título del Reporte</Label>
          <TextField
            value={brandName}
            placeholder={website?.name || 'Mi Marca Analytics'}
            onChange={setBrandName}
          />
        </Column>

        <Column gap="1">
          <Label>URL del Logo o Carga de Imagen</Label>
          <Row gap="2" alignItems="center">
            <TextField
              value={logoUrl}
              placeholder="https://ejemplo.com/logo.svg o data:image/..."
              onChange={setLogoUrl}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              onPress={() => fileInputRef.current?.click()}
              aria-label="Subir logo"
            >
              <Icon size="sm">
                <Upload size={16} />
              </Icon>
            </Button>
          </Row>
          {logoUrl && (
            <Row
              alignItems="center"
              gap="3"
              style={{
                marginTop: 6,
                padding: '8px 12px',
                border: '1px dashed var(--zen-border)',
                borderRadius: 6,
                backgroundColor: 'var(--zen-surface)',
                width: 'fit-content',
              }}
            >
              <img
                src={logoUrl}
                alt="Vista previa del logo"
                style={{ maxHeight: 36, maxWidth: 120, objectFit: 'contain' }}
              />
              <Button
                size="sm"
                variant="quiet"
                onPress={() => setLogoUrl('')}
                aria-label="Quitar logo"
              >
                <Icon size="sm">
                  <X size={14} />
                </Icon>
              </Button>
            </Row>
          )}
        </Column>
      </Grid>

      <Grid columns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="4">
        <ColorPickerField
          label="Color Primario"
          value={primaryColor}
          placeholder="#6366f1"
          onChange={setPrimaryColor}
        />
        <ColorPickerField
          label="Color de Fondo"
          value={backgroundColor}
          placeholder="#f8fafc"
          onChange={setBackgroundColor}
        />
        <ColorPickerField
          label="Color de Tarjetas"
          value={cardBackgroundColor}
          placeholder="#ffffff"
          onChange={setCardBackgroundColor}
        />
        <ColorPickerField
          label="Color de Texto"
          value={textColor}
          placeholder="#1e293b"
          onChange={setTextColor}
        />
      </Grid>

      <Grid columns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4" alignItems="center">
        <Column gap="1">
          <Label>Tema por defecto en la vista compartida</Label>
          <ThemeModeSelector
            value={defaultTheme}
            includeSystem
            onChange={mode => setDefaultTheme(mode)}
          />
        </Column>

        <Column gap="1">
          <Label>Marca de Umami</Label>
          <Switch isSelected={hideUmamiBranding} onChange={setHideUmamiBranding}>
            Ocultar marca y enlaces a Umami
          </Switch>
        </Column>
      </Grid>

      <Row justifyContent="space-between" alignItems="center" paddingTop="4">
        <Button variant="quiet" onPress={handleResetDefaults} isDisabled={isPending}>
          <Icon size="sm">
            <RotateCcw size={14} />
          </Icon>
          Restaurar valores por defecto
        </Button>
        <Button variant="primary" onPress={handleSave} isDisabled={isPending}>
          {isPending ? <Loading size="sm" /> : t(labels.save)}
        </Button>
      </Row>
    </Column>
  );
}
