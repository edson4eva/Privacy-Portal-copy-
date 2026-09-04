interface IconDefinition {
    name: string;
    content: string;
}
interface IconItem {
    value: string;
    text: string;
}
export const getAvailableIcons = (): IconItem[] => {
    return Object.entries(IconDefinitions).map(([key, value]) => {
        return {
            value: key,
            text: value.name,
        };
    });
};
export const getIcon = (name: string): IconDefinition => {
    return IconDefinitions[name];
};
const IconDefinitions: Record<string, IconDefinition> = {
    open: {
        name: 'open',
        content:
            '<svg viewbox="0 0 512 512"  stroke="currentcolor" stroke-width="29" fill-rule="nonzero" fill="none"><path d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48M336 64h112v112M224 288L440 72"></path></svg>',
    },
    warning: {
        name: 'warning',
        content:
            '<svg viewbox="0 0 24 24"><path d="M19.8 18.3c.2.5.3.9 0 1.2-.1.3-.5.5-1 .5H5.2c-.5 0-.9-.2-1-.5-.3-.3-.2-.7 0-1.2L11 4.7l.5-.5.5-.2c.2 0 .3 0 .5.2.2 0 .3.3.5.5l6.8 13.6ZM12 18c.3 0 .5-.1.7-.3.2-.2.3-.4.3-.7a1 1 0 0 0-.3-.7 1 1 0 0 0-.7-.3 1 1 0 0 0-.7.3 1 1 0 0 0-.3.7c0 .3.1.5.3.7.2.2.4.3.7.3Zm.7-3 .3-4a1 1 0 0 0-.3-.7 1 1 0 0 0-.7-.3 1 1 0 0 0-.7.3 1 1 0 0 0-.3.7l.3 4h1.4Z" fill-rule="evenodd" fill="currentcolor"/></svg>',
    },
    emoji: {
        name: 'emoji',
        content:
            '<svg viewbox="0 0 24 24"><path d="M9 11c.6 0 1-.4 1-1s-.4-1-1-1a1 1 0 0 0-1 1c0 .6.4 1 1 1Zm6 0c.6 0 1-.4 1-1s-.4-1-1-1a1 1 0 0 0-1 1c0 .6.4 1 1 1Zm-3 5.5c2.1 0 4-1.5 4.4-3.5H7.6c.5 2 2.3 3.5 4.4 3.5ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" fill-rule="nonzero" stroke="currentcolor" fill="currentcolor"/></svg>',
    },
    'information-circle': {
        name: 'information circle',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><path d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-linejoin="round" d="M220 220h32v116" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-miterlimit="10" d="M208 340h88" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"></path></svg>',
    },
    'add-circle': {
        name: 'add circle',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-linejoin="round" d="M256 176v160M336 256H176" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    'alert-circle': {
        name: 'alert circle',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Alert Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M250.26 166.05L256 288l5.73-121.95a5.74 5.74 0 00-5.79-6h0a5.74 5.74 0 00-5.68 6z" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M256 367.91a20 20 0 1120-20 20 20 0 01-20 20z"></path></svg>',
    },
    'checkmark-circle': {
        name: 'checkmark circle',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Checkmark Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-linejoin="round" d="M352 176L217.6 336 160 272" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    'close-circle': {
        name: 'close circle',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Close Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-linejoin="round" d="M320 320L192 192M192 320l128-128" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    'help-circle': {
        name: 'help circle',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Help Circle</title><path d="M256 80a176 176 0 10176 176A176 176 0 00256 80z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M200 202.29s.84-17.5 19.57-32.57C230.68 160.77 244 158.18 256 158c10.93-.14 20.69 1.67 26.53 4.45 10 4.76 29.47 16.38 29.47 41.09 0 26-17 37.81-36.37 50.8S251 281.43 251 296" stroke-linecap="round" stroke-miterlimit="10" stroke-width="28" class="ionicon-fill-none"></path><circle cx="250" cy="348" r="20"></circle></svg>',
    },
    'remove-circle': {
        name: 'remove circle',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Remove Circle</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-linejoin="round" d="M336 256H176" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    close: {
        name: 'close',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Close</title><path stroke-linecap="round" stroke-linejoin="round" d="M368 368L144 144M368 144L144 368" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    checkmark: {
        name: 'checkmark',
        content:
            '<svg viewBox="0 0 18 14" fill="none" stroke-width="20"> <path fill-rule="evenodd" clip-rule="evenodd" d="M6.20129 11.5368L15.9974 0.341265C16.3611 -0.0743717 16.9929 -0.116489 17.4085 0.247193C17.8241 0.610875 17.8663 1.24264 17.5026 1.65827L7.00258 13.6583C6.82032 13.8666 6.5599 13.99 6.28328 13.9992C6.00666 14.0084 5.7386 13.9026 5.54289 13.7069L1.04289 9.20688C0.652369 8.81635 0.652369 8.18319 1.04289 7.79266C1.43342 7.40214 2.06658 7.40214 2.45711 7.79266L6.20129 11.5368Z" fill="currentcolor"></path> </svg>',
    },
    add: {
        name: 'add',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Add</title><path stroke-linecap="round" stroke-linejoin="round" d="M256 112v288M400 256H112" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    remove: {
        name: 'remove',
        content:
            '<svg viewBox="0 0 16 1" fill="none"stroke-width="20"> <path d="M1.5 -0.000244141C0.947715 -0.000244141 0.5 0.447471 0.5 0.999756C0.5 1.55204 0.947715 1.99976 1.5 1.99976H15C15.5523 1.99976 16 1.55204 16 0.999756C16 0.447471 15.5523 -0.000244141 15 -0.000244141H1.5Z" fill="currentcolor"></path> </svg>',
    },
    'chevron-down': {
        name: 'chevron down',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Chevron Down</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M112 184l144 144 144-144" class="ionicon-fill-none"></path></svg>',
    },
    'chevron-up': {
        name: 'chevron up',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Chevron Up</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M112 328l144-144 144 144" class="ionicon-fill-none"></path></svg>',
    },
    'chevron-back': {
        name: 'chevron back',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Chevron Back</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M328 112L184 256l144 144" class="ionicon-fill-none"></path></svg>',
    },
    'chevron-forward': {
        name: 'chevron forward',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Chevron Forward</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144" class="ionicon-fill-none"></path></svg>',
    },
    'arrow-down': {
        name: 'arrow down',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Arrow Down</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M112 268l144 144 144-144M256 392V100" class="ionicon-fill-none"></path></svg>',
    },
    'arrow-up': {
        name: 'arrow up',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Arrow Up</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M112 244l144-144 144 144M256 120v292" class="ionicon-fill-none"></path></svg>',
    },
    'arrow-back': {
        name: 'arrow back',
        content:
            '<svg viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Arrow Back</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M244 400L100 256l144-144M120 256h292" class="ionicon-fill-none"></path></svg>',
    },
    'arrow-forward': {
        name: 'arrow forward',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Arrow Forward</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M268 112l144 144-144 144M392 256H100" class="ionicon-fill-none"></path></svg>',
    },
    'caret-down': {
        name: 'caret down',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="currentcolor" stroke-width="20"><title>Caret Down</title><path d="M98 190.06l139.78 163.12a24 24 0 0036.44 0L414 190.06c13.34-15.57 2.28-39.62-18.22-39.62h-279.6c-20.5 0-31.56 24.05-18.18 39.62z"></path></svg>',
    },
    'caret-back': {
        name: 'caret back',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="currentcolor" stroke-width="20"><title>Caret Back</title><path d="M321.94 98L158.82 237.78a24 24 0 000 36.44L321.94 414c15.57 13.34 39.62 2.28 39.62-18.22v-279.6c0-20.5-24.05-31.56-39.62-18.18z"></path></svg>',
    },
    'caret-up': {
        name: 'caret up',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="currentcolor" stroke-width="20"><title>Caret Up</title><path d="M414 321.94L274.22 158.82a24 24 0 00-36.44 0L98 321.94c-13.34 15.57-2.28 39.62 18.22 39.62h279.6c20.5 0 31.56-24.05 18.18-39.62z"></path></svg>',
    },
    'caret-forward': {
        name: 'caret forward',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="currentcolor" stroke-width="20"><title>Caret Forward</title><path d="M190.06 414l163.12-139.78a24 24 0 000-36.44L190.06 98c-15.57-13.34-39.62-2.28-39.62 18.22v279.6c0 20.5 24.05 31.56 39.62 18.18z"></path></svg>',
    },
    menu: {
        name: 'menu',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="currentcolor" stroke-width="20"><title>Menu</title><path stroke-linecap="round" stroke-miterlimit="10" d="M80 160h352M80 256h352M80 352h352" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    reload: {
        name: 'reload',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Reload</title><path d="M400 148l-21.12-24.57A191.43 191.43 0 00240 64C134 64 48 150 48 256s86 192 192 192a192.09 192.09 0 00181.07-128" stroke-linecap="round" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M464 97.42V208a16 16 0 01-16 16H337.42c-14.26 0-21.4-17.23-11.32-27.31L436.69 86.1C446.77 76 464 83.16 464 97.42z" fill="currentcolor"></path></svg>',
    },
    search: {
        name: 'search',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Search</title><path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-miterlimit="10" d="M338.29 338.29L448 448" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    pencil: {
        name: 'pencil',
        content:
            '<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M4.86885 18.6573C4.86885 18.9334 5.0927 19.1573 5.36885 19.1573H5.90136C6.03391 19.1573 6.16103 19.1046 6.25479 19.0109L15.6988 9.57357L14.4593 8.33405L5.01542 17.7713C4.92157 17.865 4.86885 17.9923 4.86885 18.1249V18.6573ZM19.1614 8.47035L15.5555 4.86447L16.7387 3.68129C17.058 3.36202 17.4571 3.20708 17.936 3.21647C18.4149 3.22586 18.814 3.39019 19.1333 3.70946L20.3446 4.92081C20.6639 5.24008 20.8235 5.63447 20.8235 6.10399C20.8235 6.5735 20.6639 6.9679 20.3446 7.28717L19.1614 8.47035ZM4.02372 20.8475C3.77957 20.8475 3.57768 20.7677 3.41804 20.608C3.25841 20.4484 3.17859 20.2465 3.17859 20.0024V17.5797C3.17859 17.467 3.19737 17.3637 3.23493 17.2698C3.27249 17.1759 3.33822 17.082 3.43213 16.9881L14.4874 5.93952L18.0933 9.5454L7.03801 20.594C6.9441 20.6879 6.8502 20.7536 6.7563 20.7912C6.6624 20.8287 6.5591 20.8475 6.44642 20.8475H4.02372Z" fill="currentcolor"></path> </svg>',
    },
    flag: {
        name: 'flag',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Flag</title><path d="M80 464V68.14a8 8 0 014-6.9C91.81 56.66 112.92 48 160 48c64 0 145 48 192 48a199.53 199.53 0 0077.23-15.77 2 2 0 012.77 1.85v219.36a4 4 0 01-2.39 3.65C421.37 308.7 392.33 320 352 320c-48 0-128-32-192-32s-80 16-80 16" stroke-linecap="round" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    bookmark: {
        name: 'bookmark',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Bookmark</title><path d="M352 48H160a48 48 0 00-48 48v368l144-128 144 128V96a48 48 0 00-48-48z" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    calendar: {
        name: 'calendar',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Calendar</title><rect stroke-linejoin="round" x="48" y="80" width="416" height="384" rx="48" class="ionicon-fill-none ionicon-stroke-width"></rect><circle cx="296" cy="232" r="24"></circle><circle cx="376" cy="232" r="24"></circle><circle cx="296" cy="312" r="24"></circle><circle cx="376" cy="312" r="24"></circle><circle cx="136" cy="312" r="24"></circle><circle cx="216" cy="312" r="24"></circle><circle cx="136" cy="392" r="24"></circle><circle cx="216" cy="392" r="24"></circle><circle cx="296" cy="392" r="24"></circle><path stroke-linejoin="round" stroke-linecap="round" d="M128 48v32M384 48v32" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linejoin="round" d="M464 160H48" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    documents: {
        name: 'documents',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Documents</title><path d="M336 264.13V436c0 24.3-19.05 44-42.95 44H107c-23.95 0-43-19.7-43-44V172a44.26 44.26 0 0144-44h94.12a24.55 24.55 0 0117.49 7.36l109.15 111a25.4 25.4 0 017.24 17.77z" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M200 128v108a28.34 28.34 0 0028 28h108" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M176 128V76a44.26 44.26 0 0144-44h94a24.83 24.83 0 0117.61 7.36l109.15 111A25.09 25.09 0 01448 168v172c0 24.3-19.05 44-42.95 44H344" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path d="M312 32v108a28.34 28.34 0 0028 28h108" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    trash: {
        name: 'trash',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Trash</title><path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-miterlimit="10" d="M80 112h352" class="ionicon-stroke-width"></path><path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    funnel: {
        name: 'funnel',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Funnel</title><path d="M35.4 87.12l168.65 196.44A16.07 16.07 0 01208 294v119.32a7.93 7.93 0 005.39 7.59l80.15 26.67A7.94 7.94 0 00304 440V294a16.07 16.07 0 014-10.44L476.6 87.12A14 14 0 00466 64H46.05A14 14 0 0035.4 87.12z" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    'ellipsis-vertical': {
        name: 'ellipsis vertical',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Ellipsis Vertical</title><circle cx="256" cy="256" r="32" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></circle><circle cx="256" cy="416" r="32" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></circle><circle cx="256" cy="96" r="32" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></circle></svg>',
    },
    notifications: {
        name: 'notifications',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Notifications</title><path d="M427.68 351.43C402 320 383.87 304 383.87 217.35 383.87 138 343.35 109.73 310 96c-4.43-1.82-8.6-6-9.95-10.55C294.2 65.54 277.8 48 256 48s-38.21 17.55-44 37.47c-1.35 4.6-5.52 8.71-9.95 10.53-33.39 13.75-73.87 41.92-73.87 121.35C128.13 304 110 320 84.32 351.43 73.68 364.45 83 384 101.61 384h308.88c18.51 0 27.77-19.61 17.19-32.57zM320 384v16a64 64 0 01-128 0v-16" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    'notifications-off': {
        name: 'notifications off',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Notifications Off</title><path d="M128.51 204.59q-.37 6.15-.37 12.76C128.14 304 110 320 84.33 351.43 73.69 364.45 83 384 101.62 384H320M414.5 335.3c-18.48-23.45-30.62-47.05-30.62-118 0-79.3-40.52-107.57-73.88-121.3-4.43-1.82-8.6-6-9.95-10.55C294.21 65.54 277.82 48 256 48s-38.2 17.55-44 37.47c-1.35 4.6-5.52 8.71-10 10.53a149.57 149.57 0 00-18 8.79M320 384v16a64 64 0 01-128 0v-16" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-miterlimit="10" d="M448 448L64 64" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    eye: {
        name: 'eye',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Eye</title><path d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><circle cx="256" cy="256" r="80" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></circle></svg>',
    },
    'eye-off': {
        name: 'eye off',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="currentcolor" stroke-width="20"><title>Eye Off</title><path d="M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 00.14-2.94L93.5 161.38a2 2 0 00-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0075.8-12.58 2 2 0 00.77-3.31l-21.58-21.58a4 4 0 00-3.83-1 204.8 204.8 0 01-51.16 6.47zM490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 00-74.89 12.83 2 2 0 00-.75 3.31l21.55 21.55a4 4 0 003.88 1 192.82 192.82 0 0150.21-6.69c40.69 0 80.58 12.43 118.55 37 34.71 22.4 65.74 53.88 89.76 91a.13.13 0 010 .16 310.72 310.72 0 01-64.12 72.73 2 2 0 00-.15 2.95l19.9 19.89a2 2 0 002.7.13 343.49 343.49 0 0068.64-78.48 32.2 32.2 0 00-.1-34.78z"></path><path d="M256 160a95.88 95.88 0 00-21.37 2.4 2 2 0 00-1 3.38l112.59 112.56a2 2 0 003.38-1A96 96 0 00256 160zM165.78 233.66a2 2 0 00-3.38 1 96 96 0 00115 115 2 2 0 001-3.38z"></path></svg>',
    },
    'cloud-upload': {
        name: 'cloud upload',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Cloud Upload</title><path d="M320 367.79h76c55 0 100-29.21 100-83.6s-53-81.47-96-83.6c-8.89-85.06-71-136.8-144-136.8-69 0-113.44 45.79-128 91.2-60 5.7-112 43.88-112 106.4s54 106.4 120 106.4h56" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-linejoin="round" d="M320 255.79l-64-64-64 64M256 448.21V207.79" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    download: {
        name: 'download',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Download</title><path d="M336 176h40a40 40 0 0140 40v208a40 40 0 01-40 40H136a40 40 0 01-40-40V216a40 40 0 0140-40h40" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path><path stroke-linecap="round" stroke-linejoin="round" d="M176 272l80 80 80-80M256 48v288" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    'person-circle': {
        name: 'person circle',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="currentcolor" stroke-width="20"><title>Person Circle</title><path d="M258.9 48C141.92 46.42 46.42 141.92 48 258.9c1.56 112.19 92.91 203.54 205.1 205.1 117 1.6 212.48-93.9 210.88-210.88C462.44 140.91 371.09 49.56 258.9 48zm126.42 327.25a4 4 0 01-6.14-.32 124.27 124.27 0 00-32.35-29.59C321.37 329 289.11 320 256 320s-65.37 9-90.83 25.34a124.24 124.24 0 00-32.35 29.58 4 4 0 01-6.14.32A175.32 175.32 0 0180 259c-1.63-97.31 78.22-178.76 175.57-179S432 158.81 432 256a175.32 175.32 0 01-46.68 119.25z"></path><path d="M256 144c-19.72 0-37.55 7.39-50.22 20.82s-19 32-17.57 51.93C191.11 256 221.52 288 256 288s64.83-32 67.79-71.24c1.48-19.74-4.8-38.14-17.68-51.82C293.39 151.44 275.59 144 256 144z"></path></svg>',
    },
    settings: {
        name: 'settings',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Settings</title><path d="M262.29 192.31a64 64 0 1057.4 57.4 64.13 64.13 0 00-57.4-57.4zM416.39 256a154.34 154.34 0 01-1.53 20.79l45.21 35.46a10.81 10.81 0 012.45 13.75l-42.77 74a10.81 10.81 0 01-13.14 4.59l-44.9-18.08a16.11 16.11 0 00-15.17 1.75A164.48 164.48 0 01325 400.8a15.94 15.94 0 00-8.82 12.14l-6.73 47.89a11.08 11.08 0 01-10.68 9.17h-85.54a11.11 11.11 0 01-10.69-8.87l-6.72-47.82a16.07 16.07 0 00-9-12.22 155.3 155.3 0 01-21.46-12.57 16 16 0 00-15.11-1.71l-44.89 18.07a10.81 10.81 0 01-13.14-4.58l-42.77-74a10.8 10.8 0 012.45-13.75l38.21-30a16.05 16.05 0 006-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 00-6.07-13.94l-38.19-30A10.81 10.81 0 0149.48 186l42.77-74a10.81 10.81 0 0113.14-4.59l44.9 18.08a16.11 16.11 0 0015.17-1.75A164.48 164.48 0 01187 111.2a15.94 15.94 0 008.82-12.14l6.73-47.89A11.08 11.08 0 01213.23 42h85.54a11.11 11.11 0 0110.69 8.87l6.72 47.82a16.07 16.07 0 009 12.22 155.3 155.3 0 0121.46 12.57 16 16 0 0015.11 1.71l44.89-18.07a10.81 10.81 0 0113.14 4.58l42.77 74a10.8 10.8 0 01-2.45 13.75l-38.21 30a16.05 16.05 0 00-6.05 14.08c.33 4.14.55 8.3.55 12.47z" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    mail: {
        name: 'mail',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Mail</title><rect x="48" y="96" width="416" height="320" rx="40" ry="40" stroke-linecap="round" stroke-linejoin="round" class="ionicon-fill-none ionicon-stroke-width"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M112 160l144 112 144-112" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
    call: {
        name: 'call',
        content:
            '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon s-ion-icon" viewBox="0 0 512 512" stroke="currentcolor" fill="none" stroke-width="20"><title>Call</title><path d="M451 374c-15.88-16-54.34-39.35-73-48.76-24.3-12.24-26.3-13.24-45.4.95-12.74 9.47-21.21 17.93-36.12 14.75s-47.31-21.11-75.68-49.39-47.34-61.62-50.53-76.48 5.41-23.23 14.79-36c13.22-18 12.22-21 .92-45.3-8.81-18.9-32.84-57-48.9-72.8C119.9 44 119.9 47 108.83 51.6A160.15 160.15 0 0083 65.37C67 76 58.12 84.83 51.91 98.1s-9 44.38 23.07 102.64 54.57 88.05 101.14 134.49S258.5 406.64 310.85 436c64.76 36.27 89.6 29.2 102.91 23s22.18-15 32.83-31a159.09 159.09 0 0013.8-25.8C465 391.17 468 391.17 451 374z" stroke-miterlimit="10" class="ionicon-fill-none ionicon-stroke-width"></path></svg>',
    },
};
