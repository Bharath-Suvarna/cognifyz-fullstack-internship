const cacheStore = new Map();

function cachePage(seconds = 30) {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cached = cacheStore.get(req.originalUrl);

    if (cached && cached.expiresAt > Date.now()) {
      if (cached.contentType) {
        res.setHeader('Content-Type', cached.contentType);
      }

      return res.send(cached.html);
    }

    const originalSend = res.send.bind(res);

    res.send = (html) => {
      if (res.statusCode === 200) {
        cacheStore.set(req.originalUrl, {
          html,
          contentType: res.getHeader('Content-Type'),
          expiresAt: Date.now() + seconds * 1000
        });
      }

      return originalSend(html);
    };

    return next();
  };
}

function clearExpiredCache() {
  const now = Date.now();

  for (const [key, value] of cacheStore.entries()) {
    if (value.expiresAt <= now) {
      cacheStore.delete(key);
    }
  }
}

module.exports = {
  cachePage,
  clearExpiredCache
};
