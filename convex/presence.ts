import {
  clearStalePresenceHandler,
  getPresenceHandler,
  heartbeatHandler,
} from '@talentum-ventures/convex-datatable/convex-server';
import { mutation, query } from './_generated/server';

export const heartbeat = mutation(heartbeatHandler('presence'));
export const getPresence = query(getPresenceHandler('presence'));
export const clearStale = mutation(clearStalePresenceHandler('presence'));
