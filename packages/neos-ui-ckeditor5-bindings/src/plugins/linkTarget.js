import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {downcastAttributeToElement} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import {upcastElementToAttribute} from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import LinkAttributeCommand from './linkAttributeCommand';

const TARGET = 'linkTarget';

export default class TargetBlank extends Plugin {
    static get pluginName() {
        return 'LinkTarget';
    }
    init() {
        const editor = this.editor;
        editor.model.schema.extend('$text', {allowAttributes: TARGET});

        editor.conversion.for('downcast').add(downcastAttributeToElement({
            model: TARGET,
            view: (value, writer) => writer.createAttributeElement('a', {
                target: value
            }, {
                // the priority has got to be the same as here so the elements would get merged:
                // https://github.com/ckeditor/ckeditor5-link/blob/20e96361014fd13bfb93620f5eb5f528e6b1fe6d/src/utils.js#L33
                priority: 5
            }),
            converterPriority: 'high'
        }));

        editor.conversion.for('upcast').add(upcastElementToAttribute({
            view: {
                name: 'a',
                attributes: {
                    target: true
                }
            },
            model: {
                key: TARGET,
                value: viewElement => viewElement.getAttribute('target')
            },
            converterPriority: 'high'
        }));

        editor.commands.add(TARGET, new LinkAttributeCommand(this.editor, TARGET));
    }
}
