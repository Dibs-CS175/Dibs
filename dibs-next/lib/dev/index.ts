export { runAsQuery, simulate } from './simulate';
import { getDevState } from './state';
export { getDevState, setDevState } from './state';

/** Campus chosen in the dev toolbar. Stubs use it in place of the real session's campus. */
export function currentCampusId(): string {
  return getDevState().campusId;
}
