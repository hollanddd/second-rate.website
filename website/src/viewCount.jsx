import React, { Component } from "react"
import axios from 'axios';

// namespace is the name of the site used in the hit tracking path.
const namespace = "second-rate"

// tracker is an axios instance wired to the tracking url
const instance = axios.create({
  baseURL: process.env.REACT_APP_HIT_URL + namespace,
  timeout: 1000,
});

class ViewCount extends Component {
  constructor(props) {
    super(props)
 	  this.state = { count: 0 };
  }

  async componentDidMount () {
    try {
      const res = await instance.get(window.location.pathname);
      this.setState({ count: res.data.count });
    } catch(error) {
      console.log(error)
    }
  }

  render () {
    return (<div id="count">{this.state.count}</div>);
  }
}

export default ViewCount;
