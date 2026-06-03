const express = require('express');

const router = express.Router();

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_FEED_BASE = 'https://www.youtube.com/feeds/videos.xml';
const DEFAULT_YOUTUBE_CHANNEL_ID = 'UC_x5XG1OV2P6uZZ5FSM9Ttw';
const MAX_RESULTS = 50;
const CACHE_TTL_MS = 10 * 60 * 1000;

let cache = {
  cacheKey: '',
  fetchedAt: 0,
  payload: null,
};

const getYoutubeConfig = () => ({
  apiKey: process.env.YOUTUBE_API_KEY,
  channelId: process.env.YOUTUBE_CHANNEL_ID || DEFAULT_YOUTUBE_CHANNEL_ID,
});

const decodeXml = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .trim();

const getXmlTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`));
  return decodeXml(match?.[1] || '');
};

const getXmlAttribute = (xml, tag, attribute) => {
  const match = xml.match(new RegExp(`<${tag}\\b[^>]*\\s${attribute}="([^"]*)"`, 'i'));
  return decodeXml(match?.[1] || '');
};

const getAlternateLink = (xml) => {
  const relFirst = xml.match(/<link\b[^>]*rel="alternate"[^>]*href="([^"]*)"/i);
  const hrefFirst = xml.match(/<link\b[^>]*href="([^"]*)"[^>]*rel="alternate"/i);
  return decodeXml(relFirst?.[1] || hrefFirst?.[1] || '');
};

const youtubeRequest = async (path, params) => {
  const { apiKey } = getYoutubeConfig();
  const url = new URL(`${YOUTUBE_API_BASE}${path}`);

  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || 'YouTube request failed');
  }

  return data;
};

const getChannel = async (channelId) => {
  const data = await youtubeRequest('/channels', {
    part: 'snippet,contentDetails',
    id: channelId,
    maxResults: 1,
  });

  const channel = data.items?.[0];
  if (!channel) {
    throw new Error('YouTube channel not found');
  }

  return {
    id: channel.id,
    title: channel.snippet?.title || 'YouTube Channel',
    description: channel.snippet?.description || '',
    url: `https://www.youtube.com/channel/${channel.id}`,
    thumbnail:
      channel.snippet?.thumbnails?.high?.url ||
      channel.snippet?.thumbnails?.medium?.url ||
      channel.snippet?.thumbnails?.default?.url ||
      '',
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
  };
};

const getAllPlaylistVideos = async (playlistId) => {
  const videos = [];
  let pageToken = '';

  do {
    const data = await youtubeRequest('/playlistItems', {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: MAX_RESULTS,
      pageToken,
    });

    const pageVideos = (data.items || [])
      .map((item) => {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        if (!videoId) return null;

        const thumbnails = item.snippet?.thumbnails || {};

        return {
          id: videoId,
          title: item.snippet?.title || 'Untitled video',
          description: item.snippet?.description || '',
          publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || '',
          thumbnail:
            thumbnails.maxres?.url ||
            thumbnails.high?.url ||
            thumbnails.medium?.url ||
            thumbnails.default?.url ||
            '',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };
      })
      .filter(Boolean);

    videos.push(...pageVideos);
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return videos.sort((first, second) => (
    new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime()
  ));
};

const getVideosFromFeed = async (channelId) => {
  const url = new URL(YOUTUBE_FEED_BASE);
  url.searchParams.set('channel_id', channelId);

  const response = await fetch(url);
  const xml = await response.text();

  if (!response.ok) {
    throw new Error('YouTube feed request failed');
  }

  const feedHeader = xml.split('<entry>')[0] || '';
  const channelTitle = getXmlTag(feedHeader, 'title') || 'YouTube Channel';
  const channelUrl = getAlternateLink(feedHeader) || `https://www.youtube.com/channel/${channelId}`;

  const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, entry]) => {
      const videoId = getXmlTag(entry, 'yt:videoId');
      if (!videoId) return null;

      return {
        id: videoId,
        title: getXmlTag(entry, 'title') || getXmlTag(entry, 'media:title') || 'Untitled video',
        description: getXmlTag(entry, 'media:description'),
        publishedAt: getXmlTag(entry, 'published') || getXmlTag(entry, 'updated'),
        thumbnail: getXmlAttribute(entry, 'media:thumbnail', 'url'),
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: getAlternateLink(entry) || `https://www.youtube.com/watch?v=${videoId}`,
      };
    })
    .filter(Boolean)
    .sort((first, second) => (
      new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime()
    ));

  return {
    channel: {
      id: channelId,
      title: channelTitle,
      description: '',
      url: channelUrl,
      thumbnail: '',
      uploadsPlaylistId: '',
    },
    videos,
  };
};

router.get('/videos', async (req, res, next) => {
  try {
    const { apiKey, channelId } = getYoutubeConfig();
    const cacheKey = `${apiKey ? 'api' : 'feed'}:${channelId}`;

    if (
      cache.payload &&
      cache.cacheKey === cacheKey &&
      Date.now() - cache.fetchedAt < CACHE_TTL_MS
    ) {
      return res.json(cache.payload);
    }

    const youtubeData = apiKey
      ? {
          channel: await getChannel(channelId),
          videos: null,
        }
      : await getVideosFromFeed(channelId);

    if (apiKey && !youtubeData.channel.uploadsPlaylistId) {
      throw new Error('Uploads playlist not found for this channel');
    }

    const videos = apiKey
      ? await getAllPlaylistVideos(youtubeData.channel.uploadsPlaylistId)
      : youtubeData.videos;

    const payload = {
      success: true,
      source: apiKey ? 'youtube-api' : 'youtube-feed',
      channel: youtubeData.channel,
      videos,
    };

    cache = {
      cacheKey,
      fetchedAt: Date.now(),
      payload,
    };

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
