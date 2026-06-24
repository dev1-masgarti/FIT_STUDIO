import { backendFetch, getSessionToken } from '@/lib/backend/client';

type GenerateHomeImageResponse = {
  image_url: string;
  cached: boolean;
};

export const inferRegionFromLocale = (): string => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (!locale) return 'Global';
    const parts = locale.split('-');
    return parts[1] ?? parts[0] ?? 'Global';
  } catch {
    return 'Global';
  }
};

export const generateHomeImage = async (
  region?: string,
): Promise<GenerateHomeImageResponse> => {
  const token = await getSessionToken();
  const data = await backendFetch<GenerateHomeImageResponse>('/home-image/generate', {
    method: 'POST',
    token,
    body: {
      region: region ?? inferRegionFromLocale(),
    },
  });
  if (!data?.image_url) throw new Error('Home image generation failed: missing image URL');
  return data;
};
