import { atom } from 'nanostores';

export const isLoggedInFactory = (initialState = false) => atom(initialState);
export default {};
