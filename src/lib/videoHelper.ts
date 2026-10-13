export interface VideoEmbedInfo {
  type: "YOUTUBE" | "GDRIVE" | "VIMEO" | "DIRECT";
  embedUrl: string;
  originalUrl: string;
}

export function parseVideoUrl(url?: string): VideoEmbedInfo {
  if (!url || !url.trim()) {
    return {
      type: "DIRECT",
      embedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      originalUrl: "",
    };
  }

  const cleanUrl = url.trim();

  // 1. YouTube detection
  // Format: https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ or https://www.youtube.com/shorts/dQw4w9WgXcQ
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const ytMatch = cleanUrl.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: "YOUTUBE",
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      originalUrl: cleanUrl,
    };
  }

  // 2. Google Drive video preview
  // Format: https://drive.google.com/file/d/FILE_ID/view...
  const gdriveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const gdMatch = cleanUrl.match(gdriveRegex);
  if (gdMatch && gdMatch[1]) {
    const fileId = gdMatch[1];
    return {
      type: "GDRIVE",
      embedUrl: `https://drive.google.com/file/d/FILE_ID/preview`.replace("FILE_ID", fileId),
      originalUrl: cleanUrl,
    };
  }

  // 3. Vimeo
  const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i;
  const vmMatch = cleanUrl.match(vimeoRegex);
  if (vmMatch && vmMatch[3]) {
    const videoId = vmMatch[3];
    return {
      type: "VIMEO",
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      originalUrl: cleanUrl,
    };
  }

  // 4. Default direct video stream (MP4, HLS, etc.)
  return {
    type: "DIRECT",
    embedUrl: cleanUrl,
    originalUrl: cleanUrl,
  };
}
