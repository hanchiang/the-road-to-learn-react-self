import React from 'react';
import PropTypes from 'prop-types';

function Button({ onClick, children, className }) {
    return (
        <button 
            onClick={onClick}
            type="button"
            className={className}
        >
            {children}
        </button>
    )
}
Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};
Button.defaultProps = {
    className: ''
};

export default Button;