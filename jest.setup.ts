import {TextEncoder, TextDecoder} from 'util';

global.TextEncoder = TextEncoder as unknown as typeof TextEncoder;
global.TextDecoder = TextDecoder as any;
