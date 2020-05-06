import React, { Component } from 'react';
import axios from 'axios';
import './JokeList.css';
import Joke from './Joke';

class JokeList extends Component {
	static defaultProps = {
		numJokesToGet: 10
	};

	constructor() {
		super();
		this.state = {
			isLoading: false,
			jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]')
		};
		this.seenJokes = new Set(this.state.jokes.text);
	}

	async componentDidMount() {
		if (this.state.jokes.length === 0) this.setState({ isLoading: true }, this.getJokes);
	}

	getJokes = async () => {
		try {
			const jokes = [];
			while (jokes.length < this.props.numJokesToGet) {
				let res = await axios.get('https://icanhazdadjoke.com/', {
					headers: {
						Accept: 'application/json'
					}
				});
				if (!this.seenJokes.has(res.data.joke)) {
					jokes.push({
						text: res.data.joke,
						votes: 0
					});
				}
			}

			this.setState(
				(st) => ({
					isLoading: false,
					jokes: [ ...jokes, ...st.jokes ]
				}),
				() => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
			);
		} catch (error) {
			alert(error);
			this.setState({ isLoading: false });
		}
	};

	handleClick = () => {
		this.setState({ isLoading: true }, this.getJokes);
	};

	handleVote = (id, delta) => {
		const { jokes } = this.state;
		const newJokes = jokes.map((j, i) => (i === id ? { ...j, votes: j.votes + delta } : j));
		this.setState({ jokes: newJokes }, () => window.localStorage.setItem('jokes', JSON.stringify(newJokes)));
	};

	render() {
		if (this.state.isLoading) {
			return (
				<div className="spinner">
					<i className="far fa-8x fa-laugh fa-spin" />
					<h1>Loading...</h1>
				</div>
			);
		}
		return (
			<div className="JokeList">
				<div className="JokeList-sidebar">
					<h3 className="JokeList-title">
						<span>Dad</span> Jokes {this.state.jokes.length}
					</h3>
					<img
						src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
						alt="l"
					/>
					<button className="JokeList-getmore" onClick={this.handleClick}>
						New Jokes
					</button>
				</div>

				<div className="JokeList-jokes">
					{this.state.jokes
						.sort((a, b) => b.votes - a.votes)
						.map((j, i) => (
							<Joke id={i} key={i} text={j.text} votes={j.votes} handleVote={this.handleVote} />
						))}
				</div>
			</div>
		);
	}
}

export default JokeList;
