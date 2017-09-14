import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


const BASE_URL = 'http://hn.algolia.com/api/v1/';
const PATH_SEARCH = 'search';
const PARAM_SEARCH = 'query=';

const PATH_HPP = 'hitsPerPage=';
const DEFAULT_QUERY_HPP = '100';
const PATH_PAGE = 'page=';
const DEFAULT_PAGE = 0;

class DismissButton extends Component {
    constructor(props) {
        super(props);

        this.handleDismiss = this.handleDismiss.bind(this);
    }

    handleDismiss() {
        const {id, onClick} = this.props;
        onClick(id);
    }

    render() {
        const {children, onClick, className=''} = this.props;

        return (
            <button 
                onClick={this.handleDismiss}
                type="button"
            >
                {children}
            </button>
        )
    }
}

function Table(props) {
    const {list, onDismiss} = props;
       
    return (
        <div className="table">
            <div className="table-row">
                    <span style={{width: '40%'}}><strong>Title</strong></span>
                    <span style={{width: '30%'}}><strong>Author</strong></span>
                    <span style={{width: '10%'}}><strong>Comments</strong></span>
                    <span style={{width: '10%'}}><strong>Points</strong></span>
                    <span style={{width: '10%'}}></span>
            </div>

            {list.map(item => 
                <div className="table-row" key={item.objectID}>
                    <span style={{width: '40%'}}><a href={item.url}>{item.title}</a></span>
                    <span style={{width: '30%'}}>{item.author}</span>
                    <span style={{width: '10%'}}>{item.num_comments}</span>
                    <span style={{width: '10%'}}>{item.points}</span>
                    <span style={{width: '10%'}}>
                        <DismissButton
                            type="button"
                            onClick={onDismiss}
                            id={item.objectID}
                        >
                            Dismiss
                        </DismissButton>
                    </span>
                </div>
            )}
        </div>
    )
}

class Search extends Component {
    render() {
        const {searchTerm, onChange, onSubmit, children} = this.props;

        return (
            <form onSubmit={onSubmit}>
                {children}{' '}

                <input type="text" value={searchTerm} onChange={onChange} />

                <button>Search</button>
            </form>
            
        )
    }
}

// results is a map of searchKey to the query result
class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: null,
            searchTerm: 'react',
            searchKey: 'react'
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
            }
        });
    }

    fetchTopStories(searchTerm, page) {
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

        const {searchTerm, searchKey, results} = this.state;

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

                        <button
                            onClick={this.getMore}
                        >
                            More
                        </button>
                        
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
