const STYLE_SETTING_KEYS = new Set([
  'primaryColor',
  'secondaryColor',
  'backgroundColor',
  'textColor',
  'primaryGradient',
  'headingFont',
  'bodyFont',
  'headingWeight',
  'letterSpacing',
  'borderRadius',
  'globalPadding',
  'borderWeight',
  'shadowIntensity',
  'navbarStyle',
]);

const parseSettingValue = (setting) => {
  let value = setting.value ?? '';

  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      value = JSON.parse(trimmed);
    } catch (error) {
      console.error(`Failed to parse setting ${setting.key}`);
    }
  }

  return value;
};

const settingsToObject = (settings = []) => (
  settings.reduce((acc, setting) => {
    if (STYLE_SETTING_KEYS.has(setting.key)) return acc;
    acc[setting.key] = parseSettingValue(setting);
    return acc;
  }, {})
);

const stripStyleSettings = (settings = {}) => (
  Object.fromEntries(
    Object.entries(settings).filter(([key]) => !STYLE_SETTING_KEYS.has(key))
  )
);

module.exports = {
  settingsToObject,
  stripStyleSettings,
};
