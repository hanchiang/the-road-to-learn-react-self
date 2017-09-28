import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import Button from '../Button/Button';
import SortCaret from './SortCaret';

function Sort({onSort, sortKey, children, activeSortKey, isSortReverse}) {
    const handleSort = () => onSort(sortKey);

    const sortClass = classNames("button-inline", {
        "button-active": sortKey === activeSortKey
    });

    return <Button onClick={handleSort} className={sortClass}>
        { children }
        <SortCaret sortKey={sortKey} activeSortKey={activeSortKey} isSortReverse={isSortReverse} />
    </Button>
}
Sort.propTypes = {
	onSort: PropTypes.func.isRequired,
	sortKey: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
	activeSortKey: PropTypes.string.isRequired,
	isSortReverse: PropTypes.bool.isRequired
};

export default Sort;