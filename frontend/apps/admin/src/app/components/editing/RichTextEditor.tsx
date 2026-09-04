import { Editor } from '@tinymce/tinymce-react';
import { getAvailableIcons, getIcon } from './IconDefinitions';
import styles from './RichTextEditor.module.scss';

const allowIcons = getAvailableIcons();

interface IconDataProperties {
    selectedColor: string;
    selectedIcon: string;
    scale: number;
    url: string;
    iframe: string;
}

const onSetupEditable = (editor: any) => (api: any) => {
    const nodeChanged = () => {
        api.setEnabled(editor.selection.isEditable());
    };
    editor.on('NodeChange', nodeChanged);
    nodeChanged();
    return () => {
        editor.off('NodeChange', nodeChanged);
    };
};

const isIcon = (element: Element, editor: any): boolean => {
    if (element.tagName === 'svg') {
        return true;
    }
    if (element.tagName === 'div' && element.hasAttribute('icon')) {
        return true;
    }
    if (editor.dom.getParent(element, 'svg')) {
        return true;
    }
    return false;
};
const getSelectedIcon = (editor: any): any => {
    if (!editor.selection) {
        return null;
    }
    let elem = editor.selection.getNode();

    if (elem.tagName === 'DIV') {
        return elem;
    }
    if (elem.tagName === 'SVG') {
        const divElem = editor.dom.getParent(elem, 'div');
        if (divElem) {
            return divElem;
        }
    }
    return null;
};

const getDefaultInitialData = (): IconDataProperties => {
    let lastOne = allowIcons[allowIcons.length - 1].value;
    return {
        selectedIcon: lastOne,
        selectedColor: '#0070C4',
        url: '',
        iframe:
            '<!DOCTYPE html>' +
            '<html><body>' +
            createSVGElement(1, lastOne, '0070C4', '').outerHTML +
            '</body></html>',
        scale: 1,
    };
};
const extractIconData = (divElem: any): IconDataProperties => {
    if (divElem) {
        let scale = parseInt(divElem.getAttribute('scale')) ?? 1;
        let url = divElem.hasAttribute('data-url') ? divElem.getAttribute('data-url') : '';
        let color = divElem.getAttribute('color');
        let iconName = divElem.getAttribute('icon-name');

        return {
            selectedIcon: iconName,
            selectedColor: color,
            scale: scale,
            url: url,
            iframe:
                '<!DOCTYPE html>' +
                '<html><body>' +
                createSVGElement(scale, iconName, color, url).outerHTML +
                '</body></html>',
        };
    } else {
        return getDefaultInitialData();
    }
};
const createDialog = (selectedDiv: any, editor: any) => {
    let data = extractIconData(selectedDiv);

    return {
        title: selectedDiv ? 'Modifying icon' : 'Select an icon to add',
        body: {
            type: 'panel',
            items: [
                {
                    type: 'selectbox', // component type
                    name: 'selectedIcon', // identifier
                    label: 'Icon',
                    enabled: true, // enabled state
                    size: 1, // number of visible values (optional)
                    items: allowIcons,
                    context: 'mode:design', // selectbox is active when the editor is in design mode, only effective when enabled is true
                },
                {
                    type: 'input',
                    name: 'url',
                    label: '(Optional) embedded URL',
                    enabled: true,
                },
                {
                    type: 'colorpicker', // component type
                    name: 'selectedColor', // identifier
                    label: 'Color', // text for the label
                    context: 'mode:design', // colorinput is active when the editor is in design mode, only effective when enabled is true
                },
                {
                    type: 'iframe',
                    name: 'iframe',
                    label: 'Icon', // text for the iframe's title attribute
                    sandboxed: true,
                    transparent: true,
                },
                {
                    type: 'slider',
                    name: 'scale',
                    label: '',
                    min: 1,
                    max: 10,
                },
            ],
        },
        buttons: [
            {
                type: 'cancel',
                name: 'closeButton',
                text: 'Cancel',
            },
            {
                type: 'custom',
                name: 'updateButton',
                text: 'Modify Color',
                buttonType: 'secondary',
            },
            {
                type: 'submit',
                name: 'submitButton',
                text: selectedDiv ? 'Update' : 'Add',
                buttonType: 'primary',
            },
        ],
        initialData: data,
        onAction: (api: any, details: any) => {
            if (details.name === 'updateButton') {
                updateIconPreview(api);
            }
        },
        onChange: (api: any, details: any) => {
            updateIconPreview(api);
        },
        onSubmit: (api: any) => {
            let content = updateIconPreview(api);
            if (selectedDiv) {
                editor.selection.setContent(content);
            } else {
                editor.insertContent(content);
            }
            api.close();
        },
    };
};
const SVGDialog = (editor: any) => {
    const open = () => {
        let selected = getSelectedIcon(editor);
        var dialog = createDialog(selected, editor);
        editor.windowManager.open(dialog);
    };
    return { open };
};
const createSVGElement = (scale: number, iconName: string, color: string, url: string): HTMLDivElement => {
    let size = (24 * scale).toString();

    const parser = new DOMParser();
    let svg = parser.parseFromString(getIcon(iconName).content, 'text/html').getElementsByTagName('svg')[0];
    svg.setAttribute('style', `color:${color}`);

    var result = document.createElement('div');
    result.setAttribute('icon-name', iconName);
    result.setAttribute('class', 'icon');
    result.setAttribute('color', color);
    result.setAttribute('scale', scale.toString());
    result.setAttribute('contenteditable', 'false');
    result.setAttribute('style', `display: inline-block; width:${size}px; height:${size}px`);
    if (url) {
        let link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
        link.appendChild(svg);
        result.setAttribute('data-url', url);
        result.appendChild(link);
    } else {
        result.appendChild(svg);
    }
    return result;
};
const updateIconPreview = (api: any): string => {
    const data = api.getData();
    const colorVal = data.selectedColor;
    const iconName = data.selectedIcon as string;
    const scale = data.scale as number;

    console.log(iconName);
    console.log(colorVal);

    var svgElement = createSVGElement(scale, iconName, colorVal, data.url);
    console.log(svgElement.outerHTML);

    api.setData({
        iframe: '<!DOCTYPE html>' + '<html><body>' + svgElement.outerHTML + '</body></html>',
    });
    return svgElement.outerHTML;
};

interface RichTextEditorProperties {
    content: string;
    height: number;
    onContentChange: (value: string) => void;
}
const tinymceScriptLocation = `${process.env.NX_PUBLIC_BASE_HREF}assets/tinymce/tinymce.min.js`;
const RichTextEditor: React.FC<RichTextEditorProperties> = ({
    content,
    height,
    onContentChange,
}): React.ReactElement => {
    return (
        <div className={styles['input-div']}>
            <Editor
                tinymceScriptSrc={tinymceScriptLocation}
                licenseKey="gpl"
                value={content}
                onEditorChange={(newValue, editor) => {
                    onContentChange(newValue);
                }}
                init={{
                    height: height,
                    menubar: false,
                    statusbar: false,
                    plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'code',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                        'code',
                        'help',
                        'wordcount',
                    ],
                    contextmenu: 'iconBtn link image table',
                    toolbar:
                        'undo redo | blocks | image | iconBtn |' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'code',
                    extended_valid_elements:
                        'svg[*],defs[*],pattern[*],desc[*],metadata[*],g[*],mask[*],path[*],line[*],marker[*],rect[*],circle[*],div[*]',
                    setup: (editor) => {
                        editor.ui.registry.addMenuItem('iconBtn', {
                            text: 'Icon',
                            onSetup: onSetupEditable(editor),
                            onAction: SVGDialog(editor).open,
                        });
                        editor.ui.registry.addContextMenu('iconBtn', {
                            update: (element) => {
                                console.log(element);
                                return isIcon(element, editor) ? 'iconBtn' : '';
                            },
                        });
                        editor.ui.registry.addButton('iconBtn', {
                            icon: 'accordion',
                            text: 'Add Icon',
                            tooltip: 'add icon',
                            onAction: () => {
                                SVGDialog(editor).open();
                            },
                        });
                        editor.on('PreInit', function () {
                            editor.schema.getNonEmptyElements().svg = {};
                        });
                    },
                }}
            />
        </div>
    );
};

export default RichTextEditor;
