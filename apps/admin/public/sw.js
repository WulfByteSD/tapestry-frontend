self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "Tapestry",
      body: event.data ? event.data.text() : "You have a new notification.",
    };
  }

  const title = payload.title || "Tapestry";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/badge-96.png",
    data: {
      url: payload.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
