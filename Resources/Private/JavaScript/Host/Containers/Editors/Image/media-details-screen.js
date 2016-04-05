import React, {PropTypes} from 'react';
import {
    FullscreenContentOverlay
} from 'Components/index';
import style from './style.css';

const MediaDetailsScreen = (props) => {
    window.Typo3MediaBrowserCallbacks = {
        close() {
            props.onClose();
        }
    };
    return (<FullscreenContentOverlay onClose={props.onClose}>
        <iframe src={`/neos/content/images/edit.html?asset[__identity]=${props.imageIdentity}`} className={style.mediaSelectionScreen__iframe} />
    </FullscreenContentOverlay>);
};

MediaDetailsScreen.propTypes = {
    onClose: PropTypes.func.isRequired,
    imageIdentity: PropTypes.string.isRequired
};

export default MediaDetailsScreen;
