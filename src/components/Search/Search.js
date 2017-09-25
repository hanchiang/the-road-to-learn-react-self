import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Search extends Component {
    componentDidMount() {
        this.input.focus();
        const val = this.input.value;
        this.input.value = "";
        this.input.value = val;
    }

    render() {
        const { searchTerm, onChange, onSubmit, children } = this.props;

        return (
            <form onSubmit={onSubmit}>
                {children}{' '}

                <input type="text" value={searchTerm} onChange={onChange} ref={(node) => this.input = node} />
                <button>Search</button>
            </form>
            
        )
    }
}
Search.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};

export default Search;