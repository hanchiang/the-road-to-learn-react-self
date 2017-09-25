import React, { Component } from 'react';


import PropTypes from 'prop-types';
import logo from '../../logo.svg';
import './App.css';

// Import our codes
import {BASE_URL, PATH_SEARCH, PARAM_SEARCH, PATH_HPP, DEFAULT_QUERY_HPP, PATH_PAGE, DEFAULT_PAGE, DEFAULT_QUERY} from '../../constants';
import Button from '../Button/Button';
import Table from '../Table/Table';
import Search from '../Search/Search';



function Loading() {
    return <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>;
}

const withLoading = (Component) => (props) =>
    props.isLoading
    ? <Loading />
    : <Component {...props} />

const ButtonWithLoading = withLoading(Button);


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

                        <ButtonWithLoading isLoading={isLoading} onClick={this.getMore}>More</ButtonWithLoading>

                        <Table list={list} onDismiss={this.onDismiss} />
                                     
                    </div>                 
                </div>
          </div>
        );
  }
}

export default App;
