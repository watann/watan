const allowedMimeTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function clean(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

function validHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseProjectForm(formData) {
  const payload = {
    title_ku: clean(formData.get('title_ku'), 160),
    title_en: clean(formData.get('title_en'), 160),
    description_ku: clean(formData.get('description_ku'), 2000),
    description_en: clean(formData.get('description_en'), 2000),
    project_url: clean(formData.get('project_url'), 500) || null,
    github_url: clean(formData.get('github_url'), 500) || null,
    tech: clean(formData.get('tech'), 500)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12),
    sort_order: Number.parseInt(formData.get('sort_order') || '0', 10) || 0,
    is_published: formData.get('is_published') === 'true',
  };

  if (payload.title_ku.length < 2 || payload.title_en.length < 2) {
    return { error: 'Kurdish and English titles are required.' };
  }
  if (payload.description_ku.length < 5 || payload.description_en.length < 5) {
    return { error: 'Kurdish and English descriptions are required.' };
  }
  if (!validHttpUrl(payload.project_url) || !validHttpUrl(payload.github_url)) {
    return { error: 'Project and GitHub links must start with http:// or https://.' };
  }

  const image = formData.get('image');
  if (image && typeof image === 'object' && image.size > 0) {
    if (!allowedMimeTypes.has(image.type)) return { error: 'Only JPG, PNG and WebP images are allowed.' };
    if (image.size > MAX_IMAGE_BYTES) return { error: 'The image must be 5 MB or smaller.' };
  }

  return { payload, image: image?.size ? image : null };
}

export function extensionForMime(mime) {
  return allowedMimeTypes.get(mime) || 'jpg';
}
