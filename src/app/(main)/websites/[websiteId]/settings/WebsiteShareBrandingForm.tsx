import {
  Button,
  Column,
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
import { Upload, X, RotateCcw, Image as ImageIcon, Type, Sparkles, AlertCircle } from 'lucide-react';
import { useMessages, useUpdateQuery, useWebsite } from '@/components/hooks';
import { ThemeModeSelector, type ThemeMode } from '@/components/input/ThemeModeSelector';
import { Logo } from '@/components/svg';
import type { ShareConfig } from '@/lib/types';

const DEFAULT_SHARE_CONFIG: ShareConfig = {
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

function resizeImageFile(file: File, maxWidth = 400, maxHeight = 120): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  const [headerDisplay, setHeaderDisplay] = useState<'both' | 'logo' | 'tagline'>(
    (initialConfig.headerDisplay as 'both' | 'logo' | 'tagline') || 'both',
  );
  const [primaryColor, setPrimaryColor] = useState(initialConfig.primaryColor || '');
  const [backgroundColor, setBackgroundColor] = useState(initialConfig.backgroundColor || '');
  const [cardBackgroundColor, setCardBackgroundColor] = useState(
    initialConfig.cardBackgroundColor || '',
  );
  const [textColor, setTextColor] = useState(initialConfig.textColor || '');
  const [defaultTheme, setDefaultTheme] = useState<ThemeMode>(
    (initialConfig.defaultTheme as ThemeMode) || 'system',
  );
  const [hideUmamiBranding, setHideUmamiBranding] = useState(
    initialConfig.hideUmamiBranding ?? true,
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const config = (website as any)?.shareConfig;
    if (config) {
      setBrandName(config.brandName || '');
      setLogoUrl(config.logoUrl || '');
      setHeaderDisplay(config.headerDisplay || 'both');
      setPrimaryColor(config.primaryColor || '');
      setBackgroundColor(config.backgroundColor || '');
      setCardBackgroundColor(config.cardBackgroundColor || '');
      setTextColor(config.textColor || '');
      setDefaultTheme(config.defaultTheme || 'system');
      setHideUmamiBranding(config.hideUmamiBranding ?? true);
      setImageLoadError(false);
    }
  }, [website]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('El archivo excede el tamaño máximo permitido (5 MB).');
      return;
    }
    setFileError(null);
    setImageLoadError(false);

    try {
      const optimizedDataUrl = await resizeImageFile(file, 400, 120);
      setLogoUrl(optimizedDataUrl);
    } catch {
      setFileError('Error al procesar la imagen.');
    }
  };

  const handleResetDefaults = () => {
    setBrandName(DEFAULT_SHARE_CONFIG.brandName || '');
    setLogoUrl(DEFAULT_SHARE_CONFIG.logoUrl || '');
    setHeaderDisplay('both');
    setPrimaryColor(DEFAULT_SHARE_CONFIG.primaryColor || '');
    setBackgroundColor(DEFAULT_SHARE_CONFIG.backgroundColor || '');
    setCardBackgroundColor(DEFAULT_SHARE_CONFIG.cardBackgroundColor || '');
    setTextColor(DEFAULT_SHARE_CONFIG.textColor || '');
    setDefaultTheme('system');
    setHideUmamiBranding(true);
    setFileError(null);
    setImageLoadError(false);
  };

  const handleSave = async () => {
    const shareConfig: ShareConfig = {
      brandName: brandName.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      headerDisplay,
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

  const displayOptions = [
    { id: 'both' as const, label: 'Ambos (Logo y Texto)', icon: <Sparkles size={15} /> },
    { id: 'logo' as const, label: 'Solo Logo', icon: <ImageIcon size={15} /> },
    { id: 'tagline' as const, label: 'Solo Texto / Tagline', icon: <Type size={15} /> },
  ];

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

      <Grid columns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
        <Column gap="1">
          <Label>Nombre de Marca / Título del Reporte (Tagline)</Label>
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
              placeholder="https://ejemplo.com/logo.svg o subir archivo"
              onChange={val => {
                setLogoUrl(val);
                setImageLoadError(false);
                setFileError(null);
              }}
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

          {fileError && <Text color="red">{fileError}</Text>}

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
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoadError(false)}
                onError={() => setImageLoadError(true)}
                style={{ maxHeight: 36, maxWidth: 160, objectFit: 'contain' }}
              />
              <Button
                size="sm"
                variant="quiet"
                onPress={() => {
                  setLogoUrl('');
                  setImageLoadError(false);
                }}
                aria-label="Quitar logo"
              >
                <Icon size="sm">
                  <X size={14} />
                </Icon>
              </Button>
            </Row>
          )}

          {imageLoadError && (
            <Row alignItems="center" gap="1" style={{ marginTop: 4 }}>
              <Icon color="red" size="sm">
                <AlertCircle size={14} />
              </Icon>
              <Text color="red" size="sm">
                No se pudo cargar la imagen desde la URL. Comprueba que sea una URL directa y accesible (.png, .jpg, .svg) o sube el archivo directamente (↑).
              </Text>
            </Row>
          )}
        </Column>
      </Grid>

      {/* Selector de visualización en el Navbar */}
      <Column gap="2">
        <Label>Mostrar en la barra superior (Navbar)</Label>
        <Row gap="2" wrap="wrap">
          {displayOptions.map(({ id, label, icon }) => (
            <Button
              key={id}
              variant={headerDisplay === id ? 'primary' : undefined}
              onPress={() => setHeaderDisplay(id)}
            >
              <Icon size="sm">{icon}</Icon>
              {label}
            </Button>
          ))}
        </Row>
      </Column>

      {/* Vista previa en vivo del Navbar */}
      <Column gap="1">
        <Label>Vista previa en vivo del Header Navbar</Label>
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 8,
            border: '1px solid var(--zen-border)',
            backgroundColor: backgroundColor || 'var(--zen-surface-raised, var(--zen-surface))',
            color: textColor || 'inherit',
            display: 'flex',
            alignItems: 'center',
            minHeight: 52,
          }}
        >
          <Row alignItems="center" gap="3">
            {(headerDisplay === 'both' || headerDisplay === 'logo') &&
              (logoUrl && !imageLoadError ? (
                <img
                  src={logoUrl}
                  alt={brandName || 'Logo'}
                  referrerPolicy="no-referrer"
                  style={{ maxHeight: 32, maxWidth: 180, objectFit: 'contain' }}
                />
              ) : (
                !hideUmamiBranding && (
                  <Icon>
                    <Logo />
                  </Icon>
                )
              ))}
            {(headerDisplay === 'both' || headerDisplay === 'tagline') && (
              <Text weight="bold" size="base" style={{ color: textColor || 'inherit' }}>
                {brandName || website?.name || 'Mi Marca Analytics'}
              </Text>
            )}
          </Row>
        </div>
      </Column>

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
