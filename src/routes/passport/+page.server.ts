import type { PageServerLoad } from './$types';
import { auth } from './passport.utils';

export const load: PageServerLoad = auth;