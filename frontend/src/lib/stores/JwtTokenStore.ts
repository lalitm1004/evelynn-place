import createPersistentStore from "$lib/utils/createPersistentStore";
import { stringCodec } from "$lib/utils/storeCodecs";

export const JWT_TOKEN_NAME = 'labyrinth-jwt-token';
const {
    store: JwtTokenStore, set: setJwtToken
} = createPersistentStore<string>({
    tokenName: JWT_TOKEN_NAME,
    ...stringCodec
});

export { JwtTokenStore, setJwtToken }