import createPersistentStore from "$lib/utils/createPersistentStore";
import { stringCodec } from "$lib/utils/storeCodecs";


export const DEVICE_TOKEN = 'labyrinth-device';
const {
    store: DeviceStore, set: setDevice
} = createPersistentStore<string>({
    tokenName: DEVICE_TOKEN,
    initialValue: 'mobile',
    ...stringCodec,
});

export { DeviceStore, setDevice };