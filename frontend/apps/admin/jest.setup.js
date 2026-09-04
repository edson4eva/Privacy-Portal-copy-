const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
jest.mock('@tinymce/tinymce-react', () => ({
    Editor: () => <div data-testid="mock-editor" />,
}));
