import SelectBox from '@neos-project/react-ui-components/src/SelectBox/';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {$get, $transform} from 'plow-js';

import {selectors} from '@neos-project/neos-ui-redux-store';
import {neos} from '@neos-project/neos-ui-decorators';
import {executeCommand} from './../ckEditorApi';

import {isToolbarItemVisible, isToolbarItemActive} from './Helpers';

//
// Predicate matching all "element.id"s starting with "prefix".
//
const startsWith = prefix => element => element.id.startsWith(prefix);

/**
 * The Actual StyleSelect component
 */
@connect($transform({
    focusedNode: selectors.CR.Nodes.focusedSelector,
    currentlyEditedPropertyName: selectors.UI.ContentCanvas.currentlyEditedPropertyName,
    formattingUnderCursor: selectors.UI.ContentCanvas.formattingUnderCursor
}))
@neos(globalRegistry => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository'),
    toolbarRegistry: globalRegistry.get('ckEditor5').get('richtextToolbar')
}))

export default class StyleSelect extends PureComponent {
    static propTypes = {
        // The Registry ID/Key of the Style-Select component itself.
        id: PropTypes.string.isRequired,

        focusedNode: PropTypes.object,
        currentlyEditedPropertyName: PropTypes.string,
        formattingUnderCursor: PropTypes.objectOf(PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.bool,
            PropTypes.string,
            PropTypes.object
        ])),

        nodeTypesRegistry: PropTypes.object.isRequired,
        toolbarRegistry: PropTypes.object.isRequired
    };

    handleOnSelect = selectedStyleId => {
        const {toolbarRegistry} = this.props;
        const style = toolbarRegistry.get(selectedStyleId);
        if (style && style.commandName) {
            executeCommand(style.commandName, ...style.commandArgs);
        } else {
            console.warn('Style formatting not set: ', selectedStyleId, style);
        }
    }

    render() {
        const {nodeTypesRegistry, toolbarRegistry, currentlyEditedPropertyName, focusedNode} = this.props;
        const nodeTypeName = $get('nodeType', focusedNode);

        const inlineEditorOptions = nodeTypesRegistry.getInlineEditorOptionsForProperty(nodeTypeName, currentlyEditedPropertyName);
        const nestedStyles = toolbarRegistry.getAllAsList()
            .filter(startsWith(`${this.props.id}/`))
            .filter(isToolbarItemVisible(inlineEditorOptions || []));

        const options = nestedStyles.map(style => ({
            label: style.label,
            value: style.id
        }));

        if (options.length === 0) {
            return null;
        }

        const selectedStyle = nestedStyles.find(
            isToolbarItemActive(this.props.formattingUnderCursor, inlineEditorOptions)
        );

        return (
            <SelectBox
                options={options}
                value={selectedStyle ? selectedStyle.id : null}
                onValueChange={this.handleOnSelect}
                />
        );
    }
}
