// Lightweight client-side notification scheduling (no push, placeholder)
export type NotificationPayload = { title: string; body: string };

export function scheduleLocalNotification(whenMsFromNow: number, payload: NotificationPayload) {
  // For now, log and optionally show a toast via DOM
  setTimeout(() => {
    console.log('[Notification]', payload.title, payload.body);
    try {
      window.dispatchEvent(evt);
    } catch {}
  }, Math.max(0, whenMsFromNow));
}
