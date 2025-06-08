import createPersistentStore from "$lib/utils/createPersistentStore";
import { stringCodec } from "$lib/utils/storeCodecs";


export const DEVICE_TOKEN_NAME = 'labyrinth-device';
const {
    store: DeviceStore, set: setDevice
} = createPersistentStore<string>({
    tokenName: DEVICE_TOKEN_NAME,
    initialValue: 'mobile',
    ...stringCodec,
});

export { DeviceStore, setDevice };