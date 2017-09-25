import React from 'react';
import PropTypes from 'prop-types';

function SortCaret({sortKey, activeSortKey, isSortReverse}) {
    let sortCaret = null;
    if (sortKey === activeSortKey) {
        if (!isSortReverse && (sortKey !== "COMMENTS" && sortKey !== "POINTS") ||
            (isSortReverse && (sortKey === "COMMENTS" || sortKey === "POINTS"))) {
            sortCaret = <i className="fa fa-chevron-up" aria-hidden="true"></i>
        } else if (isSortReverse && (sortKey !== "COMMENTS" && sortKey !== "POINTS") ||
            (!isSortReverse && (sortKey === "COMMENTS" || sortKey === "POINTS"))) {
            sortCaret = <i className="fa fa-chevron-down" aria-hidden="true"></i>
        }
    }
    return sortCaret;
}
SortCaret.propTypes = {
    sortKey: PropTypes.string.isRequired,
    activeSortKey: PropTypes.string.isRequired,
    isSortReverse: PropTypes.bool.isRequired
};

export default SortCaret;