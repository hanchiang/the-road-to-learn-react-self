import React, { Component } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import logo from './logo.svg';
import './App.css';


const BASE_URL = 'https://hn.algolia.com/api/v1/';
const PATH_SEARCH = 'search';
const PARAM_SEARCH = 'query=';

const PATH_HPP = 'hitsPerPage=';
const DEFAULT_QUERY_HPP = 100;
const PATH_PAGE = 'page=';
const DEFAULT_PAGE = 0;
const DEFAULT_QUERY = "react";

function Loading() {
    return <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>;
}

const withLoading = (Component) => (props) =>
    props.isLoading
    ? <Loading />
    : <Component {...props} />

const ButtonWithLoading = withLoading(Button);

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


const SORTS = {
    NONE: (list) => list,
    TITLE: (list) => sortBy(list, "title"),
    AUTHOR: (list) => sortBy(list, "author"),
    COMMENTS: (list) => sortBy(list, "comments").reverse(),
    POINTS: (list) => sortBy(list, "points").reverse()
};

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

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sortKey: "NONE",
            isSortReverse: false
        }

        this.onSort = this.onSort.bind(this);
    }

    onSort(sortKey) {
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
        this.setState({ sortKey, isSortReverse });
    }

    render() {
        const { list, onDismiss } = this.props;
        const { sortKey, isSortReverse } = this.state;
        const sortedList = SORTS[sortKey](list);
        const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

        return (
            <div className="table">
                <div className="table-row">
                        <span style={{width: '40%'}}>
                            <Sort onSort={this.onSort} sortKey="TITLE" activeSortKey={sortKey} isSortReverse={isSortReverse}>Title</Sort>
                        </span>
                        <span style={{width: '30%'}}>
                            <Sort onSort={this.onSort} sortKey="AUTHOR" activeSortKey={sortKey} isSortReverse={isSortReverse}>Author</Sort>
                        </span>
                        <span style={{width: '10%'}}>
                            <Sort onSort={this.onSort} sortKey="COMMENTS" activeSortKey={sortKey} isSortReverse={isSortReverse}>Comments</Sort>
                        </span>
                        <span style={{width: '10%'}}>
                            <Sort onSort={this.onSort} sortKey="POINTS" activeSortKey={sortKey} isSortReverse={isSortReverse}>Points</Sort>
                        </span>
                        <span style={{width: '10%'}}>Archive</span>
                </div>

                { reverseSortedList.map(item => 
                    <div className="table-row" key={item.objectID}>
                        <span style={{width: '40%'}}><a href={item.url}>{item.title}</a></span>
                        <span style={{width: '30%'}}>{item.author}</span>
                        <span style={{width: '10%'}}>{item.num_comments}</span>
                        <span style={{width: '10%'}}>{item.points}</span>
                        <span style={{width: '10%'}}>
                            <Button
                                type="button"
                                onClick={() => onDismiss(item.objectID)}
                                className="button-inline"
                            >
                                Dismiss
                            </Button>
                        </span>
                    </div>
                )}
            </div>
        )
    }
}
Table.propTypes = {
    list: PropTypes.arrayOf(
        PropTypes.shape({
            objectID: PropTypes.string.isRequired,
            url: PropTypes.string,
            author: PropTypes.string,
            num_comments: PropTypes.number,
            points: PropTypes.number,
        })
    ).isRequired,
    onDismiss: PropTypes.func.isRequired
};

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
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: null,
            searchTerm: DEFAULT_QUERY,
            searchKey: DEFAULT_QUERY,
            isLoading: false
        };

        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
        this.onDismiss  = this.onDismiss.bind(this);
        this.getMore = this.getMore.bind(this);
    }

    componentDidMount() {
        console.log('component did mount');

        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        this.fetchTopStories(searchTerm, DEFAULT_PAGE);
    }

    setTopStories(response) {
        console.log(response);
        const {searchKey, results} = this.state;
        const {hits, page} = response;

        // Merge old hits with new hits if it exist in results
        const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
        const updatedHits = [...oldHits, ...response.hits];
        this.setState({
            results: {
                // Copy the entire results object, then overwrite the searchKey result property with the updated hits
                ...results,
                [searchKey]: {hits: updatedHits, page}
            },
            isLoading: false
        });
    }

    fetchTopStories(searchTerm, page) {
        this.setState({ isLoading: true });

        const url = `${BASE_URL}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PATH_HPP}${DEFAULT_QUERY_HPP}&${PATH_PAGE}${page}`;
        fetch(url).then(response =>  {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network error!');
            }
        }).then(result => {
            this.setTopStories(result);
        }).catch(error => {
            console.log(`Error occurred: ${error}`);
        })
    }

    onSearchChange(event) {
        this.setState({searchTerm: event.target.value});
    }

    shouldFetchTopStories(searchTerm) {
        const {results} = this.state;
        return !results[searchTerm];
    }

    onSearchSubmit(event) {
        const {searchTerm} = this.state;
        event.preventDefault();

        this.setState({searchKey: searchTerm});

        // Do API call only if necessary
        if (this.shouldFetchTopStories(searchTerm)) {
            this.fetchTopStories(searchTerm, DEFAULT_PAGE);
        }
        
    }

    onDismiss(id) {
        const {results, searchKey} = this.state;
        const {page, hits} = results[searchKey];

        const filtered = hits.filter(item => item.objectID !== id);
        this.setState({
            results: {
                // Copy the entire results object, then overwrite the searchKey result property with the updated hits
                ...results,
                [searchKey]: {hits: filtered, page}
            }
        });
    }

    getMore() {
        const {searchKey, results} = this.state;
        const {page} = results[searchKey];
        this.fetchTopStories(searchKey, page+1);
    }

    render() {
        console.log(this.state);

        const helloWorld = 'Welcome to the Road to learn React';
        const now = new Date().toLocaleTimeString();

        const {searchTerm, searchKey, results, isLoading } = this.state;

        const list = (results && results[searchKey] && results[searchKey].hits) || [];

        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>{helloWorld}</h2>
                    <p>Time now is {now}</p>
                </div>

                <div className="page">
                    <div className="interactions">
                        <Search
                            searchTerm={searchTerm}
                            onChange={this.onSearchChange}
                            onSubmit={this.onSearchSubmit}
                        >
                            Search for item
                        </Search>

                        <ButtonWithLoading
                            isLoading={isLoading}
                            onClick={this.getMore}
                        >
                            More
                        </ButtonWithLoading>

                        <Table
                            list={list}
                            onDismiss={this.onDismiss}
                        >
                        </Table>
                                     
                    </div>                 
                </div>
          </div>
        );
  }
}

export default App;
