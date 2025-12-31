/**
 * Suno AI Configuration & Constants
 * Single source of truth for all Suno API parameters and options
 */

export const SUNO_MODELS = [
  {
    id: 'V5',
    label: 'V5 (Recommended)',
    description: 'Superior expression, faster generation',
    maxDuration: 540, // 9 minutes in seconds
    maxPromptLength: 5000,
    maxStyleLength: 1000,
    maxTitleLength: 100,
  },
  {
    id: 'V4_5PLUS',
    label: 'V4.5+ (Richer)',
    description: 'Richer sound, new creative options',
    maxDuration: 480, // 8 minutes
    maxPromptLength: 5000,
    maxStyleLength: 1000,
    maxTitleLength: 100,
  },
  {
    id: 'V4_5ALL',
    label: 'V4.5-ALL (Best Structure)',
    description: 'Better song structure consistency',
    maxDuration: 480,
    maxPromptLength: 5000,
    maxStyleLength: 1000,
    maxTitleLength: 80,
  },
  {
    id: 'V4_5',
    label: 'V4.5 (Blending)',
    description: 'Genre blending with smart prompts',
    maxDuration: 480,
    maxPromptLength: 5000,
    maxStyleLength: 1000,
    maxTitleLength: 100,
  },
  {
    id: 'V4',
    label: 'V4 (Classic)',
    description: 'Best audio quality, refined structure',
    maxDuration: 240, // 4 minutes
    maxPromptLength: 3000,
    maxStyleLength: 200,
    maxTitleLength: 80,
  },
] as const;

export const VOCAL_GENDERS = [
  { id: 'm', label: 'Male' },
  { id: 'f', label: 'Female' },
] as const;

/**
 * Curated style examples for inspiration
 * Users can still freeform enter anything
 */
export const STYLE_EXAMPLES = {
  Christmas: [
    'Traditional Christmas, orchestral arrangement with choir',
    'Modern Christmas pop with upbeat drums and bells',
    'Jazz Christmas with smooth vocals and piano',
    'Acoustic Christmas with acoustic guitar and warm vocals',
    'Classical Christmas, string quartet arrangement',
    'Electronic Christmas with synthesizers and festive sounds',
  ],
  Holiday: [
    'Holiday pop with cheerful melody and upbeat rhythm',
    'Holiday jazz with smooth instrumental',
    'Holiday folk with acoustic instrumentation',
    'Holiday soul with warm vocals',
    'Holiday funk with groovy bass',
    'Holiday indie with alternative arrangement',
  ],
  Winter: [
    'Winter ballad with ethereal vocals and piano',
    'Winter ambient with orchestral pad sounds',
    'Winter folk with acoustic instrumentation',
    'Winter indie pop with catchy melody',
    'Winter soul with emotional vocals',
    'Winter electronic with atmospheric sounds',
  ],
  Religious: [
    'Traditional hymn with organ arrangement',
    'Gospel with powerful vocals and choir',
    'Contemporary worship with modern production',
    'Spiritual folk with acoustic arrangement',
    'Sacred classical with orchestral arrangement',
    'Modern praise with electronic elements',
  ],
  Other: [
    'Pop with catchy melody and upbeat rhythm',
    'Rock with electric guitars and drums',
    'Soul with emotional vocals and R&B production',
    'Country with acoustic guitar and storytelling',
    'Indie with alternative arrangement',
    'Electronic with synthesizers and beats',
  ],
} as const;

export const GENRE_OPTIONS = [
  'Christmas',
  'Holiday',
  'Winter',
  'Religious',
  'Pop',
  'Rock',
  'Jazz',
  'Soul',
  'Country',
  'Folk',
  'Electronic',
  'Indie',
  'R&B',
  'Classical',
  'Acoustic',
] as const;

/**
 * Duration presets for quick selection
 */
export const DURATION_PRESETS = [
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '4 min', value: 240 },
  { label: '5 min', value: 300 },
  { label: '8 min', value: 480 },
] as const;

/**
 * Get max duration for a given model
 */
export function getMaxDuration(modelId: string): number {
  const model = SUNO_MODELS.find(m => m.id === modelId);
  return model?.maxDuration || 240;
}

/**
 * Get model config by ID
 */
export function getModelConfig(modelId: string) {
  return SUNO_MODELS.find(m => m.id === modelId) || SUNO_MODELS[0];
}

/**
 * Validate prompt length for model
 */
export function validatePromptLength(text: string, modelId: string): boolean {
  const config = getModelConfig(modelId);
  return text.length <= config.maxPromptLength;
}

/**
 * Validate style length for model
 */
export function validateStyleLength(text: string, modelId: string): boolean {
  const config = getModelConfig(modelId);
  return text.length <= config.maxStyleLength;
}

/**
 * Validate title length for model
 */
export function validateTitleLength(text: string, modelId: string): boolean {
  const config = getModelConfig(modelId);
  return text.length <= config.maxTitleLength;
}
